/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NotifyKinds, Ok, Err } from "./response";

import { defaults } from "../defaults";

import { AxiosInstance } from "axios";

// eslint-disable-next-line prettier/prettier
export type Request4<T, R, V, W> = [Promise<Response<T>>, Promise<Response<R>>, Promise<Response<V>>, Promise<Response<W>>];
// eslint-disable-next-line prettier/prettier
export type Request3<T, R, V> = [Promise<Response<T>>, Promise<Response<R>>, Promise<Response<V>>];
// eslint-disable-next-line prettier/prettier
export type Request2<T, R>  = [Promise<Response<T>>, Promise<Response<R>>];
// eslint-disable-next-line prettier/prettier
export type Request1<T> = Promise<Response<T>>[];

// eslint-disable-next-line prettier/prettier
export type Return4<T, R, V, W> = Response<[Response<T>, Response<R>, Response<V>, Response<W>]>;
// eslint-disable-next-line prettier/prettier
export type Return3<T, R, V> = Response<[Response<T>, Response<R>, Response<V>]>;
// eslint-disable-next-line prettier/prettier
export type Return2<T, R> = Response<[Response<T>, Response<R>]>;
// eslint-disable-next-line prettier/prettier
export type Return1<T> = Response<T[]>;

export interface Config4<T, R, V, W> extends Config {
  readonly requests: Request4<T, R, V, W>;
  ifOk?: (ok: [T, R, V, W]) => void;
}

export interface Config3<T, R, V> extends Config {
  readonly requests: Request3<T, R, V>;
  ifOk?: (ok: [T, R, V]) => void;
}

export interface Config2<T, R> extends Config {
  readonly requests: Request2<T, R>;
  ifOk?: (ok: [T, R]) => void;
}

export interface Config1<T> extends Config {
  readonly requests: Request1<T>;
  ifOk?: (ok: T[]) => void;
}

// Internal functions, interfaces, type definitions and constants.

type Return<T, R, V, W> =
  | Return4<T, R, V, W>
  | Return3<T, R, V>
  | Return2<T, R>
  | Return1<T>;

interface Config {
  readonly requests: Promise<Response>[];
  notify?: NotifyKinds;
  finally?: () => void;

  ifOk?: (ok: any) => void;
  ifErr?: (err: Err) => void;
}

function isConfig(obj: unknown | undefined): obj is Config {
  return typeof obj === "object" && obj !== null && "requests" in obj;
}

/**
 * Make multiple requests in parallel and return a single Response with inner responses as payload.
 *
 * @param this the axios instance to use internally.
 * @param config the overloaded options to make the requests.
 * @returns the Response with inner responses inside.
 */
export async function buildResponses<T, R = void, V = void, W = void>(
  this: AxiosInstance,
  config: Config | Promise<Response>[]
): Promise<Return<T, R, V, W>> {
  const [promises, reqOpts] = isConfig(config)
    ? [config.requests, config]
    : [config, undefined];

  const responses = await Promise.allSettled(promises);

  const promCount = promises.length;
  const resCount = responses.length;

  const oks: [number, Ok][] = [];
  const errs: [number, Err][] = [];

  const result: Return<T, R, V, W> = (() => {
    if (promCount === resCount) {
      for (const [idx, res] of responses.entries()) {
        if (res.status === "fulfilled") {
          res.value.fold({
            ifOk: (ok) => oks.push([idx, ok]),
            ifErr: (err) => errs.push([idx, err]),
          });
        } else {
          errs.push([idx, new Err({ error: res.reason })]);
        }
      }

      const okCount = oks.length;
      const errCount = errs.length;

      // All ok!
      if (okCount === resCount) {
        const values = oks.map(([, val]) => val.payload);
        return new Ok({
          payload: values,
          notify: reqOpts?.notify ?? defaults.notify,
        });
      }

      // All errors
      if (errCount === resCount) {
        return new Err({
          error: errs.length > 0 ? errs[0][1].getError() : undefined,
          notify: reqOpts?.notify ?? defaults.notify,
        });
      }

      // Some errors
      return new Err({
        error: errs.length > 0 ? errs[0][1].getError() : undefined,
        notify: reqOpts?.notify ?? defaults.notify,
      });
    }
    // The number of HTTP responses does not match the number of HTTP requests.
    else {
      return new Err({
        notify: reqOpts?.notify ?? defaults.notify,
      });
    }
  })();

  const fold = result.fold({
    ifOk: () =>
      reqOpts?.ifOk ? reqOpts.ifOk(oks.map(([, x]) => x.payload)) : undefined,
    ifErr: reqOpts?.ifErr,
  });

  await Promise.resolve(fold);

  reqOpts?.finally?.();

  return result;
}

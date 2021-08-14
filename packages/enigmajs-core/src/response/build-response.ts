import {
  ConfigLiteral,
  Err,
  IErr,
  IOk,
  NotifyKinds,
  Ok,
  Response,
  makeErrUrl,
} from "./response";

import { defaults } from "../defaults";
import { Paginator } from "../paginator";

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export interface Options {
  attempts?: number;
  paginated?: boolean;

  notify?: NotifyKinds;
  errMessage?: string;
  okMessage?: string;

  // Fold options.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ifOk?: (ok: any) => void | Promise<void>;
  ifErr?: (err: Err) => void | Promise<void>;
  // Either Ok or Err callback
  finally?: () => void;
}

export interface ConfigObject extends Options {
  request: ConfigLiteral;
}

export interface ConfigExact<T> extends ConfigObject {
  paginated?: false;
  ifOk?: (ok: Ok<T>) => void | Promise<void>;
}

export interface OptionsExact<T> extends Options {
  paginated?: false;
  ifOk?: (ok: Ok<T>) => void | Promise<void>;
}

export interface ConfigPaginated<T> extends ConfigObject {
  paginated: true;
  ifOk?: (ok: Ok<Paginator<T>>) => void | Promise<void>;
}

export interface OptionsPaginated<T> extends Options {
  paginated: true;
  ifOk?: (ok: Ok<Paginator<T>>) => void | Promise<void>;
}

export interface ConfigBoth<T> extends ConfigObject {
  paginated: boolean;
  ifOk?: (ok: Ok<T | Paginator<T>>) => void | Promise<void>;
}

export interface OptionsBoth<T> extends Options {
  paginated: boolean;
  ifOk?: (ok: Ok<T | Paginator<T>>) => void | Promise<void>;
}

// Internal functions. interfaces, type definitions and constants.

function isConfigObject(obj: unknown | undefined): obj is ConfigObject {
  return typeof obj === "object" && obj !== null && "request" in obj;
}

/**
 * Make a single requests and return a Response object.
 *
 * @param this the axios instance to use internally.
 * @param config the request payload.
 * @param opts the requests options for internal handling.
 * @returns the parsed Response from the clean request.
 */
export async function buildResponse<T>(
  this: AxiosInstance,
  config: ConfigLiteral | ConfigObject,
  opts?: Options
): Promise<Response<T | Paginator<T>>> {
  const [reqConfig, reqOpts, foldOpts] = isConfigObject(config)
    ? [config.request, config, { ifOk: config.ifOk, ifErr: config.ifErr }]
    : [config, opts, { ifOk: opts?.ifOk, ifErr: opts?.ifErr }];

  const attempts = reqOpts?.attempts ?? defaults.attempts;
  const paginated = reqOpts?.paginated ?? false;

  const resOpts = await (async () => {
    for (let i = 0; i < attempts; i++) {
      try {
        const config = reqConfig as string & AxiosRequestConfig;
        const { data, request, status } = await this(config);

        const iOk: IOk<T> = {
          payload: paginated ? new Paginator(data) : data,
          requestURL: request.responseURL,
          status: status,
          notify: reqOpts?.notify ?? defaults.notify,
          message: reqOpts?.okMessage,
        };

        return iOk;
      } catch (e) {
        if (i + 1 === attempts && axios.isAxiosError(e)) {
          const iErr: IErr = {
            error: e.response?.data,
            requestURL: e.request?.responseURL ?? makeErrUrl(e),
            status: e.response?.status,
            notify: reqOpts?.notify ?? defaults.notify,
            message: reqOpts?.errMessage,
          };

          return iErr;
        }
      }
    }

    return undefined;
  })();

  const response = Response.factory<T>(resOpts);

  const fold = response.fold(foldOpts);
  await Promise.resolve(fold);

  reqOpts?.finally?.();

  return response;
}

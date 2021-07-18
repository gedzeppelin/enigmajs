/* eslint-disable @typescript-eslint/no-explicit-any */
import { defaults } from "../defaults";
import { extractString } from "../utils";

import { AxiosError, AxiosRequestConfig } from "axios";
import { Notyf } from "notyf";
import { isNil } from "lodash";

export type ConfigLiteral = string | AxiosRequestConfig;

export type NotifyType = "success" | "error" | "warning";
export type NotifyKinds = "always" | "ifOk" | "ifErr" | false | undefined;

export interface FoldOptions<T> {
  ifOk?: (ok: Ok<T>) => void;
  ifErr?: (err: Err) => void;
}

export interface MapOptions<T, E> {
  ifOk: (ok: Ok<T>) => E;
  ifErr: (err: Err) => E;
}

if (defaults.notifier instanceof Notyf) {
  const element = document.createElement("link");
  element.setAttribute("rel", "stylesheet");
  element.setAttribute("type", "text/css");
  element.setAttribute(
    "href",
    "https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css"
  );
  document.getElementsByTagName("head")[0].appendChild(element);
}

/**
 * Response base class.
 */
export abstract class Response<T = any> {
  public readonly requestURL?: string;
  public readonly status?: number;
  public readonly message?: string;

  public constructor(requestURL?: string, status?: number, message?: string) {
    this.requestURL = requestURL;
    this.status = status;
    this.message = message;
  }

  public static factory<T>(opt: IOk<T> | IErr | undefined | null): Response<T> {
    if (isNil(opt)) {
      return new Err();
    }

    if (isIOk(opt)) {
      return new Ok<T>(opt);
    }

    return new Err(opt);
  }

  public abstract notify(opt: NotifyKinds): void;
  public abstract fold(opts: FoldOptions<T>): void;
  public abstract map<E>(opts: MapOptions<T, E>): E;

  public get isOk(): boolean {
    return this instanceof Ok;
  }

  public get isErr(): boolean {
    return this instanceof Err;
  }
}

// Response helpers

export interface IOk<T> {
  payload: T;
  requestURL?: string;
  status?: number;

  notify?: NotifyKinds;
  message?: string;
}

export function isIOk(obj: unknown): obj is IOk<any> {
  return typeof obj === "object" && obj !== null && "payload" in obj;
}

export interface IErr {
  error?: unknown;
  requestURL?: string;
  status?: number;

  notify?: NotifyKinds;
  message?: string;
}

export function isIErr(obj: unknown): obj is IErr {
  return typeof obj === "object" && obj !== null && "error" in obj;
}

interface ErrInfo {
  property: string;
  errors: string[];
}

export function makeErrUrl(e: AxiosError): string {
  const url = new URL(e.config.url ?? "/", e.config.baseURL);
  const params = Object.entries(e.config.params ?? [])
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return `${url}?${params}`;
}

/**
 * Ok class.
 */
export class Ok<T = any> extends Response<T> {
  public payload: T;

  public constructor(opts: IOk<T>) {
    super(opts.requestURL, opts.status, opts.message);
    this.payload = opts.payload;

    this.notify(opts.notify);
  }

  public notify(opt: NotifyKinds): void {
    if (opt && (opt === "ifOk" || opt === "always")) {
      const label = extractString(defaults.successLabel);

      defaults.notifier.success(
        // eslint-disable-next-line prettier/prettier
       `<div style="margin-bottom: 8px;">
          <b style="font-size: 22px;">${label}</b>
        </div>
        <div>${this.message ?? extractString(defaults.successMessage)}</div>`
      );
    }
  }

  public fold(opts: FoldOptions<T>): void {
    return opts.ifOk?.(this);
  }

  public map<E>(opts: MapOptions<T, E>): E {
    return opts.ifOk(this);
  }
}

/**
 * Err class.
 */
export class Err extends Response<never> {
  private error?: string;
  private messages?: ErrInfo[];

  public constructor(opts?: IErr) {
    if (isNil(opts)) {
      return;
    }

    super(opts.requestURL, opts.status, opts.message);

    if (
      typeof opts.error === "object" &&
      opts.error !== undefined &&
      opts.error !== null
    ) {
      const err = opts.error as Record<string, unknown>;

      if ("error" in err && typeof err.error === "string") {
        this.error = err.error;
      }

      if (
        "messages" in err &&
        Array.isArray(err.messages) &&
        err.messages.length > 0
      ) {
        const messages = err.messages.filter((x) => isErrInfo(x));

        if (messages.length > 0) {
          this.messages = messages;
        }
      }
    }

    this.notify(opts.notify);
  }

  public notify(opt: NotifyKinds): void {
    if (opt && (opt === "ifErr" || opt === "always")) {
      const label = extractString(defaults.errorLabel);

      defaults.notifier.error(
        // eslint-disable-next-line prettier/prettier
       `<div style="margin-bottom: 8px;">
          <b style="font-size: 22px;">${label}</b>
        </div>
        <div>${this.getError()}</div>`
      );
    }
  }

  public fold(opts: FoldOptions<never>): void {
    return opts.ifErr?.(this);
  }

  public map<E>(opts: MapOptions<never, E>): E {
    return opts.ifErr(this);
  }

  public get hasData(): boolean {
    return (
      this.error !== undefined ||
      (this.messages !== undefined && this.messages.length > 0)
    );
  }

  public getError(): string {
    if (this.message) {
      return this.message;
    }

    if (this.error) {
      return this.error;
    }

    if (this.messages && this.messages.length > 0) {
      return this.messages
        .map(
          (message) =>
            // eslint-disable-next-line prettier/prettier
           `<div>
              <b style="text-transform: capitalize;">${message.property}:</b>
              <ul style="margin-top: 2px; padding-left: 18px;">
                ${message.errors.map((e) => `<li>${e}</li>`).join("")}
              </ul>
            </div>`
        )
        .join("");
    }

    return extractString(defaults.errorMessage);
  }
}

function isErrInfo(obj?: unknown): obj is ErrInfo {
  if (obj && typeof obj === "object" && "property" in obj && "errors" in obj) {
    const e = obj as { property: unknown; errors: unknown };
    return typeof e.property === "string" && Array.isArray(e.errors);
  }

  return false;
}

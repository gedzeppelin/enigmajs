import { T } from "enigmajs-core";

import { assignWith, isUndefined } from "lodash";

import { Router } from "vue-router";

interface Options {
  appName?: string;
  baseURL?: string;

  router: Router;
  t: T;
}

export const options = {} as Options;

export function setOptions(opts: Partial<Options>): void {
  assignWith(options, opts, (objValue, srcValue) =>
    isUndefined(objValue) ? srcValue : objValue
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const t: T = (...args: any[]) => options.t(...args);

import { Router } from "vue-router";
import { assignWith, isUndefined } from "lodash";

import { T } from "enigmajs-core";

import { Locale } from "./plugins/axios";

interface Options {
  router: Router;
  t: T;
  locale?: Locale;
}

export const options = {} as Options;

export function setOptions(opts: Partial<Options>): void {
  assignWith(options, opts, (objValue, srcValue) =>
    isUndefined(objValue) ? srcValue : objValue
  );
}

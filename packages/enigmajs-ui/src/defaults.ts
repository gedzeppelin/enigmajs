/* eslint-disable @typescript-eslint/no-explicit-any */
import { assignWith, isUndefined } from "lodash";

import type { Composer } from "vue-i18n";

type T = (...args: any[]) => string;
type Locale = Composer["locale"];

interface Defaults {
  locale: Locale;
  t: T;
}

export const defaults = {} as Defaults;

export function setEgDefaults(opts: Partial<Defaults>): void {
  assignWith(defaults, opts, (objValue, srcValue) =>
    isUndefined(objValue) ? srcValue : objValue
  );
}

export const t: T = (...args: any[]) => defaults.t(...args);

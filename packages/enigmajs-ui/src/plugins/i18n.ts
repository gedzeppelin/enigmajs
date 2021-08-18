import { App, inject, InjectionKey, Plugin } from "vue";
import { T } from "enigmajs-core";
import { get } from "lodash";

import english from "../i18n/en";

interface I18n {
  locale: string;
  t: T;
}

export const I18N_KEY: InjectionKey<I18n> = Symbol("eg.i18n_hook");

const plugin: Plugin = (app: App, _t: T) => {
  const i18n: I18n = {
    locale: "en",

    t:
      _t ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((...args: any[]) => {
        const key = args[0];
        return get(english, key);
      }),
  };

  app.provide(I18N_KEY, i18n);
};

export const useI18n = (): I18n => {
  const injected = inject(I18N_KEY, undefined);
  if (!injected) {
    throw new Error("i18n plugin was not used in main file");
  }
  return injected;
};

export default plugin;

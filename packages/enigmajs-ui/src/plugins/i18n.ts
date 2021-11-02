import { App, inject, InjectionKey, Plugin, ref, Ref } from "vue";
import { T } from "enigmajs-core";
import { get } from "lodash";

import english from "../i18n/en.json";

interface I18n {
  locale: Ref<string>;
  t: T;
}

const I18N_KEY: InjectionKey<I18n> = Symbol("eg.i18n");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defaultT(...args: any[]): string {
  const [key] = args;
  return get(english, key);
}

export const useI18n = (): I18n => {
  const injected = inject(I18N_KEY, undefined);
  if (!injected) {
    throw new Error("i18n plugin was not used in main file");
  }
  return injected;
};

const plugin: Plugin = (app: App, i18nOpts?: Partial<I18n>) => {
  const i18n: I18n = {
    locale: i18nOpts?.locale ?? ref(english.locale),
    t: i18nOpts?.t ?? defaultT,
  };

  app.provide(I18N_KEY, i18n);
};

export default plugin;

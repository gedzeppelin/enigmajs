import {
  ComputedRef,
  inject,
  InjectionKey,
  isRef,
  Plugin,
  Ref,
  watchEffect,
  WritableComputedRef,
} from "vue";
import { EgAxiosInstance, createAxios } from "enigmajs-core";

import { AxiosRequestConfig } from "axios";

import deepMerge from "deepmerge";
import { options } from "../options";

// TODO fix auth token
//import { store } from "@/store";

export type Locale =
  | ComputedRef<string>
  | WritableComputedRef<string>
  | Ref<string>
  | string;

interface EgAxiosOptions {
  authToken?: Locale;
  authHeader?: string;
  authScheme?: string;
  locale?: Locale;
  defaults: AxiosRequestConfig;
}

export const AXIOS_KEY: InjectionKey<EgAxiosInstance> = Symbol("eg.axios");

export function useAxios(): EgAxiosInstance {
  const injected = inject(AXIOS_KEY);
  if (!injected) {
    throw new Error("axios plugin was not used in main file");
  }
  return injected;
}

export let axios: EgAxiosInstance;

const plugin: Plugin = (app, opts?: EgAxiosOptions) => {
  const defaults: AxiosRequestConfig = {
    headers: {
      common: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
  };

  const _axios = createAxios(
    opts?.defaults ? deepMerge(defaults, opts.defaults) : defaults
  );

  const authToken = opts?.authToken;

  if (authToken) {
    const authHeader = opts?.authHeader ?? "Authorization";
    const scheme = opts?.authScheme ?? "Bearer";

    if (isRef(authToken)) {
      watchEffect(() => {
        const _authToken = authToken.value;
        _axios.defaults.headers.common[authHeader] = `${scheme} ${_authToken}`;
      });
    } else {
      _axios.defaults.headers.common[authHeader] = `${scheme} ${authToken}`;
    }
  }

  const locale = opts?.locale ?? options.locale;

  //console.log(opts?.locale, options.locale);

  if (locale) {
    if (isRef(locale)) {
      watchEffect(() => {
        const _locale = locale.value;
        _axios.defaults.headers.common["Accept-Language"] = _locale;
      });
    } else {
      _axios.defaults.headers.common["Accept-Language"] = locale.toString();
    }
  }

  // TODO remove flag header interceptor
  _axios.interceptors.request.use((config) => {
    if (config.method === "GET") {
      config.params = { flag: true, ...config.params };
    }

    return config;
  });

  axios = _axios;
  app.provide(AXIOS_KEY, _axios);
};

export default plugin;

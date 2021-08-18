import { inject, InjectionKey, Plugin } from "vue";
import { EgAxiosInstance, createAxios } from "enigmajs-core";

import { AxiosRequestConfig } from "axios";

import { options } from "../options";
import deepMerge from "deepmerge";

// TODO fix auth token
//import { store } from "@/store";

export const axiosKey: InjectionKey<EgAxiosInstance> = Symbol("eg-axios");

export function useAxios(): EgAxiosInstance {
  const injected = inject(axiosKey);
  if (!injected) {
    throw new Error("axios plugin was not used in main file");
  }
  return injected;
}

//export const axios = createAxios();

const plugin: Plugin = (app, opts: AxiosRequestConfig) => {
  /* if (store.state.auth.payload) {
    const access = store.state.auth.payload?.access;
    axios.defaults.headers["Authorization"] = `Bearer ${access}`;
  } */

  const defaults: AxiosRequestConfig = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  /* if (options?.locale?.value) {
    defaults.headers["Accept-Language"] = options.locale.value;
  } */

  const axios = createAxios(opts ? deepMerge(defaults, opts) : defaults);

  axios.interceptors.request.use((config) => {
    if (config.method === "GET") {
      config.params = { flag: true, ...config.params };
    }

    return config;
  });

  app.provide(axiosKey, axios);
};

export default plugin;

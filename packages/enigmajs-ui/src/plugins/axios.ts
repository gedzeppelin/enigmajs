import { inject, InjectionKey, Plugin } from "vue";
import { EgAxiosInstance, createAxios } from "enigmajs-core";

import { defaults } from "../defaults";
import { store } from "@/store";

export const axiosKey: InjectionKey<EgAxiosInstance> = Symbol("axios");

export function useAxios(): EgAxiosInstance {
  const injected = inject(axiosKey);
  if (!injected) {
    throw new Error("axios plugin was not used in main.ts");
  }
  return injected;
}

export const axios = createAxios({
  baseURL: process.env.VUE_APP_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(defaults.locale ? { "Accept-Language": defaults.locale.value } : {}),
  },
});

export default (function (app) {
  if (store.state.auth.payload) {
    const access = store.state.auth.payload?.access;
    axios.defaults.headers["Authorization"] = `Bearer ${access}`;
  }

  axios.interceptors.request.use((config) => {
    if (config.method === "GET") {
      config.params = { flag: true, ...config.params };
    }

    return config;
  });

  app.provide(axiosKey, axios);
} as Plugin);

/* eslint-disable @typescript-eslint/no-explicit-any */
export * from "./response";

import { Response, ConfigLiteral } from "./response";
import * as FetchResponse from "./fetch-response";
import * as BuildResponse from "./build-response";
import * as BuildResponses from "./build-responses";

import { Paginator } from "../paginator";

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export interface EgAxiosInstance extends AxiosInstance {
  // Make SIMPLE requests.
  // eslint-disable-next-line prettier/prettier
  fetchResponse<T = any>(
    config: FetchResponse.ConfigExact
  ): Promise<Response<T>>;

  fetchResponse<T = any>(
    config: FetchResponse.ConfigPaginated
  ): Promise<Response<Paginator<T>>>;

  fetchResponse<T = any>(
    config: FetchResponse.ConfigBoth
  ): Promise<Response<T | Paginator<T>>>;

  fetchResponse<T = any>(
    config: ConfigLiteral,
    options?: FetchResponse.OptionsExact
  ): Promise<Response<T>>;

  fetchResponse<T = any>(
    config: ConfigLiteral,
    options?: FetchResponse.OptionsPaginated
  ): Promise<Response<Paginator<T>>>;

  fetchResponse<T = any>(
    config: ConfigLiteral,
    options?: FetchResponse.OptionsBoth
  ): Promise<Response<T | Paginator<T>>>;

  // Make SINGLE requests.
  buildResponse<T = any>(
    config: BuildResponse.ConfigExact<T>
  ): Promise<Response<T>>;

  buildResponse<T = any>(
    config: BuildResponse.ConfigPaginated<T>
  ): Promise<Response<Paginator<T>>>;

  buildResponse<T = any>(
    config: BuildResponse.ConfigBoth<T>
  ): Promise<Response<T | Paginator<T>>>;

  buildResponse<T = any>(
    config: ConfigLiteral,
    options?: BuildResponse.OptionsExact<T>
  ): Promise<Response<T>>;

  buildResponse<T = any>(
    config: ConfigLiteral,
    options?: BuildResponse.OptionsPaginated<T>
  ): Promise<Response<Paginator<T>>>;

  buildResponse<T = any>(
    config: ConfigLiteral,
    options?: BuildResponse.OptionsBoth<T>
  ): Promise<Response<T | Paginator<T>>>;

  // Make MULTIPLE requests.
  buildResponses<T = any, R = any, V = any, W = any>(
    config: BuildResponses.Config4<T, R, V, W>
  ): Promise<BuildResponses.Return4<T, R, V, W>>;

  buildResponses<T = any, R = any, V = any>(
    config: BuildResponses.Config3<T, R, V>
  ): Promise<BuildResponses.Return3<T, R, V>>;

  buildResponses<T = any, R = any>(
    config: BuildResponses.Config2<T, R>
  ): Promise<BuildResponses.Return2<T, R>>;

  buildResponses<T = any>(
    config: BuildResponses.Config1<T>
  ): Promise<BuildResponses.Return1<T>>;
}

export const createAxios = (config?: AxiosRequestConfig): EgAxiosInstance => {
  const _axios = axios.create(config) as EgAxiosInstance;
  _axios.fetchResponse = FetchResponse.fetchResponse;
  _axios.buildResponse = BuildResponse.buildResponse;
  (_axios.buildResponses as unknown) = BuildResponses.buildResponses;
  return _axios;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectionKey } from "vue";

import { Response } from "enigmajs-core";

import { EgCacheManager } from "../cache";
import EgCreateUpdate from "./create-update.vue";

type _CMKey = InjectionKey<EgCacheManager>;
export const CACHE_MANAGER_KEY: _CMKey = Symbol("eg.cu.manager");

export interface ParentRequest<T = any> {
  request: Promise<Response<T>>;
  mutation?: (response: T, entity: any) => void;
}

export type InitialRequest<T = any> =
  | ParentRequest<T>
  | ((id: any) => ParentRequest<T>);

export function addRequest<T = any>(
  request: Promise<Response<T>>,
  mutation: (response: T, entity: any) => void
): ParentRequest<T> {
  return { request, mutation };
}

export type PrepareRequest = (obj: any) => void;

export default EgCreateUpdate;
export { default as EgCreateUpdateI18n } from "./create-update-i18n.vue";

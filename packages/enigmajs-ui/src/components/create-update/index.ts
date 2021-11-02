/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "enigmajs-core";

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

export { default as EgCreateUpdate } from "./create-update.vue";
export { default as EgCreateUpdateI18n } from "./create-update-i18n.vue";

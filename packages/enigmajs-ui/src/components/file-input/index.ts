import { InjectionKey, Ref } from "vue";

export interface IFileInput {
  clear: () => void;
  clearPicker: () => void;
  nativeClick: () => void;

  deleteFile(idx: number): void;
  modifyFile(val: File, idx: number): void;
  insertFile(val: File, idx: number): void;
  insertFiles(val: File[], idx: number): void;
}

export type ModelValue = File | File[] | undefined;

type IKey = InjectionKey<Ref<File[]>>;
export const INTERNAL_KEY: IKey = Symbol("file-input.internal");

export type MIType = (val: File[], dragged: boolean) => void;
type MIKey = InjectionKey<MIType>;
export const MUTATE_INTERNAL_KEY: MIKey = Symbol("file-input.mutate_internal");

export { default as EgFileInput } from "./file-input.vue";
export { default as EgImageInput } from "./image-input.vue";

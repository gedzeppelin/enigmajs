import EgFormI18n from "./form-i18n.vue";
export default EgFormI18n;

import type { FieldErrorList } from "async-validator";

type Props = string | string[];
type Callback = (errorMessage: string) => void;

export interface IValidate {
  langs?: string[];
  omitInner?: boolean;
}

export interface IValidateField {
  props: Props;
  callback?: Callback;
  omitInner?: boolean;
}

export interface IClearValidate {
  props?: Props;
  omitInner?: boolean;
}

export interface IFormI18n {
  translate(langs: string[]): Promise<boolean>;
  execute(): Promise<boolean>;
  uncheckAll(): void;

  validate(opts?: IValidate): Promise<boolean>;
  validateField(opts: IValidateField): void;
  resetFields: (inner?: boolean) => void;
  clearValidate(opts?: IClearValidate): void;
}

interface IFormValidate {
  (): Promise<boolean>;
  (callback: (valid: boolean, obj: FieldErrorList) => void): void;
}

export interface IForm {
  validate: IFormValidate;
  validateField(props: Props, callback?: Callback): void;
  resetFields(): void;
  clearValidate(props?: Props): void;
}

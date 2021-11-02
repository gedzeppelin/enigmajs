export interface Lang {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

export interface Target {
  [key: string]: string | boolean | number | Target[] | Target;
}

export interface I18nFormItem {
  isAuto: boolean;
  isDefault: boolean;
  isLoading: boolean;
  lang: Lang;
  target: Target;
}

export interface I18nRequest {
  text: string[];
  from_lang: string;
  to_lang: string[];
}

export interface I18nItem {
  translations: {
    text: string;
    to: string;
  }[];
}

export type I18nResponse = I18nItem[];

import Schema from "async-validator";
import type { RuleItem as _RuleItem } from "async-validator";

import { t } from "../options";

interface RuleItem extends _RuleItem {
  trigger?: "change" | "blur";
}

// TODO: not working
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _schema = Schema as any;

// eslint-disable-next-line @typescript-eslint/no-empty-function
_schema.warning = () => {};

//console.log(_schema.messages);
_schema.messages.required = () => t("rule.required");

export type I18nRule = (key: string) => RuleItem;

export const requiredRule: RuleItem = {
  required: true,
  message: () => t("rule.required"),
};

export const numberRule: RuleItem = {
  validator: (_, val) => /^\d+(?:\.\d+)?$/.test(val),
  message: () => t("rule.number"),
};

export const neArrayRule: RuleItem = {
  trigger: "change",
  validator: (_, val) => Array.isArray(val) && val.length > 0,
  message: () => t("rule.ne_array"),
};

export const neArrayObjectsRule: RuleItem = {
  validator: (_, val) =>
    Array.isArray(val) &&
    val.length > 0 &&
    val.every(
      (x) =>
        typeof x === "object" &&
        Object.values(x).every((y) => {
          return y == true;
        })
    ),
  message: () => t("rule.required"),
};

export interface Rules {
  [field: string]: RuleItem | RuleItem[] | I18nRule | I18nRule[];
}

export { RuleItem };

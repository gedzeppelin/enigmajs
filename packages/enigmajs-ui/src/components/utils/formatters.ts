import { h, VNode } from "vue";

import { options } from "../../options";

export function priceFormatter(
  _row: unknown,
  _column: unknown,
  cellValue: string
): string {
  try {
    const price = Number(cellValue);
    return `S/ ${price.toFixed(2)}`;
  } catch {
    return `S/ ${cellValue}`;
  }
}

export function nullFormatter(
  _row: unknown,
  _column: unknown,
  cellValue?: string
): string | VNode {
  if (!cellValue) {
    const emptyField = options.t("app.empty_field");
    return h("i", null, emptyField);
  }
  return cellValue;
}

export function checkFormatter(
  _row: unknown,
  _column: unknown,
  cellValue: unknown
): string {
  return options.t(cellValue ? "app.yes" : "app.no");
}

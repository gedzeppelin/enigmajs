import { cloneDeep, isNaN, isNull, isPlainObject, set } from "lodash";
import { EG_CACHE_PROP } from "./cache/cache";

export function deepPurgeObject(
  source: Record<string, unknown>,
  target?: Record<string, unknown>,
  parentPath?: string
): Record<string, unknown> {
  const innerTarget = target ?? {};
  const clonedSource = cloneDeep(source);

  for (const key in clonedSource) {
    if (key === EG_CACHE_PROP) {
      continue;
    }

    const value = clonedSource[key];

    if (
      value === undefined ||
      (typeof value === "number" && !isFinite(value)) ||
      isNaN(value)
    ) {
      continue;
    }

    const currentPath = parentPath ? `${parentPath}.${key}` : key;

    if (isPlainObject(value) && value) {
      const childSource = value as Record<string, unknown>;
      deepPurgeObject(childSource, innerTarget, currentPath);
      continue;
    }

    set(innerTarget, currentPath, value);
  }

  return innerTarget;
}

export function multipartArray(
  source: Record<string, unknown>,
  target: FormData,
  parentPath: string
): void {
  for (const key in source) {
    const currentPath = parentPath.endsWith("]")
      ? `${parentPath}${key}`
      : `${parentPath}.${key}`;

    const el = source[key];

    if (typeof el === "string" || el instanceof Blob) {
      target.append(currentPath, el);
      continue;
    }

    if (isPlainObject(el)) {
      multipartArray(el as Record<string, unknown>, target, `${currentPath}`);
      continue;
    }

    target.append(currentPath, String(el));
  }
}

export function multipartFormData(
  source: Record<string, unknown>,
  target?: FormData,
  parentPath?: string
): FormData {
  const _target = target ?? new FormData();

  for (const key in source) {
    const el = source[key];
    const currentPath = parentPath ? `${parentPath}.${key}` : key;

    if (isNull(el)) {
      _target.append(currentPath, "");
      continue;
    }

    if (typeof el === "string" || el instanceof Blob) {
      _target.append(currentPath, el);
      continue;
    }

    if (isPlainObject(el)) {
      multipartFormData(el as Record<string, unknown>, _target, currentPath);
      continue;
    }

    if (Array.isArray(el) && el.length > 0) {
      el.forEach((item, idx) => {
        if (isPlainObject(item)) {
          multipartArray(item, _target, `${currentPath}[${idx}]`);
        } else {
          _target.append(`${currentPath}[${idx}]`, item);
        }
      });
      continue;
    }

    _target.append(currentPath, String(el));
  }

  return _target;
}

export function multipartData(source: Record<string, unknown>): FormData {
  const purgedSource = deepPurgeObject(source);
  return multipartFormData(purgedSource);
}

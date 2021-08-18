import { ElMessage } from "element-plus";
import { Ref, UnwrapRef, ref, watch } from "vue";
import { t } from "../options";

/**
 * Returns an internal ref value that that replicates `modelValue` with a watcher on it.
 *
 * @param modelValue The modelValue prop.
 * @return The internal ref value.
 */
export function intRef<T>(
  modelValue: T | undefined,
  emit: (event: "change", value: T | undefined) => void
): Ref<T | undefined>;

/**
 * Returns an internal ref value that that replicates `modelValue` with a watcher on it.
 *
 * @param modelValue The modelValue prop.
 * @param initial The initial value.
 * @return The internal ref value.
 */
export function intRef<T>(
  modelValue: T | undefined,
  emit: (event: "change", value: T) => void,
  initial: T
): Ref<UnwrapRef<T>>;

/**
 * Returns an internal ref value that that replicates `modelValue` with a watcher on it.
 *
 * @param modelValue The modelValue prop.
 * @param initial The initial value (if any).
 * @return The internal ref value.
 */
export function intRef<T = unknown>(
  modelValue: T | undefined,
  emit: (event: "change", value: unknown) => void,
  initial?: T
): Ref<UnwrapRef<T>> | Ref<T | undefined> | Ref<T> {
  const internal = initial ? ref<T>(initial) : ref<T>();

  watch(
    () => modelValue,
    (value) => {
      if (internal.value !== value) {
        internal.value = value;
        emit("change", internal.value);
      }
    }
  );

  return internal;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function vf(form: any | undefined, fn: () => void): void {
  form?.validate((isValid?: boolean) => {
    if (isValid) {
      fn();
    } else {
      ElMessage({
        showClose: true,
        message: t("app.form_error"),
        type: "error",
      });
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rvf(form: Ref<any | undefined>, fn: () => void): void {
  form.value?.validate((isValid?: boolean) => {
    if (isValid) {
      fn();
    } else {
      ElMessage({
        showClose: true,
        message: t("app.form_error"),
        type: "error",
      });
    }
  });
}

export * from "./formatters";
export * from "./rules";

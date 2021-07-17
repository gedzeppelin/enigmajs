import { isNil } from "lodash";
import { ref, Ref, UnwrapRef, watch } from "vue";

/**
 * Returns a promise that is completed after `ms` milliseconds.
 *
 * @param ms The number of milliseconds to sleep.
 * @returns The sleep promise.
 *
 * @example Sleep for 2 seconds.
 * ```ts
 * await sleep(2000);
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 *
 * @param obj
 * @returns
 */
export function extractString(message: string | (() => string)): string {
  return typeof message === "function" ? message() : message;
}

/**
 * Purges an object by delete all properties with null or undefined values, if there is no valid values return undefined.
 *
 * @param obj The object to be purged.
 * @returns The purged object.
 */
export function purgeObject(
  obj: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (typeof obj === "object" && obj !== null) {
    const entries = Object.entries(obj).filter(([, x]) => !isNil(x));

    if (entries.length > 0) {
      return Object.fromEntries(entries);
    }
  }

  return undefined;
}

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

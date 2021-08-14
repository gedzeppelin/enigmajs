import { isNil } from "lodash";

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

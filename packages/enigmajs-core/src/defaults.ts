import { NotifyKinds, NotifyType } from "./response";

import { Notyf } from "notyf";
import { assignWith, isUndefined } from "lodash";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type T = (...args: any[]) => string;

interface Notifier {
  success(payload: string): void;
  error(payload: string): void;
}

interface Defaults {
  attempts: number;

  notifier: Notifier;

  notify: NotifyKinds;
  notifyType: NotifyType;

  successLabel: string | T;
  errorLabel: string | T;
  successMessage: string | T;
  errorMessage: string | T;
}

export const defaults: Defaults = {
  attempts: 3,

  notifier: new Notyf({
    duration: 10000,
    ripple: false,
    dismissible: true,
    position: {
      x: "right",
      y: "top",
    },
  }),

  notify: "ifErr",
  notifyType: "success",

  successLabel: "Success",
  errorLabel: "Error",
  successMessage: "Action completed successfully",
  errorMessage: "An unexpected error has occurred, please try again",
};

export function setEgDefaults(opts: Partial<Defaults>): void {
  assignWith(defaults, opts, (objValue, srcValue) =>
    isUndefined(objValue) ? srcValue : objValue
  );
}

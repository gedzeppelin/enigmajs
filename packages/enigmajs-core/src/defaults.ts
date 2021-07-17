import { NotifyKinds, NotifyType } from "./response";

import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import { assignWith, isUndefined } from "lodash";

interface Notifier {
  success(payload: string): void;
  error(payload: string): void;
}

interface Defaults {
  attempts: number;

  notifier: Notifier;

  notify: NotifyKinds;
  notifyType: NotifyType;

  successLabel: string | (() => string);
  errorLabel: string | (() => string);
  successMessage: string | (() => string);
  errorMessage: string | (() => string);
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

// TODO fix this

export * from "./formatters";
export * from "./rules";

import { Ref } from "vue";
import { ElLoading, ElMessage } from "element-plus";

import { store } from "@/store";

import router from "@/router";

import { LS_I18N_KEY, loadMessages, locale, t } from "../defaults";
import { AxiosInstance } from "axios";

export function updateTitle(): void {
  const name = router.currentRoute.value.name?.toString();
  const title = !name ? t("app.default_title") : t(`nav.${name}`);
  document.title = `${title} - Taqi`;
}

export async function updateLocale(
  axios: AxiosInstance,
  value: string
): Promise<void> {
  localStorage.setItem(LS_I18N_KEY, value);

  await loadMessages(value);
  locale.value = value;

  document.querySelector("html")?.setAttribute("lang", value);
  axios.defaults.headers["Accept-Language"] =
    value === "es" ? value : `${value},es;q=0.5`;

  store.state.i18n.formReset?.();
}

export async function changeLocale(
  axios: AxiosInstance,
  value: string
): Promise<void> {
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.75)",
  });

  await updateLocale(axios, value);
  updateTitle();

  loading.close();
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

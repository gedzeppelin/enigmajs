import { Plugin, Ref } from "vue";
import { Router } from "vue-router";
import { AxiosRequestConfig } from "axios";

import { setEgDefaults, T } from "enigmajs-core";

import { EgBackground } from "./components/background";
import { EgCreateUpdate, EgCreateUpdateI18n } from "./components/create-update";
import { EgFileInput, EgImageInput } from "./components/file-input";
import { EgFormI18n } from "./components/form-i18n";
import { EgLoader } from "./components/loader";
import { EgNavMenu, EgNavItem } from "./components/nav-menu";
import { EgObjectTree } from "./components/object-tree";
import {
  EgPaginator,
  EgColumnActions,
  EgColumnUpdate,
  EgRowDetails,
} from "./components/paginator";
import { EgPromiseSection } from "./components/promise-section";
import { EgPromiseSelect } from "./components/promise-select";
import { EgUbigeoSelect } from "./components/ubigeo-select";

import { options } from "./options";

import axios from "./plugins/axios";
import i18n, { defaultT } from "./plugins/i18n";
import viewport from "./plugins/viewport";

interface PluginOpts {
  router?: Router;
  axios?: AxiosRequestConfig;
  i18n?: {
    t?: T;
    locale: Ref<string>;
  };
}

const plugin: Plugin = (app, opts?: PluginOpts) => {
  if (!opts?.router) {
    throw new Error("Vue router needs to be passed in options!");
  }

  options.router = opts.router;
  options.t = opts.i18n?.t ?? defaultT;
  options.locale = opts.i18n?.locale;

  setEgDefaults({
    successLabel: () => options.t("app.success"),
    errorLabel: () => options.t("app.error"),
    successMessage: () => options.t("app.default_success"),
    errorMessage: () => options.t("app.default_error"),
  });

  app.use(viewport);
  app.use(i18n, opts.i18n);
  app.use(axios, opts.axios);

  app.component(EgBackground.name, EgBackground);
  app.component(EgColumnActions.name, EgColumnActions);
  app.component(EgColumnUpdate.name, EgColumnUpdate);
  app.component(EgCreateUpdate.name, EgCreateUpdate);
  app.component(EgCreateUpdateI18n.name, EgCreateUpdateI18n);
  app.component(EgFileInput.name, EgFileInput);
  app.component(EgFormI18n.name, EgFormI18n);
  app.component(EgImageInput.name, EgImageInput);
  app.component(EgLoader.name, EgLoader);
  app.component(EgNavItem.name, EgNavItem);
  app.component(EgNavMenu.name, EgNavMenu);
  app.component(EgObjectTree.name, EgObjectTree);
  app.component(EgPaginator.name, EgPaginator);
  app.component(EgPromiseSection.name, EgPromiseSection);
  app.component(EgPromiseSelect.name, EgPromiseSelect);
  app.component(EgRowDetails.name, EgRowDetails);
  app.component(EgUbigeoSelect.name, EgUbigeoSelect);
};

export * from "./cache";
export * from "./components/utils";

export * from "./plugins/axios";
export * from "./plugins/viewport";

export default plugin;

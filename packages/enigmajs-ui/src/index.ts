import { InjectionKey, Plugin, Ref } from "vue";
import { Router } from "vue-router";

import { AxiosRequestConfig } from "axios";
import { isNil } from "lodash";

import EgBackground from "./background";
import EgCreateUpdate, { EgCreateUpdateI18n } from "./create-update";
import EgFileInput, { EgImageInput } from "./file-input";
import EgFormI18n, { IForm } from "./form-i18n";
import EgLoader from "./loader";
import EgNavMenu, { EgNavItem } from "./nav-menu";
import EgObjectTree from "./object-tree";
import EgPaginator, {
  EgColumnActions,
  EgColumnUpdate,
  EgRowDetails,
} from "./paginator";
import EgPromiseSection from "./promise-section";
import EgPromiseSelect from "./promise-select";
import EgUbigeoSelect from "./ubigeo-select";

import axios from "./plugins/axios";
import i18n from "./plugins/i18n";

import { T } from "enigmajs-core";
import { options } from "./options";

interface PluginOpts {
  axios?: AxiosRequestConfig;
  t?: T;

  router: Router;
}

const plugin: Plugin = (app, opts: PluginOpts) => {
  if (isNil(opts?.router)) {
    throw new Error("Vue router needs to be passed in options!");
  }

  options.router = opts.router;

  app.use(axios, opts.axios);
  app.use(i18n, opts.t);

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

type _IFKey = InjectionKey<Ref<IForm>>;
export const IFORM_KEY: _IFKey = Symbol("eg.common.form");

type _IEKey = InjectionKey<boolean>;
export const IS_EDIT_KEY: _IEKey = Symbol("eg.create_update.isEdit");

export * from "./cache";
export * from "./utils";
export * from "./viewport";

export * from "./plugins/axios";

export default plugin;

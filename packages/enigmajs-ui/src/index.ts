import { InjectionKey, Plugin, Ref } from "vue";

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

interface PluginOpts {
  axios?: boolean;
}

export default (function (app, opt: PluginOpts) {
  if (opt.axios) {
    app.use(axios);
  }

  app.component("eg-background", EgBackground);
  app.component("eg-column-actions", EgColumnActions);
  app.component("eg-column-update", EgColumnUpdate);
  app.component("eg-cu", EgCreateUpdate);
  app.component("eg-cu-i18n", EgCreateUpdateI18n);
  app.component("eg-file-input", EgFileInput);
  app.component("eg-form-i18n", EgFormI18n);
  app.component("eg-image-input", EgImageInput);
  app.component("eg-loader", EgLoader);
  app.component("eg-nav-item", EgNavItem);
  app.component("eg-nav-menu", EgNavMenu);
  app.component("eg-object-tree", EgObjectTree);
  app.component("eg-paginator", EgPaginator);
  app.component("eg-promise-section", EgPromiseSection);
  app.component("eg-promise-select", EgPromiseSelect);
  app.component("eg-row-details", EgRowDetails);
  app.component("eg-ubigeo-select", EgUbigeoSelect);
} as Plugin);

type _IFKey = InjectionKey<Ref<IForm>>;
export const IFORM_KEY: _IFKey = Symbol("eg.common.form");

type _IEKey = InjectionKey<boolean>;
export const IS_EDIT_KEY: _IEKey = Symbol("eg.create_update.isEdit");

export * from "./utils";

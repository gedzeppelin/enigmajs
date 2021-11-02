import { InjectionKey, Ref } from "vue";

// Common

type _FKey = InjectionKey<Ref<IForm>>;
export const IFORM_KEY: _FKey = Symbol("eg.form");

type _CMKey = InjectionKey<EgCacheManager>;
export const CACHE_MANAGER_KEY: _CMKey = Symbol("eg.cache_manager");

// CreateUpdate

import { EgCacheManager } from "../cache";
import { IForm } from "./form-i18n";

type _IEKey = InjectionKey<boolean>;
export const CU_IS_EDIT_KEY: _IEKey = Symbol("eg.cu.is_edit");

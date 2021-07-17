import { InjectionKey } from "vue";
import { EgCacheManager } from "enigmajs-core";

import EgCreateUpdate from "./create-update.vue";

type _CMKey = InjectionKey<EgCacheManager>;
export const CACHE_MANAGER_KEY: _CMKey = Symbol("eg.cu.manager");

export default EgCreateUpdate;
export { default as EgCreateUpdateI18n } from "./create-update-i18n.vue";

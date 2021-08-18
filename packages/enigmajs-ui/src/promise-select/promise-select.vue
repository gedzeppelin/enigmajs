<template lang="pug">
el-select.eg-promise-select(
  v-bind="$attrs",
  :disabled="disabled",
  :filterable="searchable",
  :loading="loading || intLoading",
  :modelValue="internal",
  :multiple="multiple",
  :placeholder="intPlaceholder",
  :remote="searchable",
  :remote-method="getItems",
  :style="{ width }",
  @change="onChange",
  @clear="onClear",
  @visible-change="onVisibleChange"
)
  slot(:options="items")
    el-option-group(key="g-options")
      el-option(
        v-for="opt in items",
        :key="opt._value",
        :label="opt._label",
        :value="opt._value"
      )
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PropType,
  computed,
  defineComponent,
  onBeforeMount,
  ref,
  watch,
  inject,
  Ref,
} from "vue";
import { elFormItemKey } from "element-plus/packages/form/src/token";
import { cloneDeep, get, isEmpty, isEqual, isNil } from "lodash";
import { AxiosRequestConfig } from "axios";

import { useAxios } from "../plugins/axios";
import { useI18n } from "../plugins/i18n";

import { NotifyKinds, Paginator, purgeObject } from "enigmajs-core";
import { CACHE_MANAGER_KEY } from "../create-update";

type ModelValue = string | number | null | (string | number)[];

export default defineComponent({
  name: "EgPromiseSelect",
  props: {
    modelValue: {
      type: [String, Number, Array] as PropType<ModelValue>,
      default: undefined,
    },
    searchable: { type: Boolean, default: true },

    loading: Boolean,
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: undefined },
    width: { type: String, default: "100%" },

    paginated: { type: Boolean, default: true },
    notify: { type: String as PropType<NotifyKinds>, default: "never" },

    autoFetch: { type: Boolean, default: true },
    fetchOnStart: { type: Boolean, default: true },
    requestConfig: {
      type: Object as PropType<AxiosRequestConfig>,
      default: undefined,
    },
    source: {
      type: String,
      required: true,
      validator: (value: string) => /^\/.*[^/]$/.test(value),
    },

    initialSelected: { type: Boolean, default: true },
    selected: {
      type: [String, Number, Array] as PropType<ModelValue>,
      default: undefined,
    },
    self: { type: [String, Number], default: undefined },

    multiple: { type: Boolean, default: false },
    multipleFilter: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined,
    },

    valueProp: { type: String, default: "id" },
    labelProp: {
      type: [String, Function] as PropType<string | ((val: any) => string)>,
      default: "translation.name",
    },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit, expose }) {
    const axios = useAxios();
    const { t } = useI18n();

    const items: Ref<any[]> = (() => {
      const manager = inject(CACHE_MANAGER_KEY, undefined);
      const itemCtx = inject(elFormItemKey, undefined);

      if (manager && itemCtx?.prop) {
        return manager.transferRef([], itemCtx.prop);
      }

      return ref<any[]>([]);
    })();

    const initial = props.modelValue ?? (props.multiple ? [] : null);
    const internal = ref<ModelValue>(initial);

    watch(
      () => props.requestConfig,
      () => {
        if (props.autoFetch) {
          getItems("", true);
        }
      },
      { deep: true }
    );

    watch(
      () => props.modelValue,
      (value) => {
        if (mvGuard) {
          mvGuard = false;
          return;
        }

        if (internal.value !== value) {
          internal.value = value as ModelValue;
          emit("change", value);
        }
      }
    );

    const intLoading = ref(props.autoFetch);

    let mvGuard = false;
    let itemsCache: unknown[] = [];

    const intPlaceholder = computed(() => {
      if (
        props.multiple &&
        Array.isArray(internal.value) &&
        internal.value.length > 0
      ) {
        return;
      }

      if (props.placeholder) {
        if (props.loading || intLoading.value) {
          return t("eg.promise_section.loading", {
            plc: props.placeholder.substr(0, 4),
          });
        }

        return props.placeholder;
      }

      if (props.loading || intLoading.value) {
        return t("cmn.loading");
      }

      return t("eg.promise_select.placeholder");
    });

    const filterCallback = computed(() =>
      props.self
        ? (val: any) => {
            const id = get(val, props.valueProp);
            return (
              props.self !== id &&
              (Array.isArray(internal.value)
                ? !internal.value.includes(id)
                : internal.value !== id)
            );
          }
        : (val: any) => {
            const id = get(val, props.valueProp);
            return Array.isArray(internal.value)
              ? !internal.value.includes(id)
              : internal.value !== id;
          }
    );

    function getLabel(item: unknown) {
      if (typeof props.labelProp === "string") {
        return String(get(item, props.labelProp));
      }
      return String(props.labelProp(item));
    }

    function formatCallback(item: any) {
      item._label = getLabel(item);
      item._value = get(item, props.valueProp);
    }

    function sortItems(event: ModelValue) {
      if (!event) return;

      if (Array.isArray(event)) {
        const idProp = props.valueProp;

        items.value.sort((a, b) => {
          let ida = event.includes(get(a, idProp));
          let idb = event.includes(get(b, idProp));

          if (ida && !idb) return -1;
          if (!ida && idb) return 1;
          return 0;
        });
      } else {
        const idProp = props.valueProp;

        items.value.sort((a, b) => {
          let ida = event === get(a, idProp);
          let idb = event === get(b, idProp);

          if (ida && !idb) return -1;
          if (!ida && idb) return 1;
          return 0;
        });
      }
    }

    function filterOptions(options: Paginator<unknown> | unknown[]): unknown[] {
      const filtered = (
        options instanceof Paginator ? options.results : options
      ).filter(filterCallback.value);
      filtered.forEach(formatCallback);

      return filtered;
    }

    function loadItems(source: unknown[]) {
      if (props.multiple) {
        if (Array.isArray(internal.value)) {
          if (internal.value.length > 0) {
            items.value.splice(
              internal.value.length,
              items.value.length - internal.value.length,
              ...source
            );
          } else {
            items.value = source;
          }
        }
      } else {
        if (isNil(internal.value) || !internal.value) {
          items.value = source;
        } else {
          items.value.splice(1, items.value.length - 1, ...source);
        }
      }
    }

    /**
     *
     */
    async function getItems(q: string, reload = false) {
      intLoading.value = true;

      const paginated = props.paginated;
      const request: AxiosRequestConfig = {
        method: "GET",
        url: props.source,
        params: { search: q, page_size: 25 },
      };

      await axios.buildResponse({
        notify: props.notify,
        paginated: paginated,
        request: props.requestConfig
          ? Object.assign(request, props.requestConfig)
          : request,

        ifOk: ({ payload }) => {
          const filtered = filterOptions(payload);

          loadItems(filtered);

          if (reload) {
            itemsCache = filtered;
          }
        },
      });

      intLoading.value = false;
    }

    /**
     *
     */
    async function selectionStart() {
      const request: AxiosRequestConfig = {
        method: "GET",
        url: props.source,
        params: { page_size: 25 },
      };

      const selectionPromise = (() => {
        if (props.multiple) {
          if (props.multipleFilter) {
            const purgedFilter = purgeObject(props.multipleFilter);
            if (!isEmpty(purgedFilter)) {
              return axios.fetchResponse({
                paginated: props.paginated,
                request: {
                  url: `${props.source}/`,
                  params: { page_size: 25, ...purgedFilter },
                },
              });
            }
          } else if (props.selected || props.modelValue) {
            const current = (props.selected ?? props.modelValue) as unknown[];

            return axios.fetchResponse({
              paginated: props.paginated,
              request: {
                url: `${props.source}/`,
                params: { page_size: 25, ids: current.join(",") },
              },
            });
          }
        } else if (props.selected || props.modelValue) {
          return axios.fetchResponse({
            request: `${props.source}/${props.selected ?? props.modelValue}/ `,
          });
        }

        return undefined;
      })();

      //const initial = props.selected ?? props.modelValue;

      if (selectionPromise) {
        await axios.buildResponses({
          notify: props.notify,
          requests: [
            selectionPromise,
            axios.fetchResponse({
              paginated: props.paginated,
              request: props.requestConfig
                ? Object.assign(request, props.requestConfig)
                : request,
            }),
          ],

          ifOk: ([val, opts]: [
            Paginator<unknown> | unknown[] | unknown,
            Paginator<unknown> | unknown[]
          ]) => {
            if (val instanceof Paginator) {
              val.results.forEach(formatCallback);
              items.value.push(...val.results);
            } else if (Array.isArray(val)) {
              val.forEach(formatCallback);
              items.value.push(...val);
            } else {
              formatCallback(val);
              items.value.push(val);
            }

            if (!isEqual(internal.value, items.value)) {
              internal.value = props.multiple
                ? items.value.map((x) => get(x, props.valueProp))
                : get(items.value[0], props.valueProp);
            } else if (
              !isNil(props.selected) &&
              !isEqual(internal.value, props.selected)
            ) {
              internal.value = cloneDeep(props.selected);
            }

            if (!isEqual(internal.value, props.modelValue)) {
              mvGuard = true;
              emit("update:modelValue", internal.value);
              emit("change", internal.value);
            }

            const filtered = filterOptions(opts);
            loadItems(filtered);

            itemsCache = filtered;
          },
        });
      } else {
        await getItems("", true);
      }
    }

    // Exposed props.
    expose({
      async refresh(callback?: () => void) {
        await getItems("", true);
        await Promise.resolve(callback?.());
      },

      pickByProp(prop: string, value: unknown): unknown {
        const item = items.value.find((x) => get(x, prop) === value);

        if (item !== undefined) {
          const id = get(item, props.valueProp);

          internal.value = id;
          sortItems(id);

          mvGuard = true;
          emit("update:modelValue", id);
          emit("change", id);
        }

        return item;
      },
    });

    let changePromise: Promise<void> | void = void 0;

    if (props.fetchOnStart) {
      onBeforeMount(async () => {
        if (
          props.selected ||
          (props.multiple && props.multipleFilter) ||
          (props.initialSelected && !isNil(props.modelValue))
        ) {
          await selectionStart();
        } else {
          await getItems("", true);
        }

        intLoading.value = false;
      });
    }

    return {
      emit,
      get,
      getItems,
      getLabel,
      intLoading,
      intPlaceholder,
      internal,
      items,
      t,

      onChange: (event: ModelValue) => {
        mvGuard = true;
        emit("update:modelValue", event);
        emit("change", event);

        changePromise = new Promise((resolve) => {
          internal.value = event;
          sortItems(event);

          let suspend: Promise<void> | void = void 0;

          if (props.searchable) {
            suspend = getItems("", true);
          }

          Promise.resolve(suspend).then(() => {
            resolve();
          });
        });
      },
      onClear: () => {
        items.value = itemsCache;
      },
      onVisibleChange: async (evt: boolean) => {
        if (!evt && props.searchable) {
          await Promise.resolve(changePromise);
          loadItems(itemsCache);
        }
      },
    };
  },
});
</script>

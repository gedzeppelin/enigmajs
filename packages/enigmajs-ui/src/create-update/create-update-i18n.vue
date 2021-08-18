<template lang="pug">
el-card(shadow="never")
  template(v-slot:header)
    el-row(align="middle", justify="space-between", type="flex")
      el-col(:sm="12", :span="24")
        .eg-cu.title-header
          el-button.back-button(
            @click="goList",
            circle,
            icon="el-icon-back",
            small
          )
          span {{ t(`nav.${String(route.name)}`) }}
      el-col.text-right(:sm="12", :span="24")
        el-button(
          :disabled="isSaving || isI18nLoading",
          @click="formI18n.resetFields()",
          type="danger"
        ) {{ t('cmn.reset') }}
        el-button(
          :disabled="isSaving || isI18nLoading",
          :loading="isSaving",
          @click="execute()",
          type="primary"
        ) {{ isUpdate ? t('crud.update') : t('crud.create') }}

  eg-loader(v-if="isLoading", :height="500")
  el-form(
    ref="form",
    v-else,
    :label-position="xs ? 'top' : 'left'",
    :label-width="labelWidth",
    :model="model ?? intEntity",
    :rules="rules"
  )
    el-row(:gutter="24", justify="space-evenly", type="flex")
      el-col(:lg="12", :span="24", :xl="11")
        slot(
          :entity="intEntity",
          :i18nItems="intI18nItems",
          :isI18nLoading="isI18nLoading",
          :isLoading="isLoading",
          :isSaving="isSaving",
          :isUpdate="isUpdate"
        )

      el-col(:lg="12", :span="24", :xl="11")
        slot(
          :entity="intEntity",
          :i18n-items="intI18nItems",
          :is-i18n-loading="isI18nLoading",
          :is-loading="isLoading",
          :is-saving="isSaving",
          :is-update="isUpdate",
          name="above-i18n"
        )
        eg-form-i18n(
          ref="formI18n",
          :fields="i18nFields",
          :items="intI18nItems",
          :label-width="labelWidthI18n",
          :rules="rulesI18n",
          :target="i18nTarget",
          @load="isI18nLoading = false"
        )
        slot(
          :entity="intEntity",
          :i18n-items="intI18nItems",
          :is-i18n-loading="isI18nLoading",
          :is-loading="isLoading",
          :is-saving="isSaving",
          :is-update="isUpdate",
          name="under-i18n"
        )
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PropType,
  Ref,
  computed,
  defineComponent,
  onBeforeMount,
  provide,
  reactive,
  ref,
  watch,
} from "vue";

import {
  Paginator,
  Response,
  multipartData,
  EgCacheConfig,
} from "enigmajs-core";
import { useI18n } from "../plugins/i18n";
import { useRoute, useRouter } from "vue-router";
import { clone, cloneDeep, get, set, unset } from "lodash";

import {
  CACHE_MANAGER_KEY,
  InitialRequest,
  ParentRequest,
  PrepareRequest,
} from ".";
import { IFORM_KEY, IS_EDIT_KEY, EgCacheManager, Rules } from "..";
import { IForm, IFormI18n } from "../form-i18n";
import { useViewport } from "../viewport";
import { useAxios } from "../plugins/axios";

import { Target } from "../types";

function isParentRequest<T = any>(obj: unknown): obj is ParentRequest<T> {
  return typeof obj === "object" && obj !== null && "request" in obj;
}

export default defineComponent({
  name: "EgCuI18n",
  props: {
    model: { type: Object as PropType<Target>, default: undefined },
    target: { type: Object as PropType<Target>, default: undefined },
    defaults: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined,
    },

    labelWidth: { type: [String, Number], default: "120px" },
    labelWidthI18n: { type: [String, Number], default: undefined },

    initialRequests: {
      type: Array as PropType<InitialRequest[]>,
      default: undefined,
    },
    prepareCreate: {
      type: Function as PropType<PrepareRequest>,
      default: undefined,
    },
    prepareUpdate: {
      type: Function as PropType<PrepareRequest>,
      default: undefined,
    },

    egCache: { type: Object as PropType<EgCacheConfig>, default: undefined },

    requestUrl: {
      type: String,
      required: true,
      validator: (value: string) => /^\/.*[^/]$/.test(value),
    },
    i18nRequestUrl: {
      type: String,
      required: true,
      validator: (value: string) => /^\/.*[^/]$/.test(value),
    },

    rules: { type: Object as PropType<Rules>, default: undefined },
    rulesI18n: { type: Object as PropType<Rules>, default: undefined },

    i18nItems: { type: Array as PropType<Target[]>, default: undefined },
    i18nItemFkProp: { type: String, required: true },
    i18nFields: { type: Array as PropType<string[]>, default: undefined },

    translationProp: { type: String, default: "translation" },
    idRouterProp: { type: String, default: "id" },
    idProp: { type: String, default: "id" },

    useMultipart: { type: Boolean, default: false },
  },
  setup(props) {
    const axios = useAxios();
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();
    const { xs } = useViewport();

    const form = ref<IForm>() as Ref<IForm>;
    const formI18n = ref<IFormI18n>() as Ref<IFormI18n>;

    const selfId = get(route.params, props.idRouterProp) as string | undefined;
    const isUpdate = selfId !== undefined;

    const isLoading = ref(isUpdate);
    const isSaving = ref(false);
    const isI18nLoading = ref(true);

    const cacheManager = (() => {
      if (isUpdate) {
        const manager = new EgCacheManager(
          axios,
          selfId,
          props.egCache,
          props.requestUrl
        );
        provide(CACHE_MANAGER_KEY, manager);
        return manager;
      }
      return undefined;
    })();

    // Important!
    provide(IFORM_KEY, form);
    provide(IS_EDIT_KEY, isUpdate);

    const initial: Target = props.target ?? {};
    const intEntity: Target = cacheManager
      ? cacheManager.cacheReactive(initial)
      : reactive(initial);

    /* watchEffect(() => {
        if (!get(intEntity, props.translationProp)) {
          set(intEntity, props.translationProp, {});
        }
      }); */

    const i18nTarget = computed(() => get(intEntity, props.translationProp));
    const intI18nItems = ref<any[]>(props.i18nItems ?? []);

    watch(
      () => props.target,
      (val) => {
        if (val) {
          Object.assign(intEntity, val);
        }
      },
      { deep: true }
    );

    watch(
      () => props.i18nItems,
      (val) => {
        if (val) {
          intI18nItems.value = val;
        }
      },
      { deep: true }
    );

    if (props.defaults) {
      Object.assign(intEntity, props.defaults);
    }

    if (isUpdate) {
      unset(intEntity, props.translationProp);
    } else if (!props.target || !get(props.target, props.translationProp)) {
      set(intEntity, props.translationProp, {});
    }

    function i18nUrl() {
      if (props.i18nRequestUrl) {
        return `${props.i18nRequestUrl}`;
      }

      return `${props.requestUrl}_i18n`;
    }

    async function createEntity() {
      let entity: Target = intEntity;

      if (props.prepareCreate) {
        entity = cloneDeep(intEntity);
        props.prepareCreate(entity);
      }

      const reqData = props.useMultipart ? multipartData(entity) : entity;

      await axios.buildResponse({
        notify: "always",
        request: {
          method: "POST",
          url: `${props.requestUrl}/`,
          data: reqData,
          headers: { "Content-Type": "multipart/form-data" },
        },
        ifOk: ({ payload }) => {
          const entityId = get(payload, props.idProp);

          axios.buildResponses({
            requests: intI18nItems.value.map((i18n) => {
              const cloned = clone(i18n);
              set(cloned, props.i18nItemFkProp, entityId);

              return axios.fetchResponse({
                method: "POST",
                url: `${i18nUrl()}/`,
                data: cloned,
              });
            }),

            ifOk: () => {
              router.replace(props.requestUrl);
            },
          });
        },
      });
    }

    async function updateEntity() {
      let entity: Target = intEntity;
      let cachePromises: Promise<Response>[] = [];

      if (cacheManager) {
        [entity, cachePromises] = cacheManager.makePromise();

        if (props.prepareUpdate) {
          props.prepareUpdate(entity);
        }
      } else if (props.prepareUpdate) {
        entity = cloneDeep(intEntity);
        props.prepareUpdate(entity);
      }

      const [reqData, headers] = (() => {
        if (props.useMultipart) {
          const form = multipartData(entity);
          return [form, { "Content-Type": "multipart/form-data" }];
        }

        return [entity, { "Content-Type": "application/json" }];
      })();

      await axios.buildResponses({
        notify: "always",
        requests: [
          axios.fetchResponse({
            method: "PATCH",
            url: `${props.requestUrl}/${selfId}/`,
            data: reqData,
            headers: headers,
          }),
          axios.buildResponses({
            requests: intI18nItems.value.map((i18n) => {
              if (i18n.id) {
                return axios.fetchResponse({
                  method: "PATCH",
                  url: `${i18nUrl()}/${i18n.id}/`,
                  data: i18n,
                });
              } else {
                const cloned = clone(i18n);
                set(cloned, props.i18nItemFkProp, selfId);

                return axios.fetchResponse({
                  method: "POST",
                  url: `${i18nUrl()}/`,
                  data: cloned,
                });
              }
            }),
          }),
          ...cachePromises,
        ],
      });
    }

    async function execute() {
      isSaving.value = true;

      if (await formI18n.value.execute()) {
        if (isUpdate) {
          await updateEntity();
        } else {
          await createEntity();
        }
      }

      isSaving.value = false;
    }

    function goList() {
      const path = route.fullPath.substring(
        0,
        isUpdate && selfId
          ? route.fullPath.indexOf(selfId) - 1
          : route.fullPath.indexOf("create") - 1
      );
      router.replace(path);
    }

    if (isUpdate && selfId) {
      const promises = [
        axios.fetchResponse({
          method: "GET",
          url: `${props.requestUrl}/${selfId}/`,
        }),
        axios.fetchResponse({
          paginated: true,
          request: {
            method: "GET",
            url: `${i18nUrl()}/`,
            params: { [props.i18nItemFkProp]: selfId },
          },
        }),
      ];

      const iPromises = props.initialRequests?.map((x) =>
        typeof x === "function" ? x(selfId) : x
      );

      onBeforeMount(() => {
        axios.buildResponses({
          requests:
            iPromises && iPromises.length > 0
              ? promises.concat(iPromises.map((x) => x.request))
              : promises,

          ifOk: (ok) => {
            const entity = ok[0];
            unset(entity, props.translationProp);
            Object.assign(intEntity, entity);

            if (cacheManager) {
              cacheManager.start(intEntity);
            }

            const i18n = ok[1];
            intI18nItems.value =
              i18n instanceof Paginator ? i18n.results : i18n;

            if (iPromises) {
              for (let idx = 2; idx < ok.length; idx++) {
                const initialRequest = iPromises[idx - promises.length];
                if (initialRequest.mutation) {
                  const outerOk = ok[idx];
                  initialRequest.mutation(outerOk, entity);
                }
              }
            }

            if (cacheManager) {
              // TODO
              isLoading.value = false;
            } else {
              isLoading.value = false;
            }
          },

          ifErr: () => {
            router.replace(props.requestUrl);
            return;
          },
        });
      });
    } else if (props.initialRequests) {
      const iPromises = props.initialRequests.filter(isParentRequest);

      if (iPromises.length > 0) {
        onBeforeMount(() => {
          axios.buildResponses({
            requests: iPromises.map((x) => x.request),

            ifOk: (ok: (any | Paginator)[]) => {
              const entity = ok[0];
              unset(entity, props.translationProp);

              Object.assign(intEntity, entity);
              intI18nItems.value = ok[1].results;

              if (iPromises) {
                for (let idx = 2; idx < ok.length; idx++) {
                  iPromises[idx].mutation?.(ok[idx], entity);
                }
              }

              isLoading.value = false;
            },

            ifErr: () => {
              router.replace(props.requestUrl);
              return;
            },
          });
        });
      }
    }

    return {
      execute,
      form,
      formI18n,
      get,
      goList,
      i18nTarget,
      intEntity,
      intI18nItems,
      isI18nLoading,
      isLoading,
      isSaving,
      isUpdate,
      route,
      t,
      xs,
    };
  },
});
</script>

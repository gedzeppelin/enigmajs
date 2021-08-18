<template lang="pug">
el-card(v-bind="$attrs", shadow="never")
  template(v-slot:header)
    el-row(align="middle", justify="space-between", type="flex")
      el-col.is-first(:sm="12", :span="24")
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
          :disabled="isSaving || isLoading",
          @click="form.resetFields()",
          type="danger"
        ) {{ t('cmn.reset') }}
        el-button(
          :disabled="isSaving || isLoading",
          :loading="isSaving",
          @click="execute",
          type="primary"
        ) {{ isUpdate ? t('crud.update') : t('crud.create') }}

  eg-loader(v-if="isLoading", :height="500")
  el-form(
    ref="form",
    v-bind="$attrs",
    v-else,
    :model="model ?? intEntity",
    :rules="rules"
  )
    slot(
      :entity="intEntity",
      :isLoading="isLoading",
      :isSaving="isSaving",
      :isUpdate="isUpdate"
    )
</template>

<script lang="ts">
import {
  PropType,
  Ref,
  defineComponent,
  onBeforeMount,
  provide,
  reactive,
  ref,
  watch,
  onMounted,
} from "vue";

import { multipartData } from "enigmajs-core";
import { get } from "lodash";
import { useI18n } from "../plugins/i18n";
import { useRoute, useRouter } from "vue-router";

import { IFORM_KEY, IS_EDIT_KEY, Rules } from "..";
import { IForm } from "../form-i18n";
import { useAxios } from "../plugins/axios";

import { Target } from "../types";

export default defineComponent({
  name: "EgCu",
  props: {
    model: { type: Object as PropType<Target>, default: undefined },
    target: { type: Object as PropType<Target>, default: undefined },

    requestUrl: {
      type: String,
      required: true,
      validator: (value: string) => /^\/.*[^/]$/.test(value),
    },

    rules: { type: Object as PropType<Rules>, default: undefined },
    defaults: { type: Object as PropType<Target>, default: undefined },

    idRouterProp: { type: String, default: "id" },
    idProp: { type: String, default: "id" },

    useMultipart: { type: Boolean, default: false },
  },
  setup(props) {
    const axios = useAxios();
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();

    const form = ref<IForm>() as Ref<IForm>;

    const selfId = get(route.params, props.idRouterProp) as string | undefined;
    const isUpdate = selfId !== undefined;

    const isLoading = ref(isUpdate);
    const isSaving = ref(false);

    // Important!
    provide(IFORM_KEY, form);
    provide(IS_EDIT_KEY, isUpdate);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const intEntity = reactive<any>(props.model ?? {});

    watch(
      () => props.target,
      (val) => {
        if (val) {
          Object.assign(intEntity, val);
        }
      },
      { deep: true }
    );

    if (props.defaults) {
      Object.assign(intEntity, props.defaults);
    }

    function prepareRequest(
      entity: Target
    ): [Target | FormData, { "Content-Type": string }] {
      if (props.useMultipart) {
        const form = multipartData(entity);
        return [form, { "Content-Type": "multipart/form-data" }];
      }

      return [entity, { "Content-Type": "application/json" }];
    }

    async function createEntity() {
      const [reqData, headers] = prepareRequest(intEntity);

      await axios.buildResponse({
        notify: "always",
        request: {
          method: "POST",
          url: `${props.requestUrl}/`,
          data: reqData,
          headers: headers,
        },
      });
    }

    async function updateEntity() {
      const [reqData, headers] = prepareRequest(intEntity);

      await axios.buildResponse({
        notify: "always",
        request: {
          method: "PATCH",
          url: `${props.requestUrl}/${selfId}/`,
          data: reqData,
          headers: headers,
        },
      });
    }

    async function execute() {
      isSaving.value = true;
      let valid;

      try {
        valid = await form.value.validate();
      } catch {
        valid = false;
      }

      if (valid) {
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
      onBeforeMount(() => {
        axios.buildResponse({
          request: `${props.requestUrl}/${selfId}`,

          ifOk: ({ payload }) => {
            Object.assign(intEntity, payload);
            isLoading.value = false;
          },

          ifErr: () => {
            router.replace(props.requestUrl);
          },
        });
      });
    }

    onMounted(() => {
      //console.log(form.value);
    });

    return {
      execute,
      form,
      get,
      goList,
      intEntity,
      isLoading,
      isSaving,
      isUpdate,
      route,
      t,
    };
  },
});
</script>

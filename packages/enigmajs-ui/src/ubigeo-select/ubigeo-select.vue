<template lang="pug">
.eg-ubigeo-select
  eg-promise-select(
    ref="dptoSelect",
    v-model="dpto",
    :auto-fetch="!hasModel",
    :disabled="hasModel ? dpto === undefined : false",
    :fetch-on-start="!hasModel",
    :paginated="false",
    :placeholder="t('eg.ubigeo-select.dpto')",
    :searchable="false",
    @change="dptoChange",
    label-prop="name",
    source="/ubigeos",
    value-prop="coddpto",
    width="32%"
  )
  eg-promise-select.mx-auto(
    ref="provSelect",
    v-model="prov",
    :auto-fetch="false",
    :disabled="dpto === undefined",
    :fetch-on-start="false",
    :paginated="false",
    :placeholder="t('eg.ubigeo-select.prov')",
    :request-config="{ params: { coddpto } }",
    :searchable="false",
    @change="provChange",
    label-prop="name",
    source="/ubigeos",
    value-prop="codprov",
    width="32%"
  )
  eg-promise-select(
    ref="distSelect",
    v-model="dist",
    :auto-fetch="false",
    :disabled="prov === undefined",
    :fetch-on-start="false",
    :paginated="false",
    :placeholder="t('eg.ubigeo-select.dist')",
    :request-config="{ params: { coddpto, codprov } }",
    :searchable="false",
    @change="distChange",
    label-prop="name",
    source="/ubigeos",
    width="32%"
  )
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, ref, inject } from "vue";
import { elFormItemKey } from "element-plus/packages/form/src/token";
import { useI18n } from "vue-i18n";
import { isNil } from "lodash";

import { useAxios } from "../plugins/axios";

interface Ubigeo {
  coddpto: number;
  codprov: number;
  coddist: number;
  name: string;
  is_dpto: boolean;
  is_prov: boolean;
  is_dist: boolean;
  dpto_name: string;
  prov_name: string;
  dist_name: string;
  is_active: boolean;
}

export default defineComponent({
  name: "eg-ubigeo-select",
  props: {
    modelValue: [Number, String],

    selected: [Number, String],
    initialSelected: { type: Boolean, default: true },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const axios = useAxios();
    const { t } = useI18n();

    const form = inject(elFormItemKey, undefined);

    const hasModel = ref(false);
    let mvGuard = false;

    const dptoSelect = ref();
    const provSelect = ref();
    const distSelect = ref();

    const coddpto = ref<unknown>();
    const codprov = ref<unknown>();

    const dpto = ref<number>();
    const prov = ref<number>();
    const dist = ref<number>();

    if (
      !isNil(props.selected) ||
      (props.initialSelected && !isNil(props.modelValue))
    ) {
      mvGuard = true;
      hasModel.value = true;

      onMounted(async () => {
        await axios.buildResponse<Ubigeo>({
          notify: false,
          request: `/ubigeos/${props.selected ?? props.modelValue}`,
          ifOk: async ({ payload }) => {
            coddpto.value = payload.coddpto;
            codprov.value = payload.codprov;

            await nextTick();

            await Promise.allSettled([
              dptoSelect.value.refresh(() => {
                dptoSelect.value.pickByProp("name", payload.dpto_name);
              }),

              provSelect.value.refresh(() => {
                provSelect.value.pickByProp("name", payload.prov_name);
              }),

              distSelect.value.refresh(() => {
                distSelect.value.pickByProp("name", payload.dist_name);
              }),
            ]);
          },
        });

        mvGuard = false;
      });
    }

    return {
      coddpto,
      codprov,
      dist,
      distSelect,
      dpto,
      dptoSelect,
      hasModel,
      prov,
      provSelect,
      t,

      async dptoChange(evt: unknown) {
        if (!mvGuard) {
          prov.value = undefined;
          dist.value = undefined;
          emit("update:modelValue", undefined);

          if (evt !== undefined) {
            coddpto.value = evt;
            await nextTick();
            provSelect.value.refresh();
          }
        }
      },
      async provChange(evt: unknown) {
        if (!mvGuard) {
          dist.value = undefined;
          emit("update:modelValue", undefined);

          if (evt !== undefined) {
            codprov.value = evt;
            await nextTick();
            distSelect.value.refresh();
          }
        }
      },
      async distChange(evt: unknown) {
        if (!mvGuard) {
          emit("update:modelValue", evt);
          form?.validate();
        }
      },
    };
  },
});
</script>

<style>
.eg-ubigeo-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

<template lang="pug">
template(v-if="column.property")
  el-switch(
    v-bind="$attrs",
    v-model="row[column.property]",
    :disabled="disableButton(row)",
    :loading="isUpdating",
    @change="onChange(row, column, $event)"
  )
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, ref, inject, PropType } from "vue";

import { useAxios } from "../../plugins/axios";
import { PAGINATOR_CTX_KEY } from "./paginator.vue";
import { get, isNil, set } from "lodash";

export default defineComponent({
  name: "EgColumnUpdateInner",
  props: {
    idProp: { type: String, required: true },
    row: { type: Object, required: true },
    column: { type: Object as PropType<{ property?: string }>, required: true },
    disabled: {
      type: [Boolean, Function] as PropType<((row: any) => boolean) | boolean>,
      default: undefined,
    },
  },
  emits: {
    change: (row: any) => row,
  },
  setup(props, { emit }) {
    const axios = useAxios();

    const ctx = inject(PAGINATOR_CTX_KEY);
    const isUpdating = ref(false);

    function onChange(row: any, column: typeof props.column, value: boolean) {
      if (isNil(ctx)) {
        throw new Error("(row-actions) paginator context was not injected");
      }

      const objProp = column.property;
      if (isNil(objProp)) {
        throw new Error("(row-actions) paginator column prop was undefined");
      }

      isUpdating.value = true;
      const { source, updateUrl } = ctx.props;

      axios.buildResponse({
        notify: "always",
        request: {
          method: "PATCH",
          url: `${updateUrl ?? source}/${get(row, props.idProp)}/`,
          data: { [objProp]: value },
        },

        ifOk: () => {
          emit("change", row);
        },
        ifErr: () => {
          set(row, objProp, !value);
        },
        finally: () => {
          isUpdating.value = false;
        },
      });
    }

    function disableButton(row: any) {
      if (typeof props.disabled === "function") {
        return props.disabled(row);
      }

      return props.disabled;
    }

    return { disableButton, isUpdating, onChange };
  },
});
</script>

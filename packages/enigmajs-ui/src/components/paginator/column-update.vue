<template lang="pug">
el-table-column(v-bind="$attrs", align="center")
  template(v-slot="{ row, column }")
    eg-column-update--inner(
      v-bind="$attrs",
      :column="column",
      :disabled="disabled",
      :id-prop="idProp",
      :row="row",
      @change="$emit('change', $event)"
    )
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, PropType } from "vue";

import EgColumnUpdateInner from "./column-update--inner.vue";

export default defineComponent({
  name: "EgColumnUpdate",
  components: { "eg-column-update--inner": EgColumnUpdateInner },
  props: {
    idProp: { type: String, default: "id" },
    disabled: {
      type: [Boolean, Function] as PropType<((row: any) => boolean) | boolean>,
      default: undefined,
    },
  },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    change: (row: any) => row,
  },
});
</script>

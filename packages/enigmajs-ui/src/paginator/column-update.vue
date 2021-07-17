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

import EgColumnUpdateInner from "../column-update--inner.vue";

export default defineComponent({
  name: "eg-column-update",
  components: { "eg-column-update--inner": EgColumnUpdateInner },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    change: (row: any) => row,
  },
  props: {
    idProp: { type: String, default: "id" },
    // eslint-disable-next-line prettier/prettier
    disabled: [Boolean, Function] as PropType<((row: any) => boolean) | boolean>,
  },
});
</script>

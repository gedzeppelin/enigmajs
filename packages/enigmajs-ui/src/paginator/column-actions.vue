<template lang="pug">
el-table-column(align="right", column-key="id", width="200")
  template(v-slot="{ row }")
    eg-column-actions--inner(
      :id-prop="idProp",
      :no-delete="noDelete",
      :no-update="noUpdate",
      :row="row",
      @row-deleted="$emit('row-deleted', $event)"
    )
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, PropType } from "vue";

import EgColumnActionsInner from "../column-actions--inner.vue";

export default defineComponent({
  name: "eg-column-actions",
  components: { "eg-column-actions--inner": EgColumnActionsInner },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "row-deleted": (row: any) => row,
  },
  props: {
    idProp: { type: String, default: "id" },
    // eslint-disable-next-line prettier/prettier
    noUpdate: [Boolean, Function] as PropType<((row: any) => boolean) | boolean>,
    // eslint-disable-next-line prettier/prettier
    noDelete: [Boolean, Function] as PropType<((row: any) => boolean) | boolean>,
  },
});
</script>

<template lang="pug">
el-menu(
  :collapse="collapse",
  :collapse-transition="false",
  :default-active="$route.path"
)
  eg-nav-item(:collapse="collapse", :drawer-data="drawerData")
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { DrawerData } from ".";

export default defineComponent({
  name: "EgNavMenu",
  props: {
    drawerData: { type: Array as PropType<DrawerData>, required: true },
    collapse: { type: Boolean, required: true },
  },
});
</script>

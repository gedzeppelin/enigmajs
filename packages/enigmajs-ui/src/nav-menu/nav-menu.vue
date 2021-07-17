<template lang="pug">
el-menu(
  :collapse="navCollapsed",
  :collapse-transition="false",
  :default-active="$route.path"
)
  eg-nav-item(:drawer-data="drawerData", :nav-collapsed="navCollapsed")
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { DrawerData } from ".";

export default defineComponent({
  name: "eg-nav-menu",
  props: {
    drawerData: { type: Array as PropType<DrawerData>, required: true },
    navCollapsed: { type: Boolean, required: true },
  },
});
</script>

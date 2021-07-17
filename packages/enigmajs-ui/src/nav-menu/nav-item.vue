<template lang="pug">
template(v-for="(item, idx) in drawerData")
  el-submenu.eg-nav-item(v-if="item.children", :index="getIndex(idx)")
    template(v-slot:title) 
      i(v-if="item.icon", :class="[item.icon]")
      span {{ getTitle(item.title) }}
    el-menu-item-group
      template(v-if="navCollapsed", v-slot:title) {{ getTitle(item.title) }}
      eg-nav-item(
        :before="getIndex(idx)",
        :drawer-data="item.children",
        :nav-collapsed="navCollapsed"
      )
  router-link.eg-nav-item(v-else, :to="item.path")
    el-menu-item(:index="item.path")
      i(v-if="item.icon", :class="[item.icon]")
      template(v-slot:title) {{ getTitle(item.title) }}
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useI18n } from "vue-i18n";

import { DrawerGroup, DrawerItem } from ".";

export default defineComponent({
  name: "eg-nav-item",
  props: {
    drawerData: {
      type: Array as PropType<(DrawerGroup & DrawerItem)[]>,
      required: true,
    },
    navCollapsed: { type: Boolean, required: true },
    before: { type: String, default: "" },
  },
  setup(props) {
    const { t } = useI18n();

    return {
      getTitle: (title: DrawerItem["title"]) =>
        typeof title === "function" ? title() : t(title),
      getIndex: (idx: number) =>
        props.before ? `${props.before}-${idx}` : String(idx),
    };
  },
});
</script>

<style lang="scss">
.eg-nav-item {
  text-decoration: none;
  user-select: none;

  & span,
  & li {
    user-select: none;
  }
}
</style>

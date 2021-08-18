<template lang="pug">
template(v-for="(item, idx) in drawerData")
  el-submenu.eg-nav-item(v-if="isGroup(item)", :index="getIndex(idx)")
    template(v-slot:title) 
      i(v-if="item.icon", :class="[item.icon]")
      span {{ getTitle(item.title) }}
    eg-nav-item(
      :before="getIndex(idx)",
      :collapse="collapse",
      :drawer-data="item.children"
    )
    // el-menu-item-group
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
import { useI18n } from "../plugins/i18n";
import { DrawerData, DrawerGroup, DrawerItem } from ".";

export default defineComponent({
  name: "EgNavItem",
  props: {
    drawerData: {
      type: Array as PropType<DrawerData>,
      required: true,
    },
    collapse: { type: Boolean, required: true },
    before: { type: String, default: "" },
  },
  setup(props) {
    const { t } = useI18n();

    return {
      getTitle: (title: DrawerItem["title"]) =>
        typeof title === "function" ? title() : t(title),
      getIndex: (idx: number) =>
        props.before ? `${props.before}-${idx}` : String(idx),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isGroup: (item: any): item is DrawerGroup => Array.isArray(item.children),
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

<template>
  <template v-for="(item, idx) in drawerData" :key="idx">
    <el-sub-menu
      v-if="isGroup(item)"
      class="eg-nav-item"
      :index="getIndex(idx)"
    >
      <template #title>
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <span>{{ getTitle(item.title) }}</span>
      </template>
      <eg-nav-item
        :before="getIndex(idx)"
        :collapse="collapse"
        :drawer-data="item.children"
      />
      <!-- el-menu-item-group ElIcon
    template(v-if="navCollapsed", v-slot:title) {{ getTitle(item.title) }}
    eg-nav-item(
      :before="getIndex(idx)",
      :drawer-data="item.children",
      :nav-collapsed="navCollapsed"
    )
    -->
    </el-sub-menu>

    <router-link v-else class="eg-nav-item" :to="item.path">
      <el-menu-item :index="item.path">
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <template #title>{{ getTitle(item.title) }}</template>
      </el-menu-item>
    </router-link>
  </template>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useI18n } from "../../plugins/i18n";
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

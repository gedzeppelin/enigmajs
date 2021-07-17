<template lang="pug">
el-table-column(type="expand")
  template(#default="props")
    el-tabs.eg-row-details(
      :modelValue="activeTab",
      @update:modelValue="saveSettings($event)",
      type="card"
    )
      el-tab-pane(:label="t('cmn.list')", name="list")
        eg-object-tree(:obj="props.row")
      el-tab-pane(label="Json", name="json")
        json-tree(:data="props.row", :level="1")
      el-tab-pane.text-center(
        v-if="hasImage",
        :label="t('cmn.image')",
        name="image"
      )
        el-image.eg-row-details__img(
          :src="props.row[imageProp]",
          fit="contain"
        )
          template(#placeholder)
            el-skeleton(animated)
              template(#template)
                el-skeleton-item.img-skeleton(variant="image")
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useI18n } from "vue-i18n";

import JsonTree from "vue-json-tree";

const imageTabKey = "eg-row-details.image.tab";
const tabKey = "eg-row-details.no_image.tab";

export default defineComponent({
  name: "eg-row-details",
  components: { JsonTree },
  props: {
    hasImage: {
      type: Boolean,
      default: false,
    },
    imageProp: {
      type: String,
      default: "image",
    },
  },
  setup(props) {
    const { t } = useI18n();

    const activeTab = ref(
      localStorage.getItem(props.hasImage ? imageTabKey : tabKey) ?? "list"
    );

    function saveSettings(value: string) {
      localStorage.setItem(props.hasImage ? imageTabKey : tabKey, value);
    }

    return { activeTab, saveSettings, t };
  },
});
</script>

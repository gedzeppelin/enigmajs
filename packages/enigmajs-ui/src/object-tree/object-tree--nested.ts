import { h, defineComponent, VNode, ref } from "vue";

import EgObjectTree from "./object-tree";

export default defineComponent({
  name: "eg-object-tree--nested",
  components: { EgObjectTree },
  props: {
    label: {
      type: String,
      required: true,
    },
    obj: {
      type: Object,
      required: true,
    },
    deep: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const isVisible = ref(false);

    function renderLabel(): VNode {
      return h(
        "span",
        {
          class: ["eg-object-tree__item-deep"],
          onClick: () => (isVisible.value = !isVisible.value),
        },
        isVisible.value
          ? [
              h("i", {
                class: ["el-icon-caret-bottom", "eg-object-tree__item-icon"],
              }),
              h("b", `${props.label}:`),
            ]
          : [
              h("i", {
                class: ["el-icon-caret-right", "eg-object-tree__item-icon"],
              }),
              h("b", `${props.label}: `),
              //- TODO fix pls :(
              h("pre", { style: [{ margin: 0 }] }, " "),
              h(
                "i",
                { class: ["json-tree-collapsed"] },
                `/* ${Object.keys(props.obj).length} items */`
              ),
            ]
      );
    }
    return () =>
      isVisible.value
        ? h("div", null, [
            renderLabel(),
            h(
              "div",
              props.deep > 0
                ? { style: [{ "margin-left": `${props.deep * 16}px` }] }
                : null,
              h(EgObjectTree, {
                obj: props.obj,
                deep: props.deep,
              })
            ),
          ])
        : renderLabel();
  },
});

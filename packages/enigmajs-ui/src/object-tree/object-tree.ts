import { h, defineComponent, VNode } from "vue";
import { useI18n } from "../plugins/i18n";

// import EgObjectTreeNested from "./object-tree--nested";

export default defineComponent({
  name: "EgObjectTree",
  props: {
    obj: {
      type: Object,
      required: true,
    },
    deep: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  setup(props) {
    const { t } = useI18n();

    function isUrl(value: string): boolean {
      let url;

      try {
        url = new URL(value);
      } catch (_) {
        return false;
      }

      return url.protocol === "http:" || url.protocol === "https:";
    }

    function isDate(value: string): Date | undefined {
      try {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          return d;
        }
      } catch (_) {
        return undefined;
      }
    }

    function isNumber(value: string): boolean {
      try {
        const n = parseFloat(value);
        return n === Number(n);
      } catch (_) {
        return false;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function renderPrimitive(value: any | null): VNode {
      if (value === null) {
        return h(
          "i",
          { class: ["eg-object-tree__value-null"] },
          t("app.empty_field")
        );
      }

      if (typeof value === "string") {
        if (isUrl(value)) {
          return h("a", { href: value, target: "_blank" }, value);
        }

        const date = isDate(value);
        if (date) {
          return h(
            "span",
            { class: ["eg-object-tree__value-date"] },
            date.toLocaleString()
          );
        }

        if (isNumber(value)) {
          return h("span", { class: ["eg-object-tree__value-number"] }, value);
        }

        return h("span", { class: ["eg-object-tree__value-string"] }, value);
      }

      return h(
        "span",
        { class: [`eg-object-tree__value-${typeof value}`] },
        value.toString()
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function renderObject(obj: Record<string, any>, deep: number): VNode[] {
      return Object.entries(obj).map(([key, value]) =>
        value && typeof value === "object"
          ? h(/* EgObjectTreeNested */ "div", {
              label: key,
              obj: value,
              deep: deep,
            })
          : h("span", { class: ["eg-object-tree__item"] }, [
              h("b", `${key}: `),
              renderPrimitive(value),
            ])
      );
    }

    return () =>
      h(
        "div",
        props.deep === 0 ? { class: ["eg-object-tree"] } : null,
        renderObject(props.obj, props.deep + 1)
      );
  },
});

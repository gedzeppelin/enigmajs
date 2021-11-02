/* import { h, defineComponent } from "vue";

export const EgBackground = defineComponent({
  name: "EgBackground",
  props: {
    url: {
      type: String,
      required: true,
    },
    opacity: {
      type: Number,
      default: 0.125,
    },
  },
  setup(props) {
    return () =>
      h(
        "div",
        {
          class: ["eg-background"],
          style: [
            { backgroundImage: `url(${props.url})` },
            { opacity: props.opacity },
          ],
        },
        [props.url]
      );
  },
});
 */

export { default as EgBackground } from "./index.vue";

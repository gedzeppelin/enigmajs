import { h, defineComponent } from "vue";

export default defineComponent({
  name: "eg-background",
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

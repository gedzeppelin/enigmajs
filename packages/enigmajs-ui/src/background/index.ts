import { h, defineComponent, App } from "vue";

const egBackground = defineComponent({
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

egBackground.install = (app: App) => {
  app.component(egBackground.name, egBackground);
};

export default egBackground;

<template>
  <div
    class="eg-background"
    :style="{ backgroundImage: `url(${url})`, opacity: opacity }"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
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
  /* setup() {
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
  }, */
});
</script>

<style>
.eg-background {
  position: absolute;
  width: 100%;
  height: 100%;
  background-repeat: repeat;
}
</style>

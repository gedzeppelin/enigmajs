<template lang="pug">
.eg-loader(:style="{ height: getSize(height), width: getSize(width) }")
  div
    img(
      :src="src",
      :style="{ height: getSize(logoHeight), width: getSize(logoWidth) }"
    )
    .spinner.mt-2
      .rect1
      .rect2
      .rect3
      .rect4
      .rect5
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "EgLoader",
  props: {
    src: { type: String, required: true },
    height: { type: [String, Number], default: 250 },
    width: { type: [String, Number], default: "auto" },
    logoHeight: { type: [String, Number], default: 125 },
    logoWidth: { type: [String, Number], default: 125 },
  },
  setup() {
    const getSize = (input: string | number): string =>
      typeof input === "number" ? `${input}px` : input;

    return { getSize };
  },
});
</script>

<style lang="scss">
.eg-loader {
  position: relative;

  & > div {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.spinner {
  width: 50px;
  height: 40px;
  font-size: 10px;
  margin: auto;

  & > div {
    background-color: #625d20;
    height: 100%;
    width: 6px;
    display: inline-block;
    margin-left: 2px;
    margin-right: 2px;

    -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;
    animation: sk-stretchdelay 1.2s infinite ease-in-out;
  }

  & .rect2 {
    -webkit-animation-delay: -1.1s;
    animation-delay: -1.1s;
  }

  & .rect3 {
    -webkit-animation-delay: -1s;
    animation-delay: -1s;
  }

  & .rect4 {
    -webkit-animation-delay: -0.9s;
    animation-delay: -0.9s;
  }

  & .rect5 {
    -webkit-animation-delay: -0.8s;
    animation-delay: -0.8s;
  }
}

@-webkit-keyframes sk-stretchdelay {
  0%,
  40%,
  100% {
    -webkit-transform: scaleY(0.4);
  }

  20% {
    -webkit-transform: scaleY(1);
  }
}

@keyframes sk-stretchdelay {
  0%,
  40%,
  100% {
    transform: scaleY(0.4);
    -webkit-transform: scaleY(0.4);
  }

  20% {
    transform: scaleY(1);
    -webkit-transform: scaleY(1);
  }
}
</style>

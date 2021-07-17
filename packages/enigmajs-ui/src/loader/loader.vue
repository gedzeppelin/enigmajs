<template lang="pug">
.eg-loader(:style="{ height: loaderHeight }")
  div
    img.logo(:src="require('@/assets/logo.jpg')")
    .spinner.mt-2
      .rect1
      .rect2
      .rect3
      .rect4
      .rect5
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "eg-loader",
  props: {
    height: { type: [String, Number], default: 400 },
  },
  setup(props) {
    return {
      loaderHeight: computed(() => {
        const height = props.height;
        if (typeof height === "number") {
          return `${height}px`;
        }

        const nHeight = Number(height);
        if (!isNaN(nHeight)) {
          return `${height}px`;
        }

        return height;
      }),
    };
  },
});
</script>

<style lang="scss">
.eg-loader {
  position: relative;
  //height: 400px;
  opacity: 0.75;

  & > div {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  & .logo {
    display: block;
    width: 125px;
    height: 125px;
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

    -webkit-animation: sk-stretch-delay 1.2s infinite ease-in-out;
    animation: sk-stretch-delay 1.2s infinite ease-in-out;
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

@-webkit-keyframes sk-stretch-delay {
  0%,
  40%,
  100% {
    -webkit-transform: scaleY(0.4);
  }

  20% {
    -webkit-transform: scaleY(1);
  }
}

@keyframes sk-stretch-delay {
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

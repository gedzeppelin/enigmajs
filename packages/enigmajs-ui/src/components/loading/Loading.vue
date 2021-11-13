<template>
  <div
    class="relative"
    :style="{ height: getSize(height), width: getSize(width) }"
  >
    <div
      class="
        absolute
        top-1/2
        left-1/2
        transform
        -translate-x-1/2 -translate-y-1/2
      "
    >
      <img
        v-if="src"
        :src="src"
        :style="{ height: getSize(logoHeight), width: getSize(logoWidth) }"
      />
      <div v-else>{{ t("eg.loading") }}</div>

      <div class="h-10 mt-2 space-x-1.5 w-max mx-auto">
        <div
          v-for="r in 5"
          :key="r"
          class="h-full inline-block w-2 bg-gray-600 animate-inflate-y"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useI18n } from "../../plugins/i18n";

export default defineComponent({
  name: "EgLoading",
  props: {
    src: { type: String, default: undefined },
    height: { type: [String, Number], default: 250 },
    width: { type: [String, Number], default: "auto" },
    logoHeight: { type: [String, Number], default: 125 },
    logoWidth: { type: [String, Number], default: 125 },
  },
  setup() {
    const { t } = useI18n();

    const getSize = (input: string | number): string =>
      typeof input === "number" ? `${input}px` : input;

    return { getSize, t };
  },
});
</script>

<style lang="scss">
.spinner {
  & .rect2 {
    animation-delay: -1.1s;
  }

  & .rect3 {
    animation-delay: -1s;
  }

  & .rect4 {
    animation-delay: -0.9s;
  }

  & .rect5 {
    animation-delay: -0.8s;
  }
}
</style>

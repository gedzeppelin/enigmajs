<template lang="pug">
.eg-file-input.eg-section(
  :class="[{ 'is-dragover': dragover }, internal.length > 0 ? activeClass : '']",
  @click="onClick",
  @dragleave.prevent="dragover = false",
  @dragover.prevent="dragover = true",
  @drop.prevent="onDrop"
)
  input.hidden(
    ref="inputFile",
    :accept="accept",
    :disabled="disabled",
    :multiple="multiple",
    @change="onInputChange",
    type="file"
  )
  slot(v-if="$slots.default", :files="internal")
  .eg-file-input__content(v-else, @drop.prevent)
    i.el-icon-upload
    .is-text {{ t('cmn.drag_file') }}
      em {{ t('eg.file_input.click_upload') }}
</template>

<script lang="ts">
import { defineComponent, inject, PropType, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { isNil } from "lodash";

import { IFileInput, INTERNAL_KEY, MUTATE_INTERNAL_KEY, ModelValue } from ".";

export default defineComponent({
  name: "eg-file-input",
  props: {
    modelValue: Object as PropType<ModelValue>,

    activeClass: { type: String, default: "is-not-empty" },
    accept: { type: String, default: "image/*" },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },

  emits: ["update:modelValue", "change", "dropFiles"],
  setup(props, { emit, expose }) {
    const { t } = useI18n();

    // SECTION Internal values.

    const internal = inject(INTERNAL_KEY, ref([]));
    const mutateInternal = inject(
      MUTATE_INTERNAL_KEY,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      function (value, _dragged) {
        if (internal.value !== value) {
          internal.value = value;
          const modelValue = getModelValue();

          emit("update:modelValue", modelValue);
          emit("change", modelValue);
        }
      }
    );

    watch(
      () => props.modelValue,
      (value) => {
        if (internal.value !== value) {
          setInternal(value);
          emit("change", getModelValue());
        }
      }
    );

    // !SECTION

    function setInternal(input: ModelValue) {
      const value = isNil(input) ? [] : Array.isArray(input) ? input : [input];
      internal.value = value;
    }

    function getModelValue(): ModelValue {
      if (props.multiple) {
        return internal.value;
      }

      if (internal.value.length > 0) {
        return internal.value[0];
      }

      return undefined;
    }

    const inputFile = ref<HTMLInputElement>();
    const dragover = ref(false);

    function clear() {
      const nativePicker = inputFile.value;
      if (nativePicker) {
        mutateInternal([], false);
        nativePicker.value = "";
      }
    }

    function clearPicker() {
      const nativePicker = inputFile.value;
      if (nativePicker) {
        nativePicker.value = "";
      }
    }

    async function nativeClick() {
      inputFile.value?.click();
    }

    function onClick() {
      if (internal.value.length === 0) {
        inputFile.value?.click();
      }
    }

    function onInputChange(e: Event) {
      if (e.target !== null) {
        const et = e.target as HTMLInputElement;
        if (et.files !== null && et.files.length > 0) {
          mutateInternal(Array.from(et.files), false);
        }
      }
    }

    function onDrop(e: DragEvent) {
      const edt = e.dataTransfer;
      if (edt && edt.files.length > 0) {
        const files = Array.from(edt.files);
        mutateInternal(files, true);
        emit("dropFiles", files);
      }
      dragover.value = false;
    }

    const exposed: IFileInput = {
      clear,
      clearPicker,
      nativeClick,

      deleteFile(idx: number) {
        internal.value.splice(idx, 1);
      },
      modifyFile(val: File, idx: number) {
        internal.value[idx] = val;
      },
      insertFile(val: File, idx: number) {
        internal.value.splice(idx, 0, val);
      },
      insertFiles(val: File[], idx: number) {
        internal.value.splice(idx, 0, ...val);
      },
    };

    expose(exposed);

    return {
      dragover,
      inputFile,
      internal,
      nativeClick,
      onClick,
      onDrop,
      onInputChange,
      t,
    };
  },
});
</script>

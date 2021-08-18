<template lang="pug">
eg-file-input(
  ref="fileInput",
  :class="[{ 'is-float': float, 'is-multiple': multiple }]",
  :disabled="disabled",
  :multiple="multiple && modifyIndex < 0",
  :style="{ 'margin-left: 200px;': float }",
  @dropFiles="dragged = true"
)
  template(v-if="internal.length > 0", v-slot)
    .eg-image-input__content
      el-image.eg-image(
        ref="elImage",
        :preview-src-list="internalPreview",
        :src="internal[0].src",
        fit="cover",
        hide-on-click-modal
      )
        template(#placeholder)
          el-skeleton(animated)
            template(#template)
              el-skeleton-item.skel(variant="image")
      .flex-column-ca.hover-container(@click.stop)
        el-button.mb-2(
          :disabled="disableView",
          @click.stop="elImage.clickHandler()",
          icon="el-icon-view",
          type="success"
        ) {{ t('eg.image_input.view') }}
        el-button.mb-2(
          :disabled="disableEdit",
          @click.stop="multiple ? modifySome(0) : fileInput.nativeClick()",
          icon="el-icon-edit",
          type="primary"
        ) {{ t('crud.update') }}
        el-button(
          v-if="!noDelete",
          :disabled="disableDelete",
          @click.stop="multiple ? deleteSome(0) : mutateInternal([])",
          icon="el-icon-delete",
          type="danger"
        ) {{ t('crud.delete') }}
    .eg-image-input__multiple.text-center(
      ref="divMultiple",
      v-if="multiple && (firstPick || internal.length > 1)"
    )
      template(v-for="n in internal.length - 1", :key="n")
        .eg-section
          el-image(:src="internal[n].src")
          .hover-container
            el-button(
              @click="modifySome(n)",
              circle,
              icon="el-icon-edit",
              type="primary"
            )
            el-button(
              @click="deleteSome(n)",
              circle,
              icon="el-icon-delete",
              type="danger"
            )
      .eg-section(@click="insertSome(internal.length)")
        i.el-icon-circle-plus-outline
</template>

<script lang="ts">
import {
  PropType,
  Ref,
  defineComponent,
  inject,
  nextTick,
  ref,
  watch,
  watchEffect,
  onMounted,
  computed,
  provide,
} from "vue";

import { useI18n } from "../plugins/i18n";
import { get, isEqual, isNil, set } from "lodash";

import { IFileInput, INTERNAL_KEY, MUTATE_INTERNAL_KEY } from ".";
import { IFORM_KEY } from "..";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SingleModelValue = string | File | Record<string, any>;
type ModelValue = SingleModelValue | SingleModelValue[] | null;

type Internal =
  | {
      src: string;
      file: File;
      type: "file";
    }
  | {
      src: string;
      type: "string";
    }
  | {
      src: string;
      obj: Record<string, unknown>;
      type: "object";
    };

export default defineComponent({
  name: "EgImageInput",
  props: {
    modelValue: {
      type: [String, Object, Array] as PropType<ModelValue>,
      default: undefined,
    },
    objectSrcProp: { type: String, default: "image" },

    formProp: { type: String, default: "image" },
    disabled: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    float: { type: Boolean, default: false },

    noDelete: { type: Boolean, default: false },
    disableView: { type: Boolean, default: false },
    disableEdit: { type: Boolean, default: false },
    disableDelete: { type: Boolean, default: false },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit }) {
    const { t } = useI18n();

    const dragged = ref(false);

    const makeFile = (value: File): Internal => ({
      src: URL.createObjectURL(value),
      file: value,
      type: "file",
    });

    const makeString = (value: string): Internal => ({
      src: value,
      type: "string",
    });

    const makeObject = (value: Record<string, unknown>): Internal => {
      const source = get(value, props.objectSrcProp);
      if (isNil(source)) {
        throw new Error("Image can't be null or undefined");
      }
      return {
        src: typeof source === "string" ? source : URL.createObjectURL(source),
        obj: value,
        type: "object",
      };
    };

    function insertFiles(idx: number, files: File[]) {
      internal.value.splice(idx, 0, ...files.map((x) => makeFile(x)));

      //const valueSrc = files.map((x) => URL.createObjectURL(x));
      //internalSrc.value.splice(idx, 0, ...valueSrc);

      if (idx + 1 === internal.value.length) {
        nextTick(() => {
          divMultiple.value.scrollTo({
            left: divMultiple.value.scrollWidth,
          });
        });
      }
    }

    // SECTION Internal value.

    const internal = ref<Internal[]>([]);

    const mutateInternal = (value: File[], dragged = false) => {
      if (props.multiple) {
        if (deleteIndex >= 0) {
          internal.value.splice(deleteIndex, 1);
          deleteIndex = -1;
        } else if (insertIndex >= 0) {
          insertFiles(insertIndex, value);
          insertIndex = -1;
        } else if (modifyIndex.value >= 0 && value.length > 0) {
          const intValue = internal.value[modifyIndex.value];
          if (intValue.type === "file" || intValue.type === "string") {
            internal.value[modifyIndex.value] = makeFile(value[0]);
          } else if (intValue.type === "object") {
            set(intValue.obj, props.objectSrcProp, value[0]);
            internal.value[modifyIndex.value] = makeObject(intValue.obj);
          }

          modifyIndex.value = -1;
        } else if (!firstPick.value || internal.value.length === 0 || dragged) {
          insertFiles(internal.value.length, value);
        }
      } else if (value.length > 0) {
        internal.value = [makeFile(value[0])];
      } else {
        internal.value = [];
      }

      umvFlag = true;
      const modelValue = getModelValue();

      emit("update:modelValue", modelValue);
      emit("change", modelValue);

      if (!firstPick.value) {
        firstPick.value = true;
      }

      if (!isReset && form) {
        form.value.validateField(props.formProp);
      }

      fileInput.value.clearPicker();
      isReset = false;
    };

    // TODO: fix typings.
    provide(INTERNAL_KEY, internal as unknown);
    provide(MUTATE_INTERNAL_KEY, mutateInternal);

    watch(
      () => props.modelValue,
      (value) => {
        if (umvFlag) {
          umvFlag = false;
        } else if (internal.value !== value) {
          if (typeof value === "string" || value instanceof File) {
            handleValue(value, -1);
          } else if (Array.isArray(value)) {
            internal.value = value
              .filter((x) => !isNil(x))
              .map((x, idx) => handleValue(x, idx));

            if (!isEqual(internal.value, props.modelValue)) {
              umvFlag = true;
              emit("update:modelValue", internal.value);
              emit("change", internal.value);
            }
          } else {
            const modelValue = props.multiple ? [] : null;
            internal.value = [];

            umvFlag = true;
            emit("update:modelValue", modelValue);
            emit("change", modelValue);
          }
        }

        if (!isReset && form) {
          form.value.validateField(props.formProp);
        }

        isReset = false;
      }
    );

    // !SECTION

    const fileInput = ref() as Ref<IFileInput>;
    const divMultiple = ref() as Ref<HTMLDivElement>;
    const elImage = ref();

    let isReset = false;
    let umvFlag = false;

    const form = inject(IFORM_KEY, undefined);

    if (form) {
      watchEffect(() => {
        const _form = form?.value;
        if (_form) {
          const _resetFields = _form.resetFields;
          _form.resetFields = () => {
            isReset = true;
            _resetFields();
          };
        }
      });
    }

    function getModelValue(): ModelValue {
      if (props.multiple && Array.isArray(internal.value)) {
        return internal.value.map((x) =>
          x.type === "file" ? x.file : x.type === "object" ? x.obj : x.src
        );
      } else if (internal.value.length > 0) {
        const x = internal.value[0];
        return x.type === "file" ? x.file : x.type === "object" ? x.obj : x.src;
      }

      return null;
    }

    function handleValue(value: SingleModelValue, idx: number): Internal {
      const mappedValue =
        typeof value === "string"
          ? makeString(value)
          : value instanceof File
          ? makeFile(value)
          : makeObject(value);

      if (idx < 0) {
        internal.value = [mappedValue];
      } else if (internal.value.length > idx) {
        internal.value[idx] = mappedValue;
      } else {
        internal.value.push(mappedValue);
      }

      umvFlag = true;

      if (!firstPick.value) {
        firstPick.value = true;
      }

      return mappedValue;
    }

    const firstPick = ref(false);
    const internalPreview = computed(() => internal.value.map((x) => x.src));

    const multipleInput = ref<HTMLInputElement>() as Ref<HTMLInputElement>;

    let deleteIndex = -1;
    let insertIndex = -1;
    const modifyIndex = ref(-1);

    onMounted(() => {
      if (Array.isArray(props.modelValue)) {
        props.modelValue.forEach((item, idx) => handleValue(item, idx));
      } else if (!isNil(props.modelValue)) {
        handleValue(props.modelValue, 0);
      }
    });

    return {
      divMultiple,
      dragged,
      elImage,
      fileInput,
      firstPick,
      internal,
      internalPreview,
      modifyIndex,
      multipleInput,
      mutateInternal,
      t,

      deleteSome(idx: number) {
        deleteIndex = idx;
        mutateInternal([]);
      },
      insertSome(idx: number) {
        insertIndex = idx;
        nextTick(() => fileInput.value.nativeClick());
      },
      modifySome(idx: number) {
        modifyIndex.value = idx;
        nextTick(() => fileInput.value.nativeClick());
      },
    };
  },
});
</script>

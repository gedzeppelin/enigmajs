<template lang="pug">
el-button(
  v-if="renderButton(row, 'update')",
  @click="editAction(row)",
  size="small",
  type="primary"
) {{ t('crud.update') }}
el-popconfirm(
  v-if="renderButton(row, 'delete')",
  :title="t('crud.delete_warning')",
  @confirm="deleteAction(row)",
  cancel-button-type="primary",
  confirm-button-type="danger",
  hide-icon
)
  template(v-slot:reference)
    el-button(:loading="isDeleting", size="small", type="danger") {{ t('crud.delete') }}
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, ref, inject, PropType } from "vue";
import { get, isNil, pull } from "lodash";
import { useRoute, useRouter } from "vue-router";

import { useI18n } from "vue-i18n";

import { PAGINATOR_CTX_KEY } from "./paginator.vue";
import { useAxios } from "../plugins/axios";

export default defineComponent({
  name: "eg-column-actions--inner",
  props: {
    idProp: { type: String, required: true },
    row: { type: Object, required: true },
    // eslint-disable-next-line prettier/prettier
    noUpdate: [Boolean, Function] as PropType<((row: any) => boolean) | boolean>,
    // eslint-disable-next-line prettier/prettier
    noDelete: [Boolean, Function] as PropType<((row: any) => boolean) | boolean>,
  },
  emits: {
    "row-deleted": (row: any) => row,
  },
  setup(props, { emit }) {
    const axios = useAxios();
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();

    const ctx = inject(PAGINATOR_CTX_KEY);
    const isDeleting = ref(false);

    function editAction(row: unknown) {
      router.push(`${route.fullPath}/${get(row, props.idProp)}`);
    }

    function deleteAction(row: unknown) {
      if (isNil(ctx)) {
        throw new Error("(row-actions) paginator context was not injected");
      }

      const { source, deleteUrl } = ctx.props;

      isDeleting.value = true;
      axios.buildResponse({
        notify: "always",
        request: {
          method: "DELETE",
          url: `${deleteUrl ?? source}/${get(row, props.idProp)}/`,
        },

        ifOk: () => {
          if (ctx && ctx.totalItems && ctx.paginator) {
            const totalPages = Math.ceil(ctx.totalItems / ctx.params.page_size);
            if (ctx.params.page === totalPages) {
              pull(ctx.paginator.results, row);
              if (ctx.paginator.results.length === 0) {
                ctx.params.page--;
              }
            }
          } else {
            emit("row-deleted", row);
          }
        },
        finally: () => {
          isDeleting.value = false;
        },
      });
    }

    function renderButton(row: any, type: "update" | "delete") {
      const noProp = type === "update" ? props.noUpdate : props.noDelete;

      if (typeof noProp === "function") {
        return !noProp(row);
      }

      return noProp === undefined || !noProp;
    }

    return { router, t, editAction, deleteAction, isDeleting, renderButton };
  },
});
</script>

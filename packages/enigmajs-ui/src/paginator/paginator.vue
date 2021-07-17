<template lang="pug">
el-card(shadow="never")
  template(v-slot:header)
    el-row.eg-paginator__header(
      align="middle",
      justify="space-between",
      type="flex"
    )
      el-col.is-first(:md="8", :span="24")
        span {{ t(`nav.${String(route.name)}`) }}

      el-col.is-middle(:md="8", :span="24")
        el-input(
          v-model="search",
          :placeholder="t('app.search')",
          @clear="instantSearch",
          @input="debounceSearch",
          @keydown.enter="instantSearch",
          clearable,
          prefix-icon="el-icon-search"
        )

      el-col.is-last(:md="8", :span="24")
        slot(name="header-end-start")
        el-button(
          v-if="!loading",
          @click="promiseSection.refresh()",
          icon="el-icon-refresh-right",
          plain,
          type="primary"
        ) {{ t('cmn.refresh') }}
        el-button.button-new(
          v-if="!noCreate",
          @click="buttonCreate",
          icon="el-icon-plus",
          plain,
          type="success"
        ) {{ t('crud.create') }}
        slot(name="header-end-end")

    template(v-if="$slots['header-above']")
      .eg-paginator__header(
        align="middle",
        justify="space-between",
        type="flex"
      )
        slot(name="header-above")

  eg-promise-section(
    ref="promiseSection",
    v-bind="$attrs",
    :paginated="paginated",
    :query-params="qParams",
    :source="source",
    @loading="loading = true",
    @ok="onOk",
    @restore="qParams.page = 1",
    follow-locale
  )
    template(v-slot="{ ok }")
      el-row(justify="center", type="flex")
        el-col.mb-4(:span="12")
          el-pagination.text-center(
            v-if="ok",
            v-model:currentPage="qParams.page",
            v-model:page-size="qParams.page_size",
            :layout="paginated ? 'total, sizes, prev, pager, next, jumper' : 'total'",
            :page-sizes="pageSizes",
            :total="ok.count"
          )
        el-col(:span="24")
          el-empty(
            v-if="ok.isEmpty",
            :description="t('app.empty_data')",
            :image-size="200"
          )
          slot(v-else, :ok="ok")
            .eg-section.flex-ca.text-primary (eg-paginator) Ok!
</template>

<script lang="ts">
import {
  PropType,
  defineComponent,
  provide,
  reactive,
  ref,
  watch,
  InjectionKey,
} from "vue";
import { debounce } from "lodash";
import {
  IPaginator,
  Ok,
  Paginator,
  purgeObject,
  Response,
  Target,
} from "enigmajs-core";

import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import { INTERNAL_KEY, MUTATE_INTERNAL_KEY } from "../promise-section";

interface QueryParams {
  page: number;
  page_size: number;
  search: string;
}

interface PaginatorContext {
  params: QueryParams;
  totalItems?: number;
  paginator?: Paginator;
  props: {
    source: string;
    updateUrl?: string;
    deleteUrl?: string;
  };
}

type IContextKey = InjectionKey<PaginatorContext>;
export const PAGINATOR_CTX_KEY: IContextKey = Symbol("eg.paginator.context");

export default defineComponent({
  name: "eg-paginator",
  props: {
    modelValue: Object as PropType<Response<Paginator>>,

    source: { type: String, required: true },
    queryParams: Object as PropType<Target>,
    paginated: { type: Boolean, default: true },
    pageSizes: {
      type: Array as PropType<number[]>,
      default: () => [5, 10, 15, 20, 25, 50],
    },
    updateUrl: String,
    deleteUrl: String,

    followLocale: { type: Boolean, default: true },
    createPath: { type: String, default: "create" },
    noCreate: { type: Boolean, default: false },
    editPath: String,
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();

    // SECTION Internal value.

    const internal = ref(props.modelValue);

    const mutateInternal = (value: Response<IPaginator>) => {
      if (internal.value !== value) {
        internal.value = value;
        emit("update:modelValue", value);
        emit("change", value);
      }
    };

    watch(
      () => props.modelValue,
      (value) => {
        if (internal.value !== value) {
          internal.value = value;
          emit("change", value);
        }
      }
    );

    provide(INTERNAL_KEY, internal);
    provide(MUTATE_INTERNAL_KEY, mutateInternal);

    // !SECTION

    const promiseSection = ref();
    const loading = ref(false);
    const search = ref("");

    function mergeParams() {
      const purged = purgeObject(props.queryParams);
      if (purged) {
        Object.assign(qParams, purged);
      }
    }

    const qParams: QueryParams = reactive({
      page: 1,
      page_size: 10,
      search: "",
    });

    watch(
      () => props.queryParams,
      () => {
        mergeParams();
      },
      { deep: true }
    );
    mergeParams();

    const ctx: PaginatorContext = reactive({
      params: qParams,
      totalItems: undefined,
      paginator: undefined,
      props: props,
    });

    provide(PAGINATOR_CTX_KEY, ctx);

    function onOk(event: Ok<Paginator>) {
      loading.value = false;
      ctx.totalItems = event.payload.count;
      ctx.paginator = event.payload;
    }

    function buttonCreate() {
      if (props.createPath.startsWith("/")) {
        router.push(props.createPath);
      } else {
        router.push(
          route.path.endsWith("/")
            ? `${route.path}${props.createPath}`
            : `${route.path}/${props.createPath}`
        );
      }
    }

    const debounceSearch = debounce(() => {
      qParams.search = search.value;
    }, 700);

    const instantSearch = () => {
      debounceSearch.cancel();
      qParams.search = search.value;
    };

    return {
      buttonCreate,
      ctx,
      debounceSearch,
      instantSearch,
      loading,
      onOk,
      promiseSection,
      qParams,
      route,
      search,
      t,
    };
  },
});
</script>

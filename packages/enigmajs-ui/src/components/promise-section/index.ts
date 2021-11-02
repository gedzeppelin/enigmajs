import {
  PropType,
  defineComponent,
  h,
  inject,
  onMounted,
  ref,
  watch,
  InjectionKey,
  Ref,
  resolveComponent,
} from "vue";

import { useI18n } from "../../plugins/i18n";
import { ElButton, ElLink } from "element-plus";
import { Err, Response, Ok, purgeObject } from "enigmajs-core";
import { AxiosRequestConfig } from "axios";

import { useAxios } from "../../plugins/axios";

import { Target } from "../../types";

type IRefreshKey = InjectionKey<() => Promise<void>>;
export const REFRESH_KEY: IRefreshKey = Symbol("promise_section.refresh");

type _IKey = InjectionKey<Ref<Response | undefined>>;
export const INTERNAL_KEY: _IKey = Symbol("promise-section.internal");

type _MIKey = InjectionKey<(value: Response | undefined) => void>;
export const MUTATE_INTERNAL_KEY: _MIKey = Symbol("promise-section.mutation");

export const EgPromiseSection = defineComponent({
  name: "EgPromiseSection",
  props: {
    modelValue: {
      type: Object as PropType<Response | undefined>,
      default: undefined,
    },
    source: { type: String, required: true },

    autoFetch: { type: Boolean, default: true },
    requestOpts: {
      type: Object as PropType<AxiosRequestConfig>,
      default: undefined,
    },
    queryParams: { type: Object as PropType<Target>, default: undefined },
    paginated: { type: Boolean, default: true },

    mutation: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: Function as PropType<(el: any) => any>,
      default: undefined,
    },
    followLocale: { type: Boolean, default: false },

    loadingHeight: { type: [String, Number], default: 400 },
    showUrl: { type: Boolean, default: true },
  },
  emits: {
    "update:modelValue": (evt: Response | undefined) => evt,
    change: (evt: Response | undefined) => evt,
    loading: () => true,
    ok: (evt: Ok) => evt,
    err: (evt: Err) => evt,
    restore: (evt: Ok) => evt,
  },
  setup(props, { emit, expose, slots }) {
    const axios = useAxios();
    const { locale, t } = useI18n();

    // SECTION Internal value.

    const internal = inject(INTERNAL_KEY, ref(props.modelValue));

    const mutateInternal = inject(MUTATE_INTERNAL_KEY, (value) => {
      if (internal.value !== value) {
        internal.value = value;
        emit("update:modelValue", value);
        emit("change", value);
      }
    });

    watch(
      () => props.modelValue,
      (value) => {
        if (internal.value !== value) {
          internal.value = value;
          emit("change", value);
        }
      }
    );

    // !SECTION

    const lastOk = ref<Ok>();

    watch(() => props.source, refresh);
    watch(() => props.requestOpts, refresh, { deep: true });
    watch(() => props.queryParams, refresh, { deep: true });

    watch(locale, () => {
      if (props.followLocale) {
        refresh();
      }
    });

    if (props.autoFetch) {
      onMounted(refresh);
    }

    /**
     *
     */
    async function refresh() {
      mutateInternal(undefined);
      emit("loading");

      const request: AxiosRequestConfig = {
        method: "GET",
        url: props.source,
      };

      if (props.requestOpts) {
        Object.assign(request, props.requestOpts);
      }

      if (props.queryParams) {
        const purgedParams = purgeObject(props.queryParams);

        if (purgedParams) {
          request.params = request.params
            ? Object.assign(request.params, purgedParams)
            : purgedParams;
        }
      }

      const response = await axios.buildResponse({
        request: request,
        paginated: props.paginated,
        ifOk: (ok) => {
          if (props.mutation) {
            ok.payload = props.mutation(ok.payload);
          }

          lastOk.value = ok;
          emit("ok", ok);
        },
      });

      mutateInternal(response);
    }

    expose({ refresh });

    // ANCHOR Render function

    function makeErrButtons() {
      const retryButton = h(
        ElButton,
        { onClick: refresh },
        {
          default: () => t("err.retry"),
        }
      );

      const _lastOk = lastOk.value;
      return _lastOk
        ? h("div", [
            h(
              ElButton,
              {
                onClick: () => {
                  internal.value = _lastOk;
                  emit("restore", _lastOk);
                },
              },
              {
                default: () => t("eg.promise_section.last_ok"),
              }
            ),
            retryButton,
          ])
        : retryButton;
    }

    return () =>
      internal.value !== undefined
        ? internal.value.map({
            ifOk: ({ payload }) =>
              slots.default !== undefined
                ? slots.default({ ok: payload })
                : h(
                    "div",
                    { class: ["eg-section", "flex-ca", "text-primary"] },
                    "(eg-promise-section) Ok!"
                  ),

            ifErr: (err) =>
              h("div", { class: ["eg-promise-section", "is-error"] }, [
                h("div", { class: ["is-error__status"] }, err.status ?? "420"),
                h(
                  "div",
                  { class: ["is-error__text"] },
                  props.showUrl && err.requestURL
                    ? [
                        t("err.request_with_url"),
                        h("br"),
                        h(
                          ElLink,
                          {
                            class: ["is-error__request"],
                            href: err.requestURL,
                            target: "_blank",
                            type: "danger",
                          },
                          {
                            default: () => err.requestURL,
                          }
                        ),
                      ]
                    : t("err.request_no_url")
                ),
                makeErrButtons(),
              ]),
          })
        : h(resolveComponent("eg-loader"), {
            height: props.loadingHeight,
            class: ["eg-promise-section", "is-loading"],
          });
  },
});

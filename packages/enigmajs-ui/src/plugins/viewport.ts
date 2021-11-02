import { debounce, isNil } from "lodash";
import {
  InjectionKey,
  readonly,
  Plugin,
  ref,
  computed,
  ComputedRef,
  Ref,
  inject,
} from "vue";

interface Viewport {
  width: Readonly<Ref<number>>;
  height: Readonly<Ref<number>>;
  xs: ComputedRef<boolean>;
  sm: ComputedRef<boolean>;
  md: ComputedRef<boolean>;
  lg: ComputedRef<boolean>;
  xl: ComputedRef<boolean>;
  name: ComputedRef<Breakpoint>;
}

export const VIEWPORT_KEY: InjectionKey<Viewport> = Symbol("eg.viewport");

const XS_THRESHOLD = 768;
const SM_THRESHOLD = 992;
const MD_THRESHOLD = 1200;
const LG_THRESHOLD = 1920;

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";

function getClientHeight(): number {
  if (isNil(document)) return 0;
  return Math.max(document.documentElement.clientHeight, window.innerHeight);
}

function getClientWidth(): number {
  if (isNil(document)) return 0;
  return Math.max(document.documentElement.clientWidth, window.innerWidth);
}

const _w = ref(getClientWidth());
const _h = ref(getClientHeight());

const xs = computed(() => _w.value < XS_THRESHOLD);
const sm = computed(() => _w.value >= XS_THRESHOLD && _w.value < SM_THRESHOLD);
const md = computed(() => _w.value >= SM_THRESHOLD && _w.value < MD_THRESHOLD);
const lg = computed(() => _w.value >= MD_THRESHOLD && _w.value < LG_THRESHOLD);
const xl = computed(() => _w.value >= LG_THRESHOLD);

const name = computed<Breakpoint>(() => {
  if (xs.value) return "xs";
  if (sm.value) return "sm";
  if (md.value) return "md";
  if (lg.value) return "lg";
  return "xl";
});

const viewport: Viewport = {
  width: readonly(_w),
  height: readonly(_h),
  xs,
  sm,
  md,
  lg,
  xl,
  name,
};

export function useViewport(): Viewport {
  const injected = inject(VIEWPORT_KEY);
  if (!injected) {
    throw new Error("viewport plugin was not used in main file");
  }
  return injected;
}

const plugin: Plugin = (app) => {
  const debounced = debounce(() => {
    _w.value = getClientWidth();
    _h.value = getClientHeight();
  }, 200);

  window.addEventListener("resize", debounced);

  app.provide(VIEWPORT_KEY, viewport);
};

export default plugin;

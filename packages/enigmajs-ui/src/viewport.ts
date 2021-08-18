import { debounce, isNil } from "lodash";
import { reactive, readonly, ToRefs, toRefs } from "vue";

const XS_THRESHOLD = 768;
const SM_THRESHOLD = 992;
const MD_THRESHOLD = 1200;
const LG_THRESHOLD = 1920;

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";

class Viewport {
  public height: number = this.getClientHeight();
  public width: number = this.getClientWidth();

  private debounced = debounce(this.upload, 200);

  get name(): Breakpoint {
    if (this.xs) return "xs";
    if (this.sm) return "sm";
    if (this.md) return "md";
    if (this.lg) return "lg";
    return "xl";
  }

  get xs(): boolean {
    return this.width < XS_THRESHOLD;
  }
  get sm(): boolean {
    return this.width >= XS_THRESHOLD && this.width < SM_THRESHOLD;
  }
  get md(): boolean {
    return this.width >= SM_THRESHOLD && this.width < MD_THRESHOLD;
  }
  get lg(): boolean {
    return this.width >= MD_THRESHOLD && this.width < LG_THRESHOLD;
  }
  get xl(): boolean {
    return this.width >= LG_THRESHOLD;
  }

  /* _viewport.xsOnly = xs;
  _viewport.smOnly = sm;
  _viewport.smAndDown = (xs || sm) && !(md || lg || xl);
  _viewport.smAndUp = !xs && (sm || md || lg || xl);
  _viewport.mdOnly = md;
  _viewport.mdAndDown = (xs || sm || md) && !(lg || xl);
  _viewport.mdAndUp = !(xs || sm) && (md || lg || xl);
  _viewport.lgOnly = lg;
  _viewport.lgAndDown = (xs || sm || md || lg) && !xl;
  _viewport.lgAndUp = !(xs || sm || md) && (lg || xl);
  _viewport.xlOnly = xl; */

  public constructor() {
    window.addEventListener("resize", this.debounced);
  }

  public destroy(): void {
    window.removeEventListener("resize", this.debounced);
  }

  private upload() {
    this.height = this.getClientHeight();
    this.width = this.getClientWidth();
  }

  private getClientWidth(): number {
    if (isNil(document)) return 0;
    return Math.max(document.documentElement.clientWidth, window.innerWidth);
  }

  private getClientHeight(): number {
    if (isNil(document)) return 0;
    return Math.max(document.documentElement.clientHeight, window.innerHeight);
  }
}

const _viewport = reactive<Viewport>(new Viewport());
export const viewport = readonly(_viewport);

export const useViewport: () => ToRefs<Viewport> = () => toRefs(viewport);

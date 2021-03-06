import EgNavMenu from "./nav-menu.vue";
export default EgNavMenu;

export { default as EgNavItem } from "./nav-item.vue";

export type DrawerData = (DrawerGroup | DrawerItem)[];

export interface DrawerGroup {
  icon?: string;
  title: (() => string) | string;
  children: DrawerData;
}

export interface DrawerItem {
  icon?: string;
  title: (() => string) | string;
  path: string;
}

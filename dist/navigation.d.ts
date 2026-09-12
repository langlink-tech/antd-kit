import { type MenuProps } from "antd";
import type { AriaAttributes } from "react";
export interface NavigationMenuProps extends MenuProps {
    /** Name the navigation landmark, especially when a page has several menus. */
    label: string;
    describedBy?: AriaAttributes["aria-describedby"];
}
/** Official controlled Menu API; the host retains routing, permissions and open keys. */
export declare function NavigationMenu({ label, describedBy, ...props }: NavigationMenuProps): import("react").JSX.Element;

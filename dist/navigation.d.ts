import { type MenuProps } from "antd";
import type { AriaAttributes, HTMLAttributes } from "react";
export interface NavigationMenuProps extends MenuProps {
    /** Name the navigation landmark, especially when a page has several menus. */
    label: string;
    landmarkProps?: Omit<HTMLAttributes<HTMLElement>, "children" | "aria-label" | "aria-describedby">;
    describedBy?: AriaAttributes["aria-describedby"];
}
/** Official controlled Menu API; the host retains routing, permissions and open keys. */
export declare function NavigationMenu({ label, describedBy, landmarkProps, ...props }: NavigationMenuProps): import("react").JSX.Element;

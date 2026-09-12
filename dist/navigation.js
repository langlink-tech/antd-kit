import { jsx as _jsx } from "react/jsx-runtime";
import { Menu } from "antd";
/** Official controlled Menu API; the host retains routing, permissions and open keys. */
export function NavigationMenu({ label, describedBy, ...props }) {
    return _jsx("nav", { "aria-label": label, "aria-describedby": describedBy, children: _jsx(Menu, { ...props }) });
}

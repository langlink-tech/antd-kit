"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { App, Button, Drawer, Modal, Popconfirm, Space } from "antd";
import { useState } from "react";
/** Official Form-in-Drawer. Validation never closes the drawer. Navigation drawers stay native. */
export function FormDrawer({ form, onOk, onClose, okText = "OK", cancelText = "Cancel", confirmLoading, destroyOnHidden = true, footer, children, ...props }) {
    async function submit() {
        if (form) {
            try {
                await form.validateFields();
            }
            catch {
                return;
            }
        }
        await onOk?.();
    }
    const actions = footer !== undefined ? footer : (_jsxs(Space, { children: [_jsx(Button, { onClick: (event) => onClose?.(event), children: cancelText }), _jsx(Button, { type: "primary", loading: confirmLoading, onClick: () => { void submit(); }, children: okText })] }));
    return _jsx(Drawer, { keyboard: true, destroyOnHidden: destroyOnHidden, onClose: onClose, footer: actions, ...props, children: children });
}
/** Preview/result viewer: no input, no default footer. Confirm and form dialogs use other entries. */
export function PreviewDialog({ destroyOnHidden = true, ...props }) {
    return _jsx(Modal, { footer: null, keyboard: true, destroyOnHidden: destroyOnHidden, ...props });
}
/** Light, recoverable in-place confirm. High-risk or irreversible decisions use useAppConfirm(). */
export function ConfirmAction({ title, onConfirm, okButtonProps, ...props }) {
    const [pending, setPending] = useState(false);
    async function confirm(...args) {
        if (pending)
            return;
        setPending(true);
        try {
            await onConfirm?.(...args);
        }
        catch {
            return;
        }
        finally {
            setPending(false);
        }
    }
    return (_jsx(Popconfirm, { title: title, ...props, onConfirm: confirm, okButtonProps: { ...okButtonProps, loading: pending || okButtonProps?.loading } }));
}
/** Context-aware Modal.confirm. Callers must render under App. */
export function useAppConfirm() {
    const { modal } = App.useApp();
    return modal.confirm;
}

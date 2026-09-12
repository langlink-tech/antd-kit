import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Modal, Space } from "antd";
/** Official Form-in-Modal composition. Validation never closes the dialog. */
export function FormDialog({ form, onOk, destroyOnHidden = true, ...props }) {
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
    return _jsx(Modal, { keyboard: true, destroyOnHidden: destroyOnHidden, onOk: submit, ...props });
}
/** Give long forms one keyboard-accessible route to each invalid field. */
export function FormErrorSummary({ form, title, errors }) {
    if (!errors.length)
        return null;
    return _jsxs("section", { role: "alert", "aria-label": title, children: [_jsx("strong", { children: title }), _jsx("ul", { children: errors.map(({ name, errors: messages }) => _jsx("li", { children: _jsx(Button, { type: "link", onClick: () => form.scrollToField(name, { focus: true }), children: messages.join("; ") }) }, JSON.stringify(name))) })] });
}
/** Secondary action precedes the primary submit; submit is disabled while pending. */
export function FormActions({ submitLabel, submitting, secondary, submitProps }) {
    return _jsxs(Space, { children: [secondary, _jsx(Button, { ...submitProps, type: "primary", htmlType: "submit", loading: submitting, disabled: submitting || submitProps?.disabled, children: submitLabel })] });
}

import { type DrawerProps, type FormInstance, type ModalProps, type PopconfirmProps } from "antd";
import { type ReactNode } from "react";
export interface FormDrawerProps extends Omit<DrawerProps, "onClose"> {
    form?: FormInstance;
    onOk?: () => void | Promise<void>;
    onClose?: DrawerProps["onClose"];
    okText?: ReactNode;
    cancelText?: ReactNode;
    confirmLoading?: boolean;
}
/** Official Form-in-Drawer. Validation never closes the drawer. Navigation drawers stay native. */
export declare function FormDrawer({ form, onOk, onClose, okText, cancelText, confirmLoading, destroyOnHidden, footer, children, ...props }: FormDrawerProps): import("react").JSX.Element;
export type PreviewDialogProps = Omit<ModalProps, "footer">;
/** Preview/result viewer: no input, no default footer. Confirm and form dialogs use other entries. */
export declare function PreviewDialog({ destroyOnHidden, ...props }: PreviewDialogProps): import("react").JSX.Element;
export type ConfirmActionProps = PopconfirmProps;
/** Light, recoverable in-place confirm. High-risk or irreversible decisions use useAppConfirm(). */
export declare function ConfirmAction({ title, onConfirm, okButtonProps, ...props }: ConfirmActionProps): import("react").JSX.Element;
/** Context-aware Modal.confirm. Callers must render under App. */
export declare function useAppConfirm(): import("antd/es/modal/useModal/index.js").ModalFuncWithPromise;

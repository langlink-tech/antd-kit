import { type ButtonProps, type FormInstance, type ModalProps } from "antd";
import type { ReactNode } from "react";
export interface FormDialogProps extends Omit<ModalProps, "onOk" | "footer"> {
    form?: FormInstance;
    onOk?: () => void | Promise<void>;
}
/** Official Form-in-Modal composition. Validation never closes the dialog. */
export declare function FormDialog({ form, onOk, destroyOnHidden, ...props }: FormDialogProps): import("react").JSX.Element;
export interface FormErrorSummaryProps {
    form: FormInstance;
    title: string;
    errors: {
        name: (string | number)[];
        errors: string[];
    }[];
}
/** Give long forms one keyboard-accessible route to each invalid field. */
export declare function FormErrorSummary({ form, title, errors }: FormErrorSummaryProps): import("react").JSX.Element | null;
export interface FormActionsProps {
    submitLabel: ReactNode;
    submitting?: boolean;
    secondary?: ReactNode;
    submitProps?: Omit<ButtonProps, "type" | "htmlType" | "loading" | "children">;
}
/** Secondary action precedes the primary submit; submit is disabled while pending. */
export declare function FormActions({ submitLabel, submitting, secondary, submitProps }: FormActionsProps): import("react").JSX.Element;

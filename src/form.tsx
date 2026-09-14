"use client";

import { Button, Flex, Modal, Space, type ButtonProps, type FormInstance, type ModalProps } from "antd";
import type { ReactNode } from "react";

export interface FormDialogProps extends Omit<ModalProps, "onOk" | "footer"> {
  form?: FormInstance;
  onOk?: () => void | Promise<void>;
}

/** Official Form-in-Modal composition. Validation never closes the dialog. */
export function FormDialog({ form, onOk, destroyOnHidden = true, ...props }: FormDialogProps) {
  async function submit() {
    if (form) {
      try { await form.validateFields(); } catch { return; }
    }
    await onOk?.();
  }
  return <Modal keyboard destroyOnHidden={destroyOnHidden} onOk={submit} {...props} />;
}

export interface FormErrorSummaryProps {
  form: FormInstance;
  title: string;
  errors: { name: (string | number)[]; errors: string[] }[];
}

/** Give long forms one keyboard-accessible route to each invalid field. */
export function FormErrorSummary({ form, title, errors }: FormErrorSummaryProps) {
  if (!errors.length) return null;
  return <section role="alert" aria-label={title}><strong>{title}</strong><ul>
    {errors.map(({ name, errors: messages }) => <li key={JSON.stringify(name)}>
      <Button type="link" onClick={() => form.scrollToField(name, { focus: true })}>
        {messages.join("; ")}
      </Button>
    </li>)}
  </ul></section>;
}

export interface FormActionsProps {
  block?: boolean;
  submitLabel: ReactNode;
  submitting?: boolean;
  secondary?: ReactNode;
  submitProps?: Omit<ButtonProps, "type" | "htmlType" | "loading" | "children">;
}

/** Secondary action precedes the primary submit; submit is disabled while pending. */
export function FormActions({ block, submitLabel, submitting, secondary, submitProps }: FormActionsProps) {
  const submit = <Button {...submitProps} block={block || submitProps?.block} type="primary" htmlType="submit"
    loading={submitting} disabled={submitting || submitProps?.disabled}>{submitLabel}</Button>;
  return block ? <Flex vertical gap="small" style={{width:"100%"}}>{secondary}{submit}</Flex> : <Space>{secondary}{submit}</Space>;
}

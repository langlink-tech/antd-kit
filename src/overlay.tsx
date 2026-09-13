"use client";

import { App, Button, Drawer, Modal, Popconfirm, Space, type DrawerProps, type FormInstance, type ModalProps, type PopconfirmProps } from "antd";
import { useState, type ReactNode } from "react";

export interface FormDrawerProps extends Omit<DrawerProps, "onClose"> {
  form?: FormInstance;
  onOk?: () => void | Promise<void>;
  onClose?: DrawerProps["onClose"];
  okText?: ReactNode;
  cancelText?: ReactNode;
  confirmLoading?: boolean;
}

/** Official Form-in-Drawer. Validation never closes the drawer. Navigation drawers stay native. */
export function FormDrawer({
  form,
  onOk,
  onClose,
  okText = "OK",
  cancelText = "Cancel",
  confirmLoading,
  destroyOnHidden = true,
  footer,
  children,
  ...props
}: FormDrawerProps) {
  async function submit() {
    if (form) {
      try { await form.validateFields(); } catch { return; }
    }
    await onOk?.();
  }
  const actions = footer !== undefined ? footer : (
    <Space>
      <Button onClick={(event) => onClose?.(event)}>{cancelText}</Button>
      <Button type="primary" loading={confirmLoading} onClick={() => { void submit(); }}>{okText}</Button>
    </Space>
  );
  return <Drawer keyboard destroyOnHidden={destroyOnHidden} onClose={onClose} footer={actions} {...props}>{children}</Drawer>;
}

export type PreviewDialogProps = Omit<ModalProps, "footer">;

/** Preview/result viewer: no input, no default footer. Confirm and form dialogs use other entries. */
export function PreviewDialog({ destroyOnHidden = true, ...props }: PreviewDialogProps) {
  return <Modal footer={null} keyboard destroyOnHidden={destroyOnHidden} {...props} />;
}

export type ConfirmActionProps = PopconfirmProps;

/** Light, recoverable in-place confirm. High-risk or irreversible decisions use useAppConfirm(). */
export function ConfirmAction({ title, onConfirm, okButtonProps, ...props }: ConfirmActionProps) {
  const [pending, setPending] = useState(false);
  async function confirm(...args: Parameters<NonNullable<PopconfirmProps["onConfirm"]>>) {
    if (pending) return;
    setPending(true);
    try {
      await onConfirm?.(...args);
    } catch {
      return;
    } finally {
      setPending(false);
    }
  }
  return (
    <Popconfirm
      title={title}
      {...props}
      onConfirm={confirm}
      okButtonProps={{ ...okButtonProps, loading: pending || okButtonProps?.loading }}
    />
  );
}

/** Context-aware Modal.confirm. Callers must render under App. */
export function useAppConfirm() {
  const { modal } = App.useApp();
  return modal.confirm;
}

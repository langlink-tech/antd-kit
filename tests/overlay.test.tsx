import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { App, Form, Input } from "antd";
import { ConfirmAction, FormDrawer, PreviewDialog, useAppConfirm } from "../src/overlay.js";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", { writable: true, value: vi.fn(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});
afterEach(cleanup);

describe("overlay shells", () => {
  it("keeps invalid drawer forms open and only submits after validation", async () => {
    const submit = vi.fn();
    function Example() {
      const [form] = Form.useForm();
      return <FormDrawer open title="Edit" form={form} onOk={submit} okText="Save"><Form form={form}><Form.Item name="name" label="Name" rules={[{ required: true, message: "Required" }]}><Input /></Form.Item></Form></FormDrawer>;
    }
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText("Required");
    expect(submit).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Alpha" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(submit).toHaveBeenCalledOnce());
  });

  it("renders a preview without a default footer action", () => {
    render(<PreviewDialog open title="HTML"><iframe title="Preview" /></PreviewDialog>);
    expect(screen.getByTitle("Preview")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "OK" })).toBeNull();
  });

  it("keeps light confirms in place", async () => {
    const confirm = vi.fn();
    render(<ConfirmAction title="Delete row?" onConfirm={confirm}><button>Delete</button></ConfirmAction>);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(await screen.findByRole("button", { name: "OK" }));
    await waitFor(() => expect(confirm).toHaveBeenCalledOnce());
  });
});

it("reads Modal.confirm from App instead of the static API", async () => {
  function Probe() {
    const confirm = useAppConfirm();
    return <button onClick={() => confirm({ title: "Remove access?", onOk: () => undefined })}>Ask</button>;
  }
  render(<App><Probe /></App>);
  fireEvent.click(screen.getByRole("button", { name: "Ask" }));
  expect(await screen.findByRole("dialog")).toBeTruthy();
  expect(screen.getAllByText("Remove access?").length).toBeGreaterThan(0);
});

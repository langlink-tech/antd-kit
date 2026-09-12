import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Form, Input, type FormInstance } from "antd";
import { DataTable } from "../src/table.js";
import { FormActions, FormDialog, FormErrorSummary } from "../src/form.js";
import { DashboardPanel, MetricCard } from "../src/dashboard.js";
import { NavigationMenu } from "../src/navigation.js";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", { writable: true, value: vi.fn(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});
afterEach(cleanup);

describe("data table state and host contracts", () => {
  it("keeps row identity and selection controlled by the host", async () => {
    const change = vi.fn();
    render(<DataTable rowKey="id" columns={[{title:"Name",dataIndex:"name"}]} dataSource={[{id:"a",name:"Alpha"}]} rowSelection={{selectedRowKeys:[],onChange:change}} pagination={false} />);
    expect(screen.getByText("Alpha")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("checkbox")[1]!);
    expect(change.mock.calls[0]?.[0]).toEqual(["a"]);
  });
  it("preserves host loading placeholders when no shared empty state is requested", () => {
    render(<DataTable rowKey="id" dataSource={[]} loading locale={{emptyText:"Host loading placeholder"}} />);
    expect(screen.getByText("Host loading placeholder")).toBeTruthy();
  });
  it("does not show an empty-state recovery while initially loading", () => {
    render(<DataTable rowKey="id" dataSource={[]} loading={{spinning:true}} emptyState={{description:"No rows",action:<button>Retry</button>}} />);
    expect(screen.queryByText("No rows")).toBeNull();
    expect(screen.queryByRole("button",{name:"Retry"})).toBeNull();
  });
  it("shows an explicit failure action", () => {
    const retry=vi.fn();
    render(<DataTable rowKey="id" dataSource={[]} emptyState={{error:true,description:"Failed",action:<button onClick={retry}>Retry</button>}} />);
    fireEvent.click(screen.getByRole("button",{name:"Retry"}));
    expect(retry).toHaveBeenCalledOnce();
  });
});

describe("form recovery", () => {
  it("keeps invalid modal forms open and only calls submit after validation", async () => {
    const submit=vi.fn();
    function Example() { const [form]=Form.useForm(); return <FormDialog open title="Edit" form={form} onOk={submit} okText="Save"><Form form={form}><Form.Item name="name" label="Name" rules={[{required:true,message:"Required"}]}><Input /></Form.Item></Form></FormDialog>; }
    render(<Example />);
    fireEvent.click(screen.getByRole("button",{name:"Save"}));
    await screen.findByText("Required");
    expect(submit).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox"),{target:{value:"Alpha"}});
    fireEvent.click(screen.getByRole("button",{name:"Save"}));
    await waitFor(()=>expect(submit).toHaveBeenCalledOnce());
  });
  it("focuses the exact nested error path", () => {
    const scrollToField=vi.fn();
    render(<FormErrorSummary title="Fix errors" form={{scrollToField} as unknown as FormInstance} errors={[{name:["people",0,"email"],errors:["Email required"]}]} />);
    fireEvent.click(screen.getByRole("button",{name:"Email required"}));
    expect(scrollToField).toHaveBeenCalledWith(["people",0,"email"],{focus:true});
  });
  it("disables repeat submission while pending", () => {
    const click=vi.fn();
    render(<FormActions submitLabel="Save" submitting submitProps={{onClick:click}} secondary={<button>Cancel</button>} />);
    fireEvent.click(screen.getByRole("button",{name:/Save/}));
    expect(click).not.toHaveBeenCalled();
    expect(screen.getAllByRole("button")[0]?.textContent).toBe("Cancel");
  });
});

it("keeps dashboard error recovery separate from its data", () => {
 const view=render(<DashboardPanel error="Unavailable" recovery={<button>Reload</button>}>Stale data</DashboardPanel>);
 expect(screen.getByRole("button",{name:"Reload"})).toBeTruthy();
 expect(screen.queryByText("Stale data")).toBeNull();
 view.rerender(<MetricCard statistic={{title:"Completed",value:12}} trend={<span>Up this month</span>} />);
 expect(screen.getByText("12")).toBeTruthy();
});

it("exposes a named navigation landmark and preserves controlled selection", () => {
 const click=vi.fn();
 render(<NavigationMenu label="Primary" selectedKeys={["home"]} onClick={click} items={[{key:"home",label:"Home"},{key:"work",label:"Work"}]} />);
 expect(screen.getByRole("navigation",{name:"Primary"})).toBeTruthy();
 fireEvent.click(screen.getByText("Work"));
 expect(click.mock.calls[0]?.[0].key).toBe("work");
});

it("keeps full-width submit controls inside a full-width action group", () => {
  render(<FormActions block submitLabel="Save all" submitting />);
  const submit=screen.getByRole("button",{name:/Save all/});
  expect(submit.hasAttribute("disabled")).toBe(true);
  expect(submit.parentElement?.style.width).toBe("100%");
});

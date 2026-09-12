import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { AnalysisSheet } from "../src/s2.js";

const state=vi.hoisted(()=>({instances:[] as Array<{destroy:ReturnType<typeof vi.fn>;render:ReturnType<typeof vi.fn>;changeSheetSize:ReturnType<typeof vi.fn>;destroyed:boolean}>,fail:false}));
vi.mock("@antv/s2",()=>({PivotSheet:class {
 destroyed=false;
 destroy=vi.fn(()=>{this.destroyed=true;});
 render=vi.fn(async()=>{if(state.fail)throw new Error("Render failed");});
 changeSheetSize=vi.fn();
 setThemeCfg=vi.fn();
 constructor(){state.instances.push(this);}
}}));
let disconnect=vi.fn();
let resizeCallback: ResizeObserverCallback;
vi.stubGlobal("ResizeObserver",class { constructor(callback:ResizeObserverCallback){resizeCallback=callback;} observe=vi.fn();disconnect=disconnect;});
afterEach(()=>{cleanup();state.instances.length=0;state.fail=false;vi.clearAllMocks();});
const dataCfg={fields:{rows:["name"],values:["value"]},data:[{name:"Alpha",value:1}]};
const options={width:600,height:480};

describe("S2 lifecycle",()=>{
 it("renders an accessible alternative and destroys the mounted sheet",async()=>{
  const view=render(<AnalysisSheet dataCfg={dataCfg} options={options} label="Analysis" accessibleFallback={<table><tbody><tr><td>Alpha: 1</td></tr></tbody></table>} />);
  await waitFor(()=>expect(state.instances[0]?.render).toHaveBeenCalledOnce());
  expect(screen.getByRole("table")).toBeTruthy();
  await waitFor(()=>expect(screen.getByRole("img",{name:"Analysis"})).toBeTruthy());
  view.unmount();
  expect(state.instances[0]?.destroy).toHaveBeenCalledOnce();
  expect(disconnect).toHaveBeenCalledOnce();
 });
 it("reports render errors without removing the accessible view",async()=>{
  state.fail=true;
  const onError=vi.fn();
  render(<AnalysisSheet dataCfg={dataCfg} options={options} label="Analysis" onError={onError} accessibleFallback={<p>Alpha: 1</p>} />);
  await screen.findByText("Render failed");
  expect(onError).toHaveBeenCalledOnce();
  expect(screen.getByText("Alpha: 1")).toBeTruthy();
 });
 it("does not create a sheet after unmount before lazy loading finishes",async()=>{
  const view=render(<AnalysisSheet dataCfg={dataCfg} options={options} label="Analysis" accessibleFallback={<p>Data</p>} />);
  view.unmount();
  await Promise.resolve();
  expect(state.instances).toHaveLength(0);
 });
 it("coalesces resize work while a render is pending",async()=>{
  const view=render(<AnalysisSheet dataCfg={dataCfg} options={options} label="Analysis" accessibleFallback={<p>Data</p>} />);
  await waitFor(()=>expect(state.instances[0]?.render).toHaveBeenCalledOnce());
  const sheet=state.instances[0]!;
  let release!:()=>void;
  sheet.render.mockImplementationOnce(()=>new Promise<void>(resolve=>{release=resolve;}));
  const resize=(width:number)=>resizeCallback([{contentRect:{width}}] as ResizeObserverEntry[],{} as ResizeObserver);
  resize(700);resize(800);resize(900);
  expect(sheet.changeSheetSize).toHaveBeenCalledTimes(1);
  release();
  await waitFor(()=>expect(sheet.changeSheetSize).toHaveBeenCalledTimes(2));
  expect(sheet.changeSheetSize).toHaveBeenLastCalledWith(900,480);
  view.unmount();
 });
 it("destroys the prior instance before adopting new configuration",async()=>{
  const view=render(<AnalysisSheet dataCfg={dataCfg} options={options} label="Analysis" accessibleFallback={<p>Data</p>} />);
  await waitFor(()=>expect(state.instances).toHaveLength(1));
  view.rerender(<AnalysisSheet dataCfg={{...dataCfg,data:[]}} options={options} label="Analysis" accessibleFallback={<p>No data</p>} />);
  await waitFor(()=>expect(state.instances).toHaveLength(2));
  expect(state.instances[0]?.destroy).toHaveBeenCalledOnce();
 });

});

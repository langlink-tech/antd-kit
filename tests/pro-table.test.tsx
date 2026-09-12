import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { QueryTable } from "../src/pro-table.js";
const probe=vi.hoisted(()=>({props:{} as Record<string,unknown>}));
vi.mock("@ant-design/pro-components",()=>({ProTable:(props:Record<string,unknown>)=>{probe.props=props;return null;}}));
afterEach(cleanup);
it("preserves request, selection callbacks and explicit pagination",()=>{
 const request=vi.fn(),onChange=vi.fn();
 render(<QueryTable rowKey="id" request={request} pagination={{pageSize:10}} rowSelection={{onChange}} />);
 expect(probe.props.request).toBe(request);
 expect(probe.props.pagination).toEqual({defaultPageSize:25,pageSize:10});
 expect(probe.props.rowSelection).toEqual({preserveSelectedRowKeys:true,onChange});
});
it("keeps explicitly disabled paging and selection disabled",()=>{
 render(<QueryTable rowKey="id" pagination={false} rowSelection={false} />);
 expect(probe.props.pagination).toBe(false);
 expect(probe.props.rowSelection).toBe(false);
});

interface UserRow { id: string; name: string; }
interface UserSearch { name?: string; }
it("accepts interface rows, default search parameters and the official third generic",()=>{
 const row:UserRow={id:"a",name:"Alpha"};
 const view=render(<QueryTable<UserRow> rowKey="id" dataSource={[row]} />);
 expect(probe.props.dataSource).toEqual([row]);
 view.rerender(<QueryTable<UserRow,UserSearch,"text"> rowKey="id" params={{name:"Alpha"}} />);
 expect(probe.props.params).toEqual({name:"Alpha"});
});

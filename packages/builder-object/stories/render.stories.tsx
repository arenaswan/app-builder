import { ObjectTable, render } from "@steedos/builder-object";
import { PublicPage } from "@steedos/builder-page";
import * as React from "react"
import { Button, Tabs } from "antd"
const { TabPane } = Tabs;
const getSchemaTalbeProps = () => {
    const rows = [{
        _id: "1",
        name: "A",
        tags: ["1"],
        contract: "C25heacKZD9uy2EAj"
    }, {
        _id: "2",
        name: "B",
        tags: ["2"],
        contract: "C25heacKZD9uy2EAj"
    }, {
        _id: "3",
        name: "C",
        tags: ["1", "2"],
    }];
    const objectSchema = {
        fields: {
            name: {
                type: 'text',
                label: '名称',
            },
            tags: {
                type: 'select',
                label: '标签',
                options: [
                    { label: '老人', value: '1' },
                    { label: '中年人', value: '2' },
                    { label: '年轻人', value: '3' },
                    { label: '孩童', value: '4' }
                ],
                multiple: true
            },
            contract: {
                reference_to: 'contracts',
                type: 'lookup',
                label: '合同'
            },
        }
    };
    const listSchema = {
        columns: [
            {
                field: 'name',
                width: '300'
            },
            {
                field: 'tags'
            },
            {
                field: 'contract'
            }
        ]
    };
    return {
        title: `选择 数据`,
        objectSchema,
        listSchema,
        rows,
        selectedRowKeys: ["2"],
        onFinish: async (values, rows) => {
            console.log("values:", values, rows);
            return true;
        }
    }
}

export default {
    title: "SteedosUI",
}
export const SteedosUI = () => {
    function callback(key) {
        setTimeout(()=>{
            if (key === 'page') {
                (window as any).SteedosUI.render(PublicPage, { token: '610cdddedb5d0c2aacf390fb' }, document.getElementById('render_page'))
            } else if (key === 'table') {
                (window as any).SteedosUI.render(ObjectTable, getSchemaTalbeProps(), document.getElementById('render_table'))
            }
        }, 300)
    }
    return (
        <Tabs defaultActiveKey="1" onChange={callback}>
            <TabPane tab="Render Table" key="table" id="render_table">
                <div id="render_table"></div>
            </TabPane>
            <TabPane tab="Render page" key="page" id="render_page">
                <div id="render_page"></div>
            </TabPane>
        </Tabs>
        //   <React.Fragment>
        //     <Button type="primary" onClick={()=>{
        //       (window as any).SteedosUI.render(ObjectTable,getSchemaTalbeProps(), document.getElementById('render_table'))
        //     }}>SteedosUI.render - Table</Button>
        //     <Button type="primary" onClick={()=>{
        //       (window as any).SteedosUI.render(PublicPage, {
        //         token: '610cdddedb5d0c2aacf390fb'
        //       }, document.getElementById('render_page'))
        //     }}>SteedosUI.render - PublicPage</Button>
        //     <br />
        //     <br />
        //     <div id="render_page"></div>
        //     <div id="render_table"></div>
        //   </React.Fragment>
    )
}
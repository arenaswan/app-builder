import { ObjectGrid, ObjectTreeGrid } from "@steedos-ui/builder-ag-grid";
import React, { useState, useRef } from 'react';
import { Button, Input } from "antd"
import { Form,Field } from '@steedos-ui/builder-form';
export default {
  title: "Object Table AG Grid",
}

export const Grid = () => {
  return (
    <div style={{height:'500px'}}>
      <ObjectGrid 
        // objectApiName='accounts' 
        // selectedRowKeys={["6k5svcTmfopo3dXWr"]}
        objectApiName='organizations' 
        // selectedRowKeys={["C25heacKZD9uy2EAj"]}
        sort="created desc,name desc"
        // rowSelection="single"
        columnFields={
          [
            {
              fieldName: 'name',
              width: '200'
            },
            {
              fieldName: 'fullname',
              // hideInTable: true,
              width: 240
            },
            // {
            //   fieldName: 'description'
            // },
            // {
            //   fieldName: 'parent_id'
            // },
            // {
            //   fieldName: 'rating'
            // },
            // {
            //   fieldName: 'type'
            // },
            {
              fieldName: 'created'
            },
            {
              fieldName: 'created_by'
            },
          ]
        }
      >
      </ObjectGrid>
    </div>
  )
}

// wrap功能暂时只支持isInfinite为false的情况
export const GridWithColumnWrap = () => {
  return (
    <div style={{height:'500px'}}>
      <ObjectGrid 
        objectApiName='tasks' 
        isInfinite={false}
        columnFields={
          [
            {
              fieldName: 'name',
              width: '200',
              wrap: true
            },
            {
              fieldName: 'created'
            },
            {
              fieldName: 'created_by'
            },
          ]
        }
      >
      </ObjectGrid>
    </div>
  )
}

export const GridWithRefreshButton = () => {
	const gridRef = useRef(null as any);
  return (
    <div style={{height:'500px'}}>
      <Button
        onClick={(e) => {
          gridRef.current.api.ensureIndexVisible(0);
          gridRef.current.api.purgeInfiniteCache()
          // gridRef.current.api.refreshInfiniteCache()
        }}
      >刷新</Button>
      <ObjectGrid 
        gridRef={gridRef}
        // objectApiName='accounts' 
        // selectedRowKeys={["6k5svcTmfopo3dXWr"]}
        objectApiName='space_users' 
        // selectedRowKeys={["C25heacKZD9uy2EAj"]}
        sort="created desc,name desc"
        // rowSelection="single"
        columnFields={
          [
            {
              fieldName: 'name',
              width: '200'
            },
            {
              fieldName: 'created'
            },
            {
              fieldName: 'created_by'
            },
          ]
        }
      >
      </ObjectGrid>
    </div>
  )
}

export const GridWithFilters = () => {
  const [textFilters, setTextFilters] = useState<any>(null)
  return (
    <div style={{height:'500px'}}>
      <Input
        onChange={(e) => {
          let text = e.target.value;
          console.log("changed text:", text);
          if(text){
            setTextFilters(["name", "contains", text]);
          }
          else{
            setTextFilters(null);
          }
        }}
      ></Input>
      <ObjectGrid 
        // objectApiName='accounts' 
        // selectedRowKeys={["6k5svcTmfopo3dXWr"]}
        objectApiName='contracts' 
        selectedRowKeys={["C25heacKZD9uy2EAj"]}
        sort="created desc,name desc"
        filters={textFilters}
        columnFields={
          [
            {
              fieldName: 'name',
              width: '200'
            },
            {
              fieldName: 'created'
            },
            {
              fieldName: 'created_by'
            },
          ]
        }
      >
      </ObjectGrid>
    </div>
  )
}

export const GridAutoHideEmpty = () => {
  const [textFilters, setTextFilters] = useState<any>(null)
  return (
    <div style={{height:'500px'}}>
      <Input
        onChange={(e) => {
          let text = e.target.value;
          console.log("changed text:", text);
          if(text){
            setTextFilters(["name", "contains", text]);
          }
          else{
            setTextFilters(null);
          }
        }}
      ></Input>
      <ObjectGrid 
        // objectApiName='accounts' 
        // selectedRowKeys={["6k5svcTmfopo3dXWr"]}
        objectApiName='contracts' 
        selectedRowKeys={["C25heacKZD9uy2EAj"]}
        sort="created desc,name desc"
        autoHideForEmptyData={true}
        filters={textFilters}
        columnFields={
          [
            {
              fieldName: 'name',
              width: '200'
            },
            {
              fieldName: 'created'
            },
            {
              fieldName: 'created_by'
            },
          ]
        }
      >
      </ObjectGrid>
    </div>
  )
}

export const GridAutoFixHeight = () => {
  return (
    <div>
      <ObjectGrid 
        // objectApiName='accounts' 
        // selectedRowKeys={["6k5svcTmfopo3dXWr"]}
        objectApiName='contracts' 
        selectedRowKeys={["C25heacKZD9uy2EAj"]}
        sort="created desc,name desc"
        // rowSelection="single"
        pageSize={5}
        rowHeight={28}
        headerHeight={33}
        autoFixHeight={true}
        columnFields={
          [
            {
              fieldName: 'name',
              width: '200'
            },
            {
              fieldName: 'created'
            },
            {
              fieldName: 'created_by'
            },
          ]
        }
      >
      </ObjectGrid>
    </div>
  )
}

export const NotInfiniteGrid = () => {
  return (
    <div style={{height:'500px'}}>
      <ObjectGrid objectApiName='accounts' 
        selectedRowKeys={["6k5svcTmfopo3dXWr"]}
        isInfinite={false}
        sort="created desc,name desc"
        pageSize={20}
        columnFields={
          [
            {
              fieldName: 'name',
              width: '200'
            },
            {
              fieldName: 'description'
            },
            {
              fieldName: 'parent_id'
            },
            {
              fieldName: 'rating'
            },
            {
              fieldName: 'type'
            },
            {
              fieldName: 'created'
            },
            {
              fieldName: 'created_by'
            },
          ]
        }
      >
      </ObjectGrid>
    </div>
  )
}

export const NotInfiniteGridWithRefreshButton = () => {
	const gridRef = useRef(null as any);
  return (
    <div style={{height:'500px'}}>
      <Button
        onClick={(e) => {
          // gridRef.current.api.paginationGoToFirstPage()
          gridRef.current.api.refreshServerSideStore()
        }}
      >刷新</Button>
      <ObjectGrid 
        isInfinite={false}
        gridRef={gridRef}
        // objectApiName='accounts' 
        // selectedRowKeys={["6k5svcTmfopo3dXWr"]}
        objectApiName='contracts' 
        selectedRowKeys={["C25heacKZD9uy2EAj"]}
        sort="created desc,name desc"
        // rowSelection="single"
        columnFields={
          [
            {
              fieldName: 'name',
              width: '200'
            },
            {
              fieldName: 'created'
            },
            {
              fieldName: 'created_by'
            },
          ]
        }
      >
      </ObjectGrid>
    </div>
  )
}


export const NoPaginationGrid = () => {
  return (
    <div style={{height:'500px'}}>
      <ObjectGrid objectApiName='accounts' 
        selectedRowKeys={["6k5svcTmfopo3dXWr"]}
        pagination={false}
        sort="created desc,name desc"
        columnFields={
          [
            {
              fieldName: 'name',
              width: '200'
            },
            {
              fieldName: 'description'
            },
            {
              fieldName: 'parent_id'
            },
            {
              fieldName: 'rating'
            },
            {
              fieldName: 'type'
            },
            {
              fieldName: 'created'
            },
            {
              fieldName: 'created_by'
            },
          ]
        }
      >
      </ObjectGrid>
    </div>
  )
}

export const TreeGrid = () => {
  return (
    <div style={{height:'500px'}}>
      <ObjectTreeGrid objectApiName='organizations' 
        // pagination={false}
        sort="created desc,name desc"
        // rowSelection="single"
        columnFields={
          [
            {
              fieldName: 'name',
              width: 240
            },
            // {
            //   fieldName: 'fullname',
            //   // hideInTable: true,
            //   width: 240
            // },
            {
              fieldName: 'created',
              width: 300
            },
            {
              fieldName: 'created_by'
            },
          ]
        }
      >
      </ObjectTreeGrid>
    </div>
  )
}

export const TreeGridWithFilters = () => {
  const [textFilters, setTextFilters] = useState<any>(null)
  return (
    <div style={{height:'500px'}}>
      <Input
        onChange={(e) => {
          let text = e.target.value;
          console.log("changed text:", text);
          if(text){
            setTextFilters(["name", "contains", text]);
          }
          else{
            setTextFilters(null);
          }
        }}
      ></Input>
      <ObjectTreeGrid 
        objectApiName='organizations' 
        sort="created desc,name desc"
        filters={textFilters}
        columnFields={
          [
            {
              fieldName: 'name',
              width: 240
            },
            {
              fieldName: 'created',
              width: 300
            },
            {
              fieldName: 'created_by'
            },
          ]
        }
      >
      </ObjectTreeGrid>
    </div>
  )
}

export const TreeGridWithRootKeys = () => {
  const [treeRootKeys, setTreeRootKeys] = useState<any>(null)
  return (
    <div style={{height:'500px'}}>
      <Form
        submitter={false}
        onValuesChange={(changeValues: any)=>{
          console.log("===changeValues===", changeValues);
          const rootKeys = changeValues.rootKeys;
          setTreeRootKeys(rootKeys);
        }}
      >
        <Field 
          name="rootKeys"
          valueType="lookup"
          mode="edit"
          placeholder="请选择根组织"
          fieldSchema={{
            reference_to: "organizations",
            multiple: true
          }}
        />
      </Form>
      <ObjectTreeGrid 
        objectApiName='organizations' 
        sort="created desc,name desc"
        treeRootKeys={treeRootKeys}
        columnFields={
          [
            {
              fieldName: 'name',
              width: 240
            },
            {
              fieldName: 'created',
              width: 300
            },
            {
              fieldName: 'created_by'
            },
          ]
        }
      >
      </ObjectTreeGrid>
    </div>
  )
}

export const TreeGridWithRootFilters = () => {
  const [treeRootFilters, setTreeRootFilters] = useState<any>(null)
  return (
    <div style={{height:'500px'}}>
      <Form
        submitter={false}
        onValuesChange={(changeValues: any)=>{
          console.log("===changeValues===", changeValues);
          const rootKeys = changeValues.rootKeys;
          if(rootKeys && rootKeys.length){
            setTreeRootFilters(["parent", "=", rootKeys]);
          }
          else{
            setTreeRootFilters(null);
          }
        }}
      >
        <Field 
          name="rootKeys"
          valueType="lookup"
          mode="edit"
          placeholder="请选择根组织"
          fieldSchema={{
            reference_to: "organizations",
            multiple: true
          }}
        />
      </Form>
      <ObjectTreeGrid 
        objectApiName='organizations' 
        sort="created desc,name desc"
        treeRootFilters={treeRootFilters}
        // filters={textFilters}
        columnFields={
          [
            {
              fieldName: 'name',
              width: 240
            },
            {
              fieldName: 'created',
              width: 300
            },
            {
              fieldName: 'created_by'
            },
          ]
        }
      >
      </ObjectTreeGrid>
    </div>
  )
}

export const SchemaGrid = () => {
  const rows = [{
    _id:"1", 
    name:"A", 
    tags:["1"], 
    discount: 0.5,
    discount_multiple: [0.5,0.6],
    contract:"C25heacKZD9uy2EAj"
  },{
    _id:"2", 
    name:"B", 
    tags:["2"], 
    discount: 0.6,
    count: 6,
    contract:"C25heacKZD9uy2EAj"
  },{
    _id:"3", 
    name:"C", 
    tags:["1", "2"], 
  },{
    _id:"4", 
    name:"D", 
    tags:["1"], 
    contract:"C25heacKZD9uy2EAj"
  },{
    _id:"5", 
    name:"E", 
    tags:["2"], 
    contract:"C25heacKZD9uy2EAj"
  },{
    _id:"6", 
    name:"F", 
    tags:["1", "2"], 
  }];
  return (
    <div style={{height:'500px'}}>
      <ObjectGrid
        rows={rows}
        selectedRowKeys={["2"]}
        columnFields={
          [
            {
              fieldName: 'name',
              width: '200'
            },
            {
              fieldName: 'tags'
            },
            {
              fieldName: 'discount'
            },
            {
              fieldName: 'discount_multiple'
            },
            {
              fieldName: 'count'
            },
            {
              fieldName: 'contract'
            }
          ]
        }
        objectSchema={{
          fields:{
            name: {
              type: 'text',
              label: '名称',
            },
            tags: {
              type: 'select',
              label: '标签',
              options:[
                { label: '老人',   value:'1' },
                { label: '中年人', value: '2' },
                { label: '年轻人', value: '3' },
                { label: '孩童', value: '4' }
              ],
              multiple: true
            },
            discount: {
              type: 'select',
              label: '折扣',
              options:[
                { label: '八折',   value: 0.8 },
                { label: '七折', value: 0.7 },
                { label: '六折', value: 0.6 },
                { label: '五折', value: 0.5 }
              ],
              data_type: 'number'
            },
            discount_multiple: {
              type: 'select',
              label: '折扣多选',
              options:[
                { label: '八折',   value: 0.8 },
                { label: '七折', value: 0.7 },
                { label: '六折', value: 0.6 },
                { label: '五折', value: 0.5 }
              ],
              data_type: 'number',
              multiple: true
            },
            count: {
              type: 'number',
              label: '数量'
            },
            contract: {
              reference_to: 'contracts',
              type: 'lookup',
              label: '合同'
            },
          }
        }}
      />
    </div>
  )
}
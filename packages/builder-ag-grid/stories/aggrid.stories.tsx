import { ObjectGrid, ObjectTreeGrid } from "@steedos/builder-ag-grid";
import * as React from "react"
export default {
  title: "Object Table AG Grid",
}

export const Grid = () => {
  return (
    <div style={{height:'500px'}}>
      <ObjectGrid objectApiName='accounts' 
        pagination={true}
        sort="created desc,name desc"
        // rowSelection="single"
        columnFields={
          [
            {
              fieldName: 'name'
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
              hideInTable: true
            },
            // {
            //   fieldName: 'parent',
            //   hideInTable: true
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
      </ObjectTreeGrid>
    </div>
  )
}

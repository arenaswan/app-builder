import * as React from "react"
import { Form,Field } from '@steedos-ui/builder-form';
import { FilterForm } from "@steedos-ui/builder-object";

export default {
  title: "Filter",
}

export const ObjectFilter = () => {
  return (
      <FilterForm
       objectApiName={"accounts"}
       fields={["name"]}
      />
  )
}

export const SchemaFilter = () => {
  return (
      <FilterForm
       objectSchema={{
         fields:{
          name: {
            type: 'text',
            label: "名称"
          },
          amount: {
            type: 'currency',
            label: "金额"
          },
          count: {
            type: 'number',
            label: "数量"
          },
          due_date:{
            type: 'date',
            label: "到时日期"
          },
          created:{
            type: 'datetime',
            label: "创建时间"
          },
         }
       }}
      />
  )
}
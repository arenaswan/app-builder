import React from "react"
import {has} from "lodash"
import ProField from "@ant-design/pro-field";

export const AgGridCellRenderer = (props: any) => {
  const { 
    value, 
    valueType = 'text',
    render,
    fieldSchema,
    form,
    data,
    context,
  } = props;
  if(!props.data){
    return "";
  }
  const editedMap: any= context?.editedMap
  if(editedMap){
    const recordEdited = editedMap[data._id];
    if(recordEdited && has(recordEdited, props.colDef.field) && props.eGridCell.className.indexOf("slds-is-edited") < 0){
      props.eGridCell.className = props.eGridCell.className + ' slds-is-edited'
    }
  }

  let _render = null;

  if(render){
    _render = (dom)=>{
      return render(dom, data)
    }
  }
  // 当emptyText={false}时，boolean或toggle字段，数据库中无值，会进入valueTypes中自定义render（只读）。
  const emptyText = ['boolean', 'toggle'].indexOf(valueType) > -1 ? false : '';
  return (
    
    <ProField 
      mode='read'
      render = {_render}
      valueType={valueType} 
      fieldProps={{
        _grid_row_id: props.data._id,
        field_schema: fieldSchema
      }}
      form={form}
      text={value}
      emptyText={emptyText}
      />
  ) 
}

import React from "react"
import { forEach, has} from "lodash"
import ProField from "@ant-design/pro-field";

export const AgGridCellRenderer = (props: any) => {
  const { 
    value, 
    valueType = 'text',
    render,
    fieldSchema,
    objectApiName,
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
      // dom 是值，不是标签元素。
      let fieldType ;
      if(fieldSchema){
        fieldType = fieldSchema.data_type ? fieldSchema.data_type : fieldSchema.type;
      }
      return render(dom, data, fieldType)
    }
  }
  // 当emptyText={false}时，boolean或toggle字段，数据库中无值，会进入valueTypes中自定义render（只读）。
  const emptyText = ['boolean', 'toggle'].indexOf(valueType) > -1 ? false : '';
  let depend_field_values = {};
  let allValues = {};
  if(!form){
    // ObjectGrid的form为undefined, 依赖了depend_field_values；   aggrid的form有表单值，且此时传入的值可能会覆盖外面同名的字段值，所以目前不需要depend_field_values；
    if(fieldSchema && fieldSchema.depend_on && fieldSchema.depend_on.length){
      forEach(fieldSchema.depend_on,(val)=>{
        if(props.data[val] !== undefined){
          depend_field_values[val] = props.data[val];
          allValues = props.data;
        }
      })
    }
  }
  return (
    
    <ProField 
      mode='read'
      render = {_render}
      valueType={valueType} 
      fieldProps={{
        _grid_row_id: props.data._id,
        allValues,
        depend_field_values,
        field_schema: fieldSchema
      }}
      form={form}
      text={value}
      emptyText={emptyText}
      object_api_name={objectApiName}
      />
  ) 
}

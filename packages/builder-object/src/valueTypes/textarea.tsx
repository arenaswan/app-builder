import React from 'react'
import FieldTextArea from "@ant-design/pro-field/es/components/TextArea";

import "./textarea.less"

export const textarea = {
  render: (text: any, props: any) => {
    const { fieldProps } = props;
    let value = fieldProps.value || props.text;//ProTable那边fieldProps.value没有值，只能用text

    const { field_schema } = fieldProps;
    const { rows } = field_schema;
    let newFieldProps =  fieldProps;
    if(typeof rows === 'number'){
      newFieldProps = Object.assign({}, fieldProps , {rows})
    }
    let renderDom = props.render;
    if(!props.render){
      renderDom = (dom: any, record: any)=>{
        return (<span title={value}>{value}</span>)
      }
    }
    return (<FieldTextArea text={text as string} {...props} render={renderDom} fieldProps={newFieldProps}/>)
  },
  renderFormItem: (text: any, props: any) => {
    const { fieldProps } = props;
    const { field_schema } = fieldProps;
    const { rows } = field_schema;
    let newFieldProps =  fieldProps;
    if(typeof rows === 'number'){
      newFieldProps = Object.assign({}, fieldProps , {rows})
    }
    return (
      <FieldTextArea text={text as string} {...props} fieldProps={newFieldProps}/>
    )
  }
}


import React from 'react'
import { Field } from "@steedos/builder-form";
import QRCode from "qrcode.react";

export const url = {
  render: (text: any, { fieldProps }: any)=> {
    const { field_schema = {} } = fieldProps;
    const { show_as_qr } = field_schema;
    let value= fieldProps.value || text;//ProTable那边fieldProps.value没有值，只能用text
    if(show_as_qr && value && value.length){
      return (<a href={value} target="_blank"><QRCode value={value} renderAs={"svg"} style={{ width:'84px', height: 'auto', border: '1px solid #888', padding: '1px'}} /></a>)
    }
    else{
      return (<a href={value} target="_blank">{value}</a>);
    }
  },
  renderFormItem: (_: any, props: any) => (
    <Field mode='edit' type='text' {...props} />
  ),
}


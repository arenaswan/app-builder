import React, { useEffect, useState } from "react";
import { CheckIcon } from '@chakra-ui/icons'
import { Checkbox } from 'antd';
import Button from '@salesforce/design-system-react/components/button'; 
import { isNil } from 'lodash'

export const boolean = {
  render: (text: any, props: any)=> {
    const { fieldProps } = props;
    const { field_schema } = fieldProps;
    const { readonly } = field_schema;
    let value = !isNil(fieldProps.value) ? fieldProps.value : props.text;
    if(readonly){
      if(value){
        return (<CheckIcon/>)
      }else{
        return (<span></span>);
      }
    }else{
      if(value){
        return (<Checkbox checked={value}  disabled={true}/>)
      }else{
        return (
          <Button
            style={{marginLeft:'-4px'}}
            iconCategory="utility"
            iconName="steps"
            iconSize="small"
            iconVariant="container"
            iconClassName="slds-button__icon slds-button__icon_hint"
            variant="icon" />
        );
      }
    } 
  },
  renderFormItem: (text: any, props: any) => {
    const { fieldProps } = props;
    const { onChange: formOnChange } = fieldProps;
    let value: boolean = !isNil(fieldProps.value) ? fieldProps.value : !!props.text;
    // 添加useState的原因是 列表视图 和grid类型下boolean子字段不能来回切换其值。
    const [checked, setChecked] = useState(value);
    function onChange(e) {
      formOnChange(e.target.checked);
      setChecked(e.target.checked);
    }
    // fix 如果含有默认值， const [checked, setChecked] = useState(value); 这行代码只会实行一次的bug。
    useEffect(()=>{
      setChecked(value);
    },[value])
    return (<Checkbox onChange={onChange} checked={checked}></Checkbox>)
  }
}


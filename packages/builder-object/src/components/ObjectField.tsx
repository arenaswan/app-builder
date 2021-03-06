import React, { useContext } from "react";

import { Field } from '@steedos-ui/builder-form'
import _ from 'lodash';
import { useQuery } from "react-query";
import { observer } from "mobx-react-lite"
import { FormContext } from "antd/es/form/context";
import { ProFormDependency } from '@ant-design/pro-form';
import useAntdMediaQuery from 'use-media-antd-query';
import { Forms } from '@steedos-ui/builder-store';

export type ObjectFieldProps = {
  objectApiName?: string,
  fieldName: string,
  fieldSchema: any,
}

export const ObjectField = observer((props: any) => {
  const context = useContext(FormContext);
  const formId = context.name?context.name:'default';
  const { objectApiName, fieldName, fieldSchema, form } = props
  
  const colSize = useAntdMediaQuery();
  const isMobile = (colSize === 'sm' || colSize === 'xs') && !props.disableMobile;
  if (isMobile)
    fieldSchema.is_wide = true
  /*
    TODO: fieldSchema 如果不存在，应该从对象中获取，但是对象应该从 store 中获取，而不是请求。
  */
  
  // 从对象定义中生成字段信息。
  let mode = Forms.loadById(formId).mode;
  let formFieldProps: any = {
    name: fieldName,
    mode,
    label: fieldSchema.label? fieldSchema.label: fieldName,
    placeholder: fieldSchema.help,
    hidden: fieldSchema.hidden,
    valueType: fieldSchema.type,
    required: fieldSchema.required,
    // options: fieldSchema.options,
    readonly: fieldSchema.readonly,
    isWide: fieldSchema.is_wide,
    fieldSchema,
  }

  if (mode == "edit") {

    if (fieldSchema.omit) {
      // omit的字段编辑时不显示不render，不render是sections中没有把这个字段加上，而不是依靠这里的hidden #138
      formFieldProps.hidden = true
    }
  } else if (mode == "read") {
    if (fieldSchema.omit) {
      // omit的字段只读时显示为只读 #138
      formFieldProps.readonly = true
    }
  }

  if (formFieldProps.required) {
    formFieldProps.rules = [
      {
        required: true,
        message: `请输入${formFieldProps.label}`,
      },
    ]
  }
  if (formFieldProps.valueType === "email") {
    const emailRule = {
      type: 'email',
      message: `${formFieldProps.label}必须是合法的电邮地址`,
    };
    if(formFieldProps.rules){
      formFieldProps.rules.push(emailRule)
    }
    else{
      formFieldProps.rules = [emailRule]
    }
  }

  const formItemProps:any = {
    colon: false,
  }

  const dependOn = fieldSchema.depend_on ? fieldSchema.depend_on : []

  return (
    <ProFormDependency name={dependOn}>
      {(dependFieldValues, allValues) => {
        return (
          <Field
            formItemProps={formItemProps}
            dependFieldValues={dependFieldValues}
            objectApiName={objectApiName}
            form={form}
            {...formFieldProps}
          />)
      }}
    </ProFormDependency>
  )
});
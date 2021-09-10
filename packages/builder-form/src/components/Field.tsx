import ProField from "@ant-design/pro-field";
import type { InputProps } from 'antd';
import { API } from "@steedos/builder-store"
import { isFunction, isNil } from 'lodash';

import React, { useContext, useState } from "react";
import * as PropTypes from 'prop-types';
import { Flex, Box } from "@chakra-ui/layout"
import { FormContext } from "antd/es/form/context";
import createField from '@ant-design/pro-form/es/BaseForm/createField'

import { ProFormItemProps } from "@ant-design/pro-form/es/interface";
import { Forms } from '@steedos/builder-store';

import { observer } from "mobx-react-lite"
import Button from '@salesforce/design-system-react/components/button'; 
import { safeRunFunction } from '@steedos/builder-sdk';

import './Field.less'

const FieldsMap = {};

export const Field = observer((props: any) => {
  const context = React.useContext(FormContext);
  const formId = context.name ? context.name : 'default';
  const {
    attributes,
    // name, 
    // label, 
    // tooltip, 
    // allowClear,
    placeholder = '',
    // required,
    readonly,
    // referenceTo,
    // disabled,
    mode: fieldMode,
    valueType,
    isWide = false,
    showInlineIcon = true, //valueType != 'object' && valueType != 'grid',
    formItemProps = {},
    objectApiName,
    // type,
    // count,
    // defaultValue,
    // defaultChecked,
    // options,
    ...rest
  } = props

  const mode = fieldMode ? fieldMode : Forms.loadById(formId).mode
  const formItemPropsMerged = {
    ...attributes,
    ...formItemProps,
    tooltip: props.fieldSchema?.inlineHelpText,
    className: `field type-${valueType} mode-${mode} field-${readonly ? 'readonly' : 'editable'}`,
  }

  // if (valueType == 'object') {
  //   formItemPropsMerged.style = {gridColumn: 'span 2/span 2'};
  //   formItemPropsMerged.labelCol = { span: 0 };
  //   formItemPropsMerged.wrapperCol = { span: 24 };
  // } else if (valueType == 'grid') {
  //   formItemPropsMerged.style = {gridColumn: 'span 2/span 2'};
  //   formItemPropsMerged.labelCol = { span: 0 };
  //   formItemPropsMerged.wrapperCol = { span: 24 };
  // } else 
  if (isWide) {
    formItemPropsMerged.style = {gridColumn: 'span 2/span 2'};
    if (context.vertical) {
      // formItemPropsMerged.labelCol = { span: 24 };
      // formItemPropsMerged.wrapperCol = { span: 24 };
    } else {
      formItemPropsMerged.labelAlign = 'left'
      formItemPropsMerged.labelCol = { span: 3 };
      formItemPropsMerged.wrapperCol = { span: 21 };
    }
  } else {
    if (context.vertical) {
      // formItemPropsMerged.labelCol = { span: 24 };
      // formItemPropsMerged.wrapperCol = { span: 24 };
    } else {
      formItemPropsMerged.labelAlign = 'left'
      formItemPropsMerged.labelCol = { span: 6 };
      formItemPropsMerged.wrapperCol = { span: 18 };
    }

  }

  const ProFieldWrap = observer((props: any) => {

    const { 
      readonly, 
      mode, 
      fieldSchema,
      fieldProps,
      dependFieldValues,proFieldProps: defaultProFieldProps, ...rest } = props

    // 当'boolean','toggle'组件设置emptyText 为 false 时，字段值为空时只读模式下使其进入valueTypes中定义的render函数。
    const emptyText = ['boolean', 'toggle'].indexOf(valueType) > -1 ? false : '';
    const proFieldProps = {
      emptyText: emptyText,
      fieldProps: Object.assign({}, fieldProps, {
        field_schema: fieldSchema,
        placeholder,
        depend_field_values: dependFieldValues,
      }),
      ...rest
    }

    // "formula", "summary"为readonly，强行进入编辑状态，以显示额外提示文字
    if ((!readonly || ["formula", "summary"].indexOf(fieldSchema.type) > -1) && mode === 'edit') {
      let defaultValue = fieldSchema?.defaultValue;
      if(isFunction(defaultValue)){
        defaultValue = safeRunFunction(defaultValue,[], null, {name:fieldSchema.name});
      }
      if (fieldProps.value === undefined && !isNil(defaultValue)) {
        let formValue = defaultValue;
        setTimeout(()=>{
          // 不加setTimeout的话，onChange函数触发的表单的onValuesChange事件中第二个参数为空对象，会造成reCalcSchema函数执行公式表达式有问题
          proFieldProps.fieldProps.onChange(formValue);
        }, 100);
        proFieldProps.fieldProps.defaultValue = formValue;
      }
      return <ProField mode='edit' {...proFieldProps} />

    }

    const onInlineEdit = () => {
      Forms.loadById(formId).setMode('edit')
    };
    const inlineIconOpacity = 0.4
    const inlineIcon = readonly ?
      <Button
        iconCategory="utility"
        iconName="lock"
        iconSize="small"
        iconVariant="container"
        iconClassName="slds-button__icon slds-button__icon_hint"
        variant="icon"/> :
      <Button
        iconCategory="utility"
        iconName="edit"
        iconSize="small"
        iconVariant="container"
        iconClassName="slds-button__icon slds-button__icon_hint"
        variant="icon"
        //<EditIcon color='gray.600' opacity={inlineIconOpacity} _groupHover={{ opacity: 1 }}
        onClick={() => {
          onInlineEdit()
        }}
      />


    const containerOptions = {
      className: 'field-flex-container'
    }

    return (
      <Flex
        {...containerOptions}
        role="group"
        onDoubleClick={() => { if (!readonly) onInlineEdit(); }}
      >
        <Box flex="1" className='field-flex-box-content'><ProField mode='read' {...proFieldProps} /></Box>
        {showInlineIcon && (<Box width="16px">{inlineIcon}</Box>)}
      </Flex>
    )
  })

  if(!FieldsMap[`${valueType}_${mode}_${readonly}`]){
    const ProFormField = createField<ProFormItemProps<InputProps>>(
      (props: ProFormItemProps<InputProps>) => {
        return (
          <ProFieldWrap valueType={valueType} {...props} mode={mode} readonly={readonly} />
        )
      },
      {
        valueType,
      },
    );
    FieldsMap[`${valueType}_${mode}_${readonly}`] = ProFormField;
  }
  const SField = FieldsMap[`${valueType}_${mode}_${readonly}`];
  return (<SField formId={formId} object_api_name={objectApiName} {...rest} mode={mode} formItemProps={formItemPropsMerged} />)
})

Field['propTypes'] = {
  name: PropTypes.string,
  label: PropTypes.string,
  valueType: PropTypes.string,
};
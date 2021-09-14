import React, { useState ,useEffect } from 'react'
import { isFunction, filter } from 'lodash';
import FieldSelect from '@ant-design/pro-field/es/components/Select';
import { safeRunFunction } from '@steedos/builder-sdk';
import { observer } from "mobx-react-lite";
import { SteedosIcon } from '@steedos/builder-lightning';
import styled from 'styled-components'
import "./select.less"

const hexToRgb = (hex)=>{
  hex = hex.slice(1);
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16)
  };
};

const _pickTextColorBasedOnBgColorAdvanced = (bgColor, lightColor, darkColor)=>{
  const rgb = hexToRgb(bgColor);
  const {r,g,b} = rgb
  const uicolors = [r / 255, g / 255, b / 255];
  const c = uicolors.map((col)=>{
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  if (L > 0.179) {
    return darkColor;
  } else {
    return lightColor;
  }
};

let ColorSpan = styled.span`
  border-radius: 10px;
  padding: 2px 6px;
  border: 1px;
  vertical-align: middle;
  &.select-multiple{
      margin-right:1px;
      @media (max-width: 767px) {
        margin-right:4px;
      }
  }
`;

export const SelectField = observer((props: any) => {
  const { valueType, mode, fieldProps = {}, form, ...rest } = props;
  const [params, setParams] = useState({ open: false, openTag: null });
  const { field_schema: fieldSchema = {}, depend_field_values: dependFieldValues = {} } = fieldProps;
  const { multiple , optionsFunction } = fieldSchema;
  let options = optionsFunction ? optionsFunction : fieldSchema.options;
  const value = fieldProps.value || props.text;//ProTable那边fieldProps.value没有值，只能用text
  let [ fieldsValue ,setFieldsValue ] = useState({});
  // 按原来lookup控件的设计，this.template.data._value为原来数据库中返回的选项值，this.template.data.value为当前用户选中的选项
  const optionsFunctionThis = {
    template: {
      data: {
        value: value,
        _value: value
      }
    }
  };
  const objectApiName = props.object_api_name;
  // useEffect(() => {
  //   console.log('select========')
  //   setFieldsValue(form?.getFieldsValue());
  //   setParams({ open: params.open, openTag: new Date() });
  // }, [dependFieldValues])
  const fieldsValues = Object.assign({}, form?.getFieldsValue() , dependFieldValues);
  let optionsFunctionValues:any = Object.assign({}, fieldsValues || {}, {
    // space: Settings.tenantId,
    _object_name: objectApiName
  });

  if (mode === 'read') {
    let tags = [];
    options = isFunction(options) ? safeRunFunction(options, [optionsFunctionValues], [], optionsFunctionThis) : options;
    tags = filter(options, (optionItem: any) => {
      return multiple ? value.indexOf(optionItem.value) > -1 : optionItem.value === value;
    })
    if (multiple && value && value.length > 1) {
      tags.sort((m,n)=>{return value.indexOf(m.value) - value.indexOf(n.value)})
    }
    const tagsDom = tags.map((tagItem, index) => {
      let selectClassNames: string[] = [];
      let colorStyle: any={};
      if (tagItem.color && tagItem.color.length) {
        colorStyle.background = '#' + tagItem.color;
        const fontColor = _pickTextColorBasedOnBgColorAdvanced(tagItem.color, '#fff', '#333')
        colorStyle.color = fontColor;
        selectClassNames.push('select-color');
      }
      if(multiple){
        selectClassNames.push("select-multiple");
      }
      return (
        <React.Fragment key={tagItem.value}>
          {index > 0 && ' '}
          <ColorSpan style={{ ...colorStyle }} className={selectClassNames.join(" ")} >
            {tagItem.label}
          </ColorSpan>
        </React.Fragment>
      )
    });
    return (<React.Fragment>{tagsDom}</React.Fragment>)
  } 
  else {
    if (multiple) {
      fieldProps.mode = 'multiple';
    }
    let proFieldProps: any = {};
    let request: any;
    let onDropdownVisibleChange: any;

    if (isFunction(options)) {
      request = async (params: any, props: any) => {
        optionsFunctionValues._keyWords = params.keyWords;
        const results = await safeRunFunction(options, [optionsFunctionValues], [], optionsFunctionThis);
        return results;
      };
      onDropdownVisibleChange = (open: boolean) => {
        if (open) {
          setParams({ open, openTag: new Date() });
        }
      }
      proFieldProps = {
        request,
        params,
        onDropdownVisibleChange
      }
    } else if (options) {
      //options为空时不能直接覆盖fieldProps.options中的值，因为要允许直接给控件fieldProps.options赋值
      props.fieldProps.options = options;
    }
    let optionItemRender;
    optionItemRender = (item: any) => {
      return (
        item.icon ? (
          <React.Fragment>
            <span role="img" aria-label="smile" className="anticon anticon-smile"><SteedosIcon name={item.icon} size="x-small" /></span>
            <span>{item.label}</span>
          </React.Fragment>
        ) : item.label
      )
    }
    proFieldProps.optionItemRender = optionItemRender;
    proFieldProps.showSearch = true;
    proFieldProps.showArrow = true;
    proFieldProps.optionFilterProp = 'label';
    // TODO: multiple：如果是true, 后期 需要 支持对已选中项进行拖动排序
    return (
      <div className="select-field-container">
        <FieldSelect mode='edit' {...props} {...proFieldProps} />
      </div>
    )
  }
})

export const select = {
  render: (text: any, props: any) => {
    return (<SelectField {...props} mode="read" />)
  },
  renderFormItem: (text: any, props: any) => {
    return (<SelectField {...props} mode="edit" />)
  }
}
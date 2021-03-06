import React from 'react';
import ProField from "@ant-design/pro-field";
import { isNil} from 'lodash';

const numberToString = (number: number | string, scale: number, notThousands: boolean = false)=>{
  if (typeof number === "number") {
    number = number.toString();
  }
  if (!number) {
    return '';
  }
  if (number !== "NaN") {
    if (scale || scale === 0) {
      number = Number(number).toFixed(scale);
    }
    if (!notThousands) {
      if (!(scale || scale === 0)) {
        // 没定义scale时，根据小数点位置算出scale值
        let regDots = number.match(/\.(\d+)/);
        scale = regDots && regDots[1] && regDots[1].length
        if (!scale) {
          scale = 0;
        }
      }
      let reg = /(\d)(?=(\d{3})+\.)/g;
      if (scale === 0) {
        reg = /(\d)(?=(\d{3})+\b)/g;
      }
      number = number.replace(reg, '$1,');
    }
    return number;
  } else {
    return "";
  }
}

// const format = (val: string, precision: number = 18, scale: number = 0)=>{
//   if(isNil(val) || val === ""){
//     return null;
//   }
//   var _val = new Number(val);
//   let dotIndex = val.indexOf(".");
//   if (dotIndex > -1) {
//     if (val.length - 1 > precision) {
//       _val = Number(val.substring(0, precision - scale - 1))
//     }
//     // 因为ant的formatter功能不是在onBlur失去焦点事件触发，而是一修改值就触发了
//     // 如果保留自动补零格式功能会影响体验，所以只能放弃自动补零格式功能
//     if(val.length - dotIndex > scale){
//       return _val.toFixed(scale);
//     }
//     else{
//       return _val;
//     }
//   } else {
//     if (val.length > precision) {
//       return Number(val.substring(0, precision - scale));
//     } else {
//       return _val;
//     }
//   }
// }

export const FieldNumber = (props:any) => {
  const { mode, fieldProps } = props;
  const { field_schema: fieldSchema = {}, onChange } = fieldProps;
  let value = !isNil(fieldProps.value) ? fieldProps.value : props.text;//ProTable那边fieldProps.value没有值，只能用text
  let scale = fieldSchema.scale;
  // let precision = fieldSchema.precision;
  if(mode === "read"){
    return <span>{numberToString(value, scale)}</span>
  }
  else{
    // 加这段formatter是为了编辑状态下也保留指定位数小数，有bug：要删除两次才能把数据清空
    // let newFieldProps = Object.assign({}, fieldProps, {
    //   formatter: (value: any) => {
    //     return format(value, precision, scale);
    //   },
    //   parser: (value: any) => value
    // });
    if(typeof value === 'string'){
      onChange(parseFloat(value))
    }
    return (
      <ProField valueType='digit' {...props} />
    )
  }
};

FieldNumber.convertNumberToString = numberToString;

// 数值类型字段
// value 值为数字
// 编辑和显示时需要处理小数位数
export const number = {
  render: (text: any, props: any) => {
    return (
      <FieldNumber mode='read' {...props} />
    )
  },
  renderFormItem: (_: any, props: any) => {
    // console.log("===props===", props);
    return (
      <FieldNumber mode='edit' {...props} />
    )
  }
}
import React from 'react';
import moment from 'moment';
import { clone, isEmpty } from 'lodash';
import FieldDatePicker from "@ant-design/pro-field/es/components/DatePicker";
import "moment/locale/zh-cn";

const convertDateValue = (value: any) => {
  if (isEmpty(value)) {
    return null;
  }
  // 日期字段设置为utc0点
  let result: any;
  if (moment.isMoment(value)) {
    result = (value as any).utc();
  } else {
    let newValue: any = clone(value);
    if (typeof value === 'number') {
      newValue = new Date(value)
    }
    if (newValue instanceof Date) {
      // 转换成字符串格式 是因为日期不应该减8小时再清空小时、分钟、秒， 否则可能会有误差（保存上一天的值）：例如  2021:07:06  ==>  2021:07:05 . 
      newValue = newValue.getFullYear() + '-' + (newValue.getMonth() + 1) + '-' + newValue.getDate();
    }
    if (typeof newValue === 'string') {
      result = moment.utc(newValue);
    }
  }
  result.utcOffset(0);
  result.hour(0);
  result.minute(0);
  result.second(0);
  result.millisecond(0);
  return result;
}

// 日期类型字段
// value 值为GMT标准时间的0点
export const date = {
  render: (text: any, props: any) => {
    return (
      <FieldDatePicker text={text as string} format="YYYY-MM-DD" {...props} />
    )
  },
  renderFormItem: (text: any, props: any) => {
    const { fieldProps , format = "YYYY-MM-DD"} = props;
    const { onChange: formOnChange, defaultValue } = fieldProps;

    if(defaultValue){
      if(moment.isMoment(defaultValue)){
        fieldProps.defaultValue= defaultValue;
      }else{
        fieldProps.defaultValue= moment(defaultValue, format);
      }
    }
    // 重写onChange()并且修改formOnChange()传入值的原因是： 当(0-8点期间)点击控件里的 ‘今天' 会导致（选择的）2021-07-16 ==> （最终保存为）2021-07-15;
    function onChange(date, dateString: string){
      // formOnChange(dateString)
      const dateValue = convertDateValue(dateString)
      formOnChange(dateValue)
    }
    let newFieldProps = Object.assign({}, {...fieldProps}, {
      onChange
    })
    return (
      <FieldDatePicker text={text as string} format={format} {...props} fieldProps={newFieldProps} />
    )
  }
}
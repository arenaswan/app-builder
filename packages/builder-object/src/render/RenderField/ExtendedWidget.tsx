import React, { useMemo } from 'react';
import { getWidgetName, extraSchemaList } from '../../utils/mapping';
import { useTools } from '../../utils/hooks';
import { transformProps } from '../../utils/createWidget';
import { ObjectField } from "../../components/ObjectField";
import { Field } from '@steedos/builder-form'
import {
  Input,
} from 'antd';
import ProField from "@ant-design/pro-field";
import { isObjType, isListType } from '../../utils/utils';
// import { Input } from 'antd';
// import Map from '../../widgets/antd/map';

const ErrorSchema = schema => {
  return (
    <div>
      <div style={{ color: 'red' }}>schema未匹配到展示组件：</div>
      <div>{JSON.stringify(schema)}</div>
    </div>
  );
};

const ExtendedWidget = ({
  schema,
  onChange,
  value,
  children,
  onItemChange,
  formData,
  getValue,
  readOnly,
  dataPath,
  dataIndex,
}) => {
  const { widgets = {}, mapping } = useTools();

  // TODO1: 需要查一下卡顿的源头
  // if (isObjType(schema)) {
  //   return <Map value={value} onChange={onChange} children={children} />;
  // }
  // if (isListType(schema)) {
  //   return 'haha';
  // }
  // return <Input value={value} onChange={e => onChange(e.target.value)} />;

  // TODO: 计算是哪个widget，需要优化
  // let widgetName = useMemo(() => getWidgetName(schema, mapping), [
  //   JSON.stringify(schema),
  // ]);
  let widgetName = getWidgetName(schema, mapping);
  const customName = schema.widget || schema['ui:widget'];
  if (customName && widgets[customName]) {
    widgetName = customName;
  }
  if (readOnly && !isObjType(schema) && !isListType(schema)) {
    widgetName = 'html';
  }
  if (!widgetName && false) {
    widgetName = 'input';
    return <ErrorSchema schema={schema} />;
  }
  // const Widget = widgets[widgetName];
  const extraSchema = extraSchemaList[widgetName];

  let widgetProps = {
    schema: { ...schema, ...extraSchema },
    fieldSchema: { ...schema, ...extraSchema },
    onChange,
    value,
    children,
    ...schema.props,
  };

  if (schema.type === 'string' && typeof schema.max === 'number') {
    widgetProps.maxLength = schema.max;
  }

  ['title', 'placeholder', 'disabled', 'format'].forEach(key => {
    if (schema[key]) {
      widgetProps[key] = schema[key];
    }
  });

  if (schema.props) {
    widgetProps = { ...widgetProps, ...schema.props };
  }

  // 避免传组件不接受的props，按情况传多余的props
  // const isExternalWidget = defaultWidgetNameList.indexOf(widgetName) === -1; // 是否是外部组件
  widgetProps.addons = {
    onItemChange,
    setValue: onItemChange,
    getValue,
    formData,
    dataPath,
    dataIndex,
  };

  const finalProps = transformProps(widgetProps);
  if(schema.type === 'object' || schema.type === 'section'){
    return <> {children}</>
  }
  return <ObjectField {...finalProps} />;
  // return <ProField mode="edit" {...finalProps} />;
};

const areEqual = (prev, current) => {
  if (prev.schema && prev.schema.$id === '#') {
    return false;
  }
  if (prev.readOnly !== current.readOnly) {
    return false;
  }
  if (
    JSON.stringify(prev.value) === JSON.stringify(current.value) &&
    JSON.stringify(prev.schema) === JSON.stringify(current.schema)
  ) {
    return true;
  }
  return false;
};

export default React.memo(ExtendedWidget, areEqual);

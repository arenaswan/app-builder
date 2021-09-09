import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { observer } from "mobx-react-lite";
import Editor from "rich-markdown-editor";
import { Settings, API } from '@steedos/builder-store';

import "./html.less"

export const HtmlField = observer((props: any) => {
  const { fieldProps = {}, mode, text, fileType, name } = props;
  const { onChange, field_schema } = fieldProps;
  const { readOnly } = field_schema;

  // 每次执行 fieldProps.onChange 时只传更新的值到form中去， 不更新该字段的value（不render）。
  const value = useMemo(() => {
    return fieldProps.value || props.text;
  }, []);
  const onUploadImage = useCallback(
    async (file: File) => {
      const result = await API.client.uploadFileAsync(file);
      // TODO: 接口方案二 有空就继续尝试。
      // const result = await API.client.postS3File(file);
      const url = result['_id'] ? Settings.rootUrl + '/api/files/' + 'images' + '/' + result['_id'] : null;
      return url;
    },
    [name]
  );
  // TODO: ID值应该用recordID + fieldname
  const propsOther = {
    id: 'fieldHtml',
    readOnly: mode === 'read' ? true : readOnly,
    onImageUploadStart: () => {
      // console.log('onImageUploadStart==>')
    },
    uploadImage: onUploadImage,
    onImageUploadStop: (args) => {
      // console.log('onImageUploadStop==>')
    },
    onChange: (valueFun: any) => {
      const value = valueFun();
      // console.log('onChange==>', value)
      onChange(value)
    },
    onFocus: () => {
      // console.log('onFocus==>')
    },
    onBlur: () => {
      // console.log('onBlur==>')
    },
    dictionary:{
      // newLineEmpty: '输入“/”以插入…',
      /* imageCaptionPlaceholde: '撰写一个标题',
      newLineWithSlash: 'newLineWithSlash' */
    }
  };
  const className = props?.className ? `rich-markdown-editor ${props?.className}` : 'rich-markdown-editor';
  return (<Editor value={value} {...props} {...propsOther} className={className}/>)
})

export const html = {
  render: (text: any, props: any) => {
    return (<HtmlField {...props} mode="read" ></HtmlField>)
  },
  renderFormItem: (text: any, props: any) => {
    return (<HtmlField {...props} mode="edit" ></HtmlField>)
  }
}


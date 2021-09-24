import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { observer } from "mobx-react-lite";
import Editor from "rich-markdown-editor";
import { Settings, API } from '@steedos/builder-store';
import Video from '../embeds/Video'
import { VideoCameraOutlined } from "@ant-design/icons"
import "./html.less"
import { dark, light, lightMobile, darkMobile } from "../embeds/theme";

function matcher(Component) {
  return (url: string) => {
    const regexes = Component.ENABLED;
    for (const regex of regexes) {
      const result = url.match(regex);
      if (result) {
        return result;
      }
    }
  };
}

const embeds = [
  {
    title: "Site Video",
    keywords: "steedos site video",
    icon: () => <VideoCameraOutlined style={{margin: '4px', width:'18px', height: '18px'}}/>,
    component: Video,
    matcher: matcher(Video),
  }
]

export const HtmlField = observer((props: any) => {
  const { fieldProps = {}, mode, text, fileType, name } = props;
  const { onChange, field_schema } = fieldProps;
  const { readOnly, defaultValue } = field_schema;

  // 每次执行 fieldProps.onChange 时只传更新的值到form中去， 不更新该字段的value（不render）。
  const value = useMemo(() => {
    return fieldProps.value || props.text;
  }, []);
  const onUploadImage = useCallback(
    async (file: File) => {
      const result = await API.client.postS3File(file);
      const url = result['_id'] ? Settings.rootUrl + '/api/files/' + 'images' + '/' + result['_id'] : null;
      return url;
    },
    [name]
  );
  // TODO: ID值应该用recordID + fieldname
  const propsOther = {
    id: 'fieldHtml',
    readOnly: mode === 'read' ? true : readOnly,
    defaultValue: defaultValue,
    onImageUploadStart: () => {
      // console.log('onImageUploadStart==>')
    },
    uploadImage: onUploadImage,
    onImageUploadStop: (args) => {
      // console.log('onImageUploadStop==>')
    },
    onChange: (valueFun: any) => {
      let value:any = valueFun();
      // console.log('onChange==>', value)
      // fix required: true 失效的bug; 
      if(value === '\\\n'){
        value = ''
      }
      onChange(value)
    },
    onFocus: () => {
      // console.log('onFocus==>')
    },
    onBlur: () => {
      // console.log('onBlur==>')
    },
    dictionary:{
      newLineEmpty: '输入“/”以插入…',
      /* imageCaptionPlaceholde: '撰写一个标题',
      newLineWithSlash: 'newLineWithSlash' */
      h1: "主标题",
      h2: "次标题",
      h3: "小标题",
      checkboxList: "任务列表",
      bulletList: "无序列表",
      orderedList: "有序列表",
      table: "表格",
      quote: "引用",
      codeBlock: "代码块",
      hr: "分割线",
      pageBreak: "分页符",
      image: "图片",
      // imageUploadError: "Sorry, an error occurred uploading the image",
      imageCaptionPlaceholder: "撰写一个标题",
      link: "链接",
      info: "信息",
      infoNotice: "提示信息",
      warning: "警告",
      warningNotice: "警告信息",
      tip: "提示",
      tipNotice: "提示信息",
    }
  };
  const className = props?.className ? `rich-markdown-editor ${props?.className}` : 'rich-markdown-editor';
  return (<Editor theme={light} value={value} {...props} {...propsOther} className={className} embeds={embeds}/>)
})

export const html = {
  render: (text: any, props: any) => {
    return (<HtmlField {...props} mode="read" ></HtmlField>)
  },
  renderFormItem: (text: any, props: any) => {
    return (<HtmlField {...props} mode="edit" ></HtmlField>)
  }
}


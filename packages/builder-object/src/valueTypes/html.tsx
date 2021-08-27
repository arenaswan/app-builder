import React from 'react'
import { observer } from "mobx-react-lite";
import Editor from "rich-markdown-editor";

export const HtmlField = observer((props: any) => {
  const { fieldProps = {} ,mode ,text, fileType} = props;
  const { onChange } = fieldProps;
  // const {id , defaultValue, value, placeholder, readOnly, readOnlyWriteCheckboxes} = props;
  if (mode === 'read') {
    return (<Editor value={text as string} {...props} />)
  }else{
    const propsOther = {

      onChange: (options: any) => {
        console.log('html内置onChange==>',options)
      }
    };
    return (<Editor value={text as string} {...props} {...propsOther}/>)
  }
})

export const html = {
  render: (text: any, props: any) => {
    console.log('html--readonly==>',props.name, props)
    // return (
    //   <Editor value={text as string} {...props} />
    // )
    return (<HtmlField {...props} mode="read" ></HtmlField>)
  },
  renderFormItem: (text: any, props: any) => {
    console.log('html--edit==>',props.name, props)
    // const {id , defaultValue, value, placeholder, readOnly, readOnlyWriteCheckboxes} = props;
    // return (
    //   <Editor text={text as string} {...props} />
    // )
    return (<HtmlField {...props} mode="edit" ></HtmlField>)
  }
}


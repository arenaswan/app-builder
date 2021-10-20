import { ObjectForm, ObjectField, Iframe } from "@steedos-ui/builder-object";
import { FieldSection } from "@steedos-ui/builder-form";
import * as React from "react"
import ReactDOM from "react-dom";
import { API } from '@steedos-ui/builder-store';
import { Link } from "react-router-dom";
import { Modal, TreeSelect, Select, Input, Button } from "antd"
import ProCard from "@ant-design/pro-card"
import queryString from "querystring"
import { useEffect, useState } from "react";
import TestObject from './test.object';
import { Form as ProForm } from 'antd';

export default {
  title: "Object Form",
}

export const SchemaForm = () => {
  const initialValues = {
    boolean__c: true,
    datetime__c: new Date(),
    autonumber__c: '2001-00001',
    percent__c: 0.55,
    name: 'xxx',
    grid: [{
      col1: '111',
      col2: true,
    }, {
      col1: '222',
      col2: true,
    }],
    contracts2:['1','2'],
    contractsNo:['2021-009'],
    populationType: ['1','2'],
    // contracts_reference_to_func: {o:'contract_types',ids:['fcxTeWMEvgdMQnvwZ'],labels:["合同分类1"]},
    // contracts_reference_to_func: 'ebqwa4viwcwMZa7MY',
    object: {
      sub1: 'sub1',
      sub2: true,
    }
  };
  const objectFormProps = {
    objectSchema: TestObject,
    initialValues,
  }
  return (
      <ObjectForm mode='read' layout='horizontal' {...objectFormProps}>
      </ObjectForm>
  )
}

export const SchemaFormError = () => {
  const fields={
    referencetoIsStringSingle: {
      reference_to: 'tasks',
      type: 'lookup',
      label: '记录被删除-单选',
      group: 'referenceto是字符串-记录被删除',
    },
    referencetoIsStringMultiple: {
      reference_to: 'tasks',
      type: 'lookup',
      label: '记录被删除-多选',
      group: 'referenceto是字符串-记录被删除',
      multiple: true
    },
    referencetoIsStringNoObjSingle: {
      reference_to: 'contracts',
      type: 'lookup',
      label: '记录所属对象被删除（无值）-单选',
      group: 'referenceto是字符串-对象被删除',
    },
    referencetoIsStringNoObjMultiple: {
      reference_to: 'contracts',
      type: 'lookup',
      label: '记录所属对象被删除（无值）-多选',
      group: 'referenceto是字符串-对象被删除',
      multiple: true
    },
    referencetoIsStringNoObjSingleHaveValue: {
      reference_to: 'contracts',
      type: 'lookup',
      label: '记录所属对象被删除（有值）-单选',
      group: 'referenceto是字符串-对象被删除',
    },
    referencetoIsStringNoObjMultipleHaveValue: {
      reference_to: 'contracts',
      type: 'lookup',
      label: '记录所属对象被删除（有值）-多选',
      group: 'referenceto是字符串-对象被删除',
      multiple: true
    },
    referencetoIsStringNoPermission: {
      reference_to: 'ppppp__c',
      type: 'lookup',
      label: '记录所属对象没权限查看（无值）-单选',
      group: 'referenceto是字符串-对象没权限查看',
    },
    referencetoIsStringNoPermissionMultiple: {
      reference_to: 'ppppp__c',
      type: 'lookup',
      label: '记录所属对象没权限查看（无值）-多选',
      group: 'referenceto是字符串-对象没权限查看',
      multiple: true
    },
    referencetoIsStringNoPermissionHaveValue: {
      reference_to: 'ppppp__c',
      type: 'lookup',
      label: '记录所属对象没权限查看（有值）-单选',
      group: 'referenceto是字符串-对象没权限查看',
    },
    referencetoIsStringNoPermissionMultipleHaveValue: {
      reference_to: 'ppppp__c',
      type: 'lookup',
      label: '记录所属对象没权限查看（有值）-多选',
      group: 'referenceto是字符串-对象没权限查看',
      multiple: true
    },
    referencetoIsArrayOtherHaveValue: {
      reference_to: ['contacts','accounts','test_object__c','anzhuang__c'],
      type: 'lookup',
      label: '记录所属对象（有值被删除-单选）',
      group: 'referenceto是数组-记录被删除',
    },
    referencetoIsArrayOtherHaveValueMultiple: {
      reference_to: ['contacts','accounts','test_object__c','anzhuang__c'],
      type: 'lookup',
      label: '记录所属对象（有值被删除-多选）',
      group: 'referenceto是数组-记录被删除',
      multiple: true
    },
    referencetoIsArray: {
      reference_to: ['contracts','contacts','accounts','test_object__c'],
      type: 'lookup',
      label: '记录所属对象被删除（无值）',
      group: 'referenceto是数组-对象被删除',
    },
    referencetoIsArrayHaveValue: {
      reference_to: ['contracts','contacts','accounts','test_object__c'],
      type: 'lookup',
      label: '记录所属对象被删除（有值）',
      group: 'referenceto是数组-对象被删除',
    },
    referencetoIsArrayNoPermission: {
      reference_to: ['contacts','accounts','test_object__c','ppppp__c'],
      type: 'lookup',
      label: '记录所属对象没权限（无值-单选）',
      group: 'referenceto是数组-对象没权限查看',
    },
    referencetoIsArrayNoPermissionMultiple: {
      reference_to: ['contacts','accounts','test_object__c','ppppp__c'],
      type: 'lookup',
      label: '记录所属对象没权限（无值-多选）',
      group: 'referenceto是数组-对象没权限查看',
      multiple: true
    },
    referencetoIsArrayNoPermissionHaveValue: {
      reference_to: ['contacts','accounts','test_object__c','ppppp__c'],
      type: 'lookup',
      label: '记录所属对象没权限（有值-单选）',
      group: 'referenceto是数组-对象没权限查看',
    },
    referencetoIsArrayNoPermissionMultipleHaveValue: {
      reference_to: ['contacts','accounts','test_object__c','ppppp__c'],
      type: 'lookup',
      label: '记录所属对象没权限（有值-多选）',
      group: 'referenceto是数组-对象没权限查看',
      multiple: true
    }
  };
  const initialValues = {
    referencetoIsStringSingle: '61551759d92b9816c33fb684',
    referencetoIsStringMultiple: ["yzQitW7dmpLdR8t9J", "61556ab51f7d0c5189229812"],
    referencetoIsStringNoObjSingleHaveValue: '60e1252fc697231347698d4f',
    referencetoIsStringNoObjMultipleHaveValue: ['60e1252fc697231347698d4f','dfasdfdsfaf'],
    referencetoIsStringNoPermissionHaveValue: '6154122bd1e3277053fff3d7',
    referencetoIsStringNoPermissionMultipleHaveValue: ['6154122bd1e3277053fff3d7','dkafjsdkjfssdlfksf'],
    referencetoIsArrayHaveValue: {
      "o" : "contracts",
      "ids" : [
        "61556ab51f7d0c5189229812"
      ]
    },
    referencetoIsArrayOtherHaveValue: {
      "o" : "anzhuang__c",
      "ids" : [
        "61556ab51f7d0c5189229812"
      ]
    },
    referencetoIsArrayOtherHaveValueMultiple: {
      "o" : "anzhuang__c",
      "ids" : [
        "615557c71f7d0c5189229811",
        "61556ab51f7d0c5189229812"
      ]
    },
    referencetoIsArrayNoPermissionHaveValue: {
      "o" : "ppppp__c",
      "ids" : [
        "61556ab51f7d0c5189229812"
      ]
    },
    referencetoIsArrayNoPermissionMultipleHaveValue: {
      "o" : "ppppp__c",
      "ids" : [
        "615557c71f7d0c5189229811",
        "61556ab51f7d0c5189229812"
      ]
    }
  };
  const objectFormProps = {
    objectSchema: {fields},
    initialValues,
  }
  return (
      <ObjectForm mode='read' layout='horizontal' {...objectFormProps}>
      </ObjectForm>
  )
}

export const SchemaFormOnValuesChange = () => {
  const initialValues = {
    name: "张三"
  };
  const fields={
    name: {
      type: 'text',
      label: '姓名'
    },
    email: {
      type: 'email',
      label: '邮箱'
    },
    sign: {
      type: 'textarea',
      label: '个性签名',
      is_wide: true
    }
  };
  const form = {
    onValuesChange: (props)=>{
      console.log("===props===", props);
      if(props.changedValues.name){
        props.form.setFieldsValue(Object.assign({}, props.values, {email:`${props.changedValues.name}@steedos.com`}));
      }
    }
  };
  const objectFormProps = {
    objectSchema: {fields, form},
    initialValues,
  }
  return (
      <ObjectForm mode='read' layout='horizontal' {...objectFormProps}>
      </ObjectForm>
  )
}

export const FormInitialValues = () => {
  const objectApiName = 'announcements';
  // created 是 omit：true字段。 初始化值保存时应该去掉该类字段。
  const initialValues = {
    name: '公告VIP1',
    created: "2021/06/27 08:00:00"
  };
  const objectFormProps = {
    objectApiName,
    initialValues,
  }
  return (
      <ObjectForm mode='read' layout='horizontal' {...objectFormProps}>
      </ObjectForm>
  )
}

export const FormAccounts = () => {
  const objectApiName = 'accounts';
  const initialValues = {
  };
  const objectFormProps = {
    objectApiName,
    initialValues,
  }
  return (
      <ObjectForm mode='read' layout='horizontal' {...objectFormProps}>
      </ObjectForm>
  )
}

export const FormVertical = () => {
  const objectApiName = 'accounts';
  const fields = []
  const recordId = process.env.STEEDOS_CURRENT_RECORD_ID;
  const objectFormProps = {
    objectApiName,
    fields,
    recordId,
    mode: 'read',
    layout: 'vertical'
  }
  const nameFieldSchema = {
    type: 'text',
    name: 'name',
    label: 'Name'
  }
  return (
      <ObjectForm {...objectFormProps}>
        <FieldSection title='Section'>
          <ObjectField objectApiName={objectApiName} fieldName='name' fieldSchema={nameFieldSchema}/>
          {/* <span>111</span> */}
        </FieldSection> 
      </ObjectForm>
  )
}

export const FormOnValuesChange = () => {
  const objectApiName = 'accounts';
  const initialValues = {
  };
  const objectFormProps = {
    objectApiName,
    initialValues,
    onValuesChange: async (props)=>{
      console.log("===props===", props);
      if(props.changedValues.name){
        props.form.setFieldsValue(Object.assign({}, props.values, {email:`${props.changedValues.name}@steedos.com`}));
      }
    }
  }
  return (
      <ObjectForm mode='read' layout='horizontal' {...objectFormProps}>
      </ObjectForm>
  )
}

export const IframeTest = () => {
  return (
      <Iframe src="http://www.baidu.com/" width="100%" height="100%"/>
  )
}
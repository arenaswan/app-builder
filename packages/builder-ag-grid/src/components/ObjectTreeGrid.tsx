import React from "react"
import { find } from 'lodash';
import { observer } from "mobx-react-lite"
import { Objects } from "@steedos/builder-store"
import { Spin } from 'antd';
import { concatFilters } from '@steedos/builder-sdk';
import { getObjectNameFieldKey, getObjectChildrenFieldName } from '@steedos/builder-sdk';

import { ObjectGrid, ObjectGridColumnProps, ObjectGridProps } from "./ObjectGrid";

export type ObjectTreeGridColumnProps = ObjectGridColumnProps & {
} 

export type ObjectTreeGridProps<T extends ObjectTreeGridColumnProps> =
  | ( ObjectGridProps<ObjectGridColumnProps> & {
      treeRootKeys?: [string]//限定tree树的根节点id
      treeRootFilters?: any//限定tree树根节点过滤条件，该属性与treeRootKeys两选一来限定根节点范围，优先取treeRootKeys
    })
  | any

const getColumnFieldsForTreeGrid = (columnFields: any, nameFieldKey: any, childrenFieldName: any)=>{
  let result = [];
  // const nameFieldKey = getObjectNameFieldKey(objectSchema);
  // const childrenFieldName = getObjectChildrenFieldName(objectSchema);
  let hasNameField = false, hasChildrenField = false;
  columnFields.forEach((item)=>{
    let fieldItem = item;
    if(item.fieldName === nameFieldKey){
      hasNameField = true;
      fieldItem = Object.assign({}, item, {
        hideInTable: true,
      });
    }
    else if(item.fieldName === childrenFieldName){
      hasChildrenField = true;
      fieldItem = Object.assign({}, item, {
        hideInTable: true,
        hideInSearch: true
      });
    }
    result.push(fieldItem);
  });
  if(!hasNameField){
    result.push({
      fieldName: 'name',
      hideInTable: true,
      width: 240
    });
  }
  if(!hasChildrenField){
    result.push({
      fieldName: childrenFieldName,
      hideInTable: true,
      hideInSearch: true,
    });
  }
  return result;
}

export const ObjectTreeGrid = observer((props: ObjectTreeGridProps<any>) => {

  const {
    name = 'default',
    objectApiName,
    linkTarget,
    treeRootKeys,
    treeRootFilters,
    objectSchema: defaultObjectSchema,
    ...rest
  } = props;

  let columnFields = props.columnFields || [];

  const object = objectApiName && Objects.getObject(objectApiName);
  if (object && object.isLoading) return (<div><Spin/></div>);

  const objectSchema = defaultObjectSchema ? defaultObjectSchema : object.schema;
 
  const nameFieldKey = getObjectNameFieldKey(objectSchema);
  const idFieldName = objectSchema.idFieldName || "_id";
  const childrenFieldName = getObjectChildrenFieldName(objectSchema);
  columnFields = getColumnFieldsForTreeGrid(columnFields, nameFieldKey, childrenFieldName);

  let parentField = rest.parentField;
  if(!parentField){
    parentField = object.schema.parent_field || "parent";
  }

  const getAutoGroupColumn = ()=>{
    // const { fieldName, ...columnItem } = columnFields[0];
    let nameFieldKey = object.schema.NAME_FIELD_KEY;
    if(object.schema.name === 'organizations'){
      nameFieldKey = "name";
    }
    const field = object.schema.fields[nameFieldKey];
    if(!field){
      return ;
    }
    let nameColumnField = find(columnFields,(item)=>{
      return item.fieldName === nameFieldKey ;
    });
    let fieldWidth = nameColumnField.width;
    fieldWidth = fieldWidth ? fieldWidth : (field.is_wide ? 300 : 150);
    let fieldRender = null;
    if((nameColumnField as any).render){
      fieldRender = (nameColumnField as any).render
    }
    // let fieldWidth = field.width ? field.width : field.is_wide? 300: 150;
    // let fieldSort = find(sort, (item)=>{
    //   return item.field_name === nameFieldKey
    // });
    return {
      field: nameFieldKey,
      headerName: field.label ? field.label:nameFieldKey,
      width: fieldWidth,
      // minWidth: fieldWidth ? fieldWidth : 60,
      resizable: true,
      // filter,
      // sort: fieldSort ? fieldSort.order : undefined,
      // filterParams,
      // rowGroup,
      // flex: 1,
      sortable: true,
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: {
        // fieldSchema: field,
        // valueType: field.type,
        // render: (a, b)=>{
        //   return (<span>aa</span>);
        // },
        fieldSchema: Object.assign({}, { ...field }, { link_target: linkTarget }),
        valueType: field.type,
        render: fieldRender,
        innerRenderer: "AgGridCellRenderer"
        // innerRenderer: (params)=> {
        //   return params.data.name;
        //   // return (<Link to={getObjectRecordUrl(objectApiName, params.data._id)} className="text-blue-600 hover:text-blue-500 hover:underline">{params.data.name}</Link>);
        //   // return fieldRender ? fieldRender(params.data.name, params.data) : params.data.name;
        // }
      },
      // cellEditor: 'AgGridCellEditor',
      // cellEditorParams: {
      //   fieldSchema: field,
      //   valueType: field.type,
      // },
      // editable: (params)=>{
      //   return API.client.field.isEditable(objectApiName, params.colDef.filterParams.fieldSchema, params.data)
      // }
    }
  }

  const filtersTransform = (params: any, originalFilters: any)=>{
    var groupKeys = params.request?.groupKeys;
    let result = originalFilters;
    const isGroup = groupKeys && groupKeys.length;
    if(isGroup){
      result = concatFilters(result, [parentField, "=", groupKeys[groupKeys.length - 1]])
    }
    else{
      // 根目录识别过滤条件逻辑
      if(treeRootKeys && treeRootKeys.length){
        result = ["_id", "=", treeRootKeys];
      }
      else if(treeRootFilters && treeRootFilters.length){
        // 支持单独为根目录配置过滤条件，该过滤条件只影响根目录
        if(result && result.length){
          result = [result, treeRootFilters];
        }
        else{
          result = treeRootFilters;
        }
      }
      else{
        // 传入的filters也影响根目录过滤，未传入时取根节点
        if(!result || !result.length){
          result = [parentField, "=", null];
        }
      }
    }
    return result;
  }

  const dataValueTransform = (params: any, originalDataValue: any) => {
    var groupKeys = params.request?.groupKeys;
    let result = originalDataValue;
    const isGroup = groupKeys && groupKeys.length;
    if (isGroup) {
      // 不用处理，直接返回结果即可，因为filtersTransform函数中子节点已经加了parent值作为过滤条件了
    }
    else {
      // 根节点返回结果可能会有父子关系的记录，都保留的话，子节点展开会发现重复显示了，要去除子节点会重复显示的数据
      result = result.filter((item: any) => {
        let parentFieldValue = item[parentField];
        if (parentFieldValue) {
          // 有parent字段值时，check下该parent指向的记录是否已经在返回结果中，如果是说明子节点会重复应该去除
          return !result.find((item2: any) => {
            return parentFieldValue === item2[idFieldName];
          });
        }
        else {
          return true;
        }
      });
    }
    return result;
  }

  return (
    <ObjectGrid 
      treeData={true}
      animateRows={true}
      isServerSideGroupOpenByDefault={function (params) {
        return params.rowNode.level < 1;
      }}
      isServerSideGroup={function (dataItem) {
        return dataItem[childrenFieldName] && dataItem[childrenFieldName].length;
      }}
      getServerSideGroupKey={function (dataItem) {
        return dataItem._id;
      }}
      autoGroupColumnDef={getAutoGroupColumn()}
      filtersTransform={filtersTransform}
      dataValueTransform={dataValueTransform}
      {...props}
      columnFields={columnFields}
      isInfinite={false}
      showSortNumber={false}
    />
  )
})

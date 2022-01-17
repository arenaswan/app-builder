import React, { useContext, useRef, useEffect, useState } from "react"
import { Alert } from 'antd';
import { isFunction, forEach, isObject, filter, isString, each, includes, isBoolean, isEmpty} from "lodash"
import { ObjectListViewProps, getListviewColumns, getListViewColumnFields, getListViewFilters } from "."
import { ObjectExpandTable } from "."
import { observer } from "mobx-react-lite"
import { Objects, API, Settings } from "@steedos-ui/builder-store"
import { ObjectGrid, ObjectTreeGrid } from '@steedos-ui/builder-ag-grid';
import { translate } from '@steedos-ui/builder-sdk';

export const ObjectTable = observer((props: ObjectListViewProps<any>) => {
  // console.log("===ObjectTable===props==", props);
  let {
    objectApiName,
    listName = "all",
    columnFields,
    filters,
    listSchema,
    sort,
    ...rest
  } = props
  const object = objectApiName && Objects.getObject(objectApiName);
  if (object?.isLoading) return (<div>Loading object ...</div>)
  const schema = rest.objectSchema || object?.schema;
  if(isEmpty(schema) || (schema.permissions && schema.permissions.allowRead !== true)){
    const errorWarning = isEmpty(schema) ? translate('creator_odata_collection_query_fail') : translate('creator_odata_user_access_fail');
    return (<Alert message={errorWarning} type="warning" showIcon style={{padding: '4px 15px'}}/>)
  }
  let listView = listSchema ? listSchema : schema?.list_views[listName];
  if(!columnFields || columnFields.length==0){
    const listViewColumns = listSchema && listSchema.columns ? listSchema.columns : getListviewColumns(schema, listName);
    columnFields = getListViewColumnFields(listViewColumns, props, schema.NAME_FIELD_KEY, '_blank');
  }
  if(!filters || filters.length==0){
    filters = listView && getListViewFilters(listView, props);
  }
  if(!sort || sort.length==0){
    sort = listView && listView.sort;
  }
  let TableComponent = ObjectGrid;
  if(schema.enable_tree){
    TableComponent = ObjectTreeGrid;
  }

  return (
    <ObjectExpandTable
      objectApiName={objectApiName}
      columnFields={columnFields}
      filters={filters}
      sort={sort}
      tableComponent={TableComponent}
      suppressClickEdit={true}
      linkTarget='_blank'
      // className={["object-listview", rest.className].join(" ")}
      {...rest}
    />
  )
})
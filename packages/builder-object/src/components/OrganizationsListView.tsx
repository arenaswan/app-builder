import React from "react"
import { observer } from "mobx-react-lite"
import { omit, isArray } from "lodash"
import { User } from '@steedos-ui/builder-store';
import { formatFiltersToODataQuery } from '@steedos/filters';
import { Alert, Spin } from 'antd';
import { ObjectTreeGrid, ObjectTreeGridProps } from '@steedos-ui/builder-ag-grid';

export type OrganizationsListViewProps = {
} & ObjectTreeGridProps<any>

export const OrganizationsListView = observer(({
  filters: defaultFilters,
  ...rest
}: OrganizationsListViewProps) => {
  console.log("=organizations=222=");

  const userSession = User.getSession();
  let filters: any = ["hidden", "!=", true];
  let errorMessage:any;
  if (User.isLoading){
    console.log("Loading session...")
    return (<div><Spin/></div>);
  }
  else{
    if(!userSession.is_space_admin){
      const orgIds = User.getCompanyOrganizationIds();
      if(orgIds && orgIds.length){
        // 不是管理员时，要限定范围为当前用户所属分部关联组织内
        filters = [filters, [["_id", "=", orgIds], "or", ["parents", "=", orgIds]]];
      }
      else{
        console.error('您的账户未分配到任何分部，无法查看通讯录信息，请联系系统管理员！')
        errorMessage = <Alert message="您的账户没有权限访问此内容，请联络系统管理员。" type="warning" />
      }
    }
  }
  if(defaultFilters && defaultFilters.length){
    if (isArray(defaultFilters)) {
        filters = [defaultFilters, filters]
    }
    else {
        const odataOrgFilters = formatFiltersToODataQuery(filters);
        filters = `(${defaultFilters}) and (${odataOrgFilters})`;
    }
  }
  let props = {
    objectApiName: "organizations",
    parentField: "parent",
    filters
  };
  console.log("=organizations==");
  return (
    ( 
      errorMessage ? errorMessage :
      <ObjectTreeGrid
        {...props}
        {...omit(rest, ['objectApiName'])}
      />
    )
  )
});

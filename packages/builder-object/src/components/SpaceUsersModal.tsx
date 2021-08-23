import React,{ useState, useMemo, useRef, useEffect } from "react"
import { Form,Field } from '@steedos/builder-form';
import { formatFiltersToODataQuery } from '@steedos/filters';
import { SpaceUsers, SpaceUsersProps, ObjectModal, ObjectModalProps, Organizations } from ".."
import { omit, isArray } from "lodash"
import "./SpaceUsersModal.less"
import useAntdMediaQuery from 'use-media-antd-query';

export type SpaceUsersModalProps = {
} & SpaceUsersProps & Omit<ObjectModalProps, 'contentComponent'>

export const SpaceUsersModal = ({
  columnFields,
  filters: defaultFilters,
  ...rest
}: SpaceUsersModalProps) => {
  const [selectedOrgForMobile, setSelectedOrgForMobile] = useState()
  let orgFilters: any;
  if(selectedOrgForMobile && (selectedOrgForMobile as string | []).length){
    orgFilters = ["organizations_parents", "=", selectedOrgForMobile];
  }
  let filters: string | any[];
  if(defaultFilters && defaultFilters.length){
    if (isArray(defaultFilters)) {
        filters = [defaultFilters, orgFilters]
    }
    else {
        const odataOrgFilters = formatFiltersToODataQuery(orgFilters);
        filters = `(${defaultFilters}) and (${odataOrgFilters})`;
    }
  }
  else{
    filters =  orgFilters;
  }

  let props = {
    columnFields
  };
  const colSize = useAntdMediaQuery();
  const isMobile = (colSize === 'sm' || colSize === 'xs');
  let expandProps:any;
  if(!isMobile){
    expandProps={
      expandComponent: Organizations,
      expandReference: "organizations",
      expandNameField: "name",
      expandParentField: "parent",
    }
  }
  if(!props.columnFields){
    props.columnFields = [{
      fieldName: "name",
      sorter: true,
    },{
      fieldName: "email",
    },{
      fieldName: "user",
      hideInSearch: true,
      hideInTable: true,
    },{
      fieldName: "organizations_parents",
      hideInTable: true,
      hideInSearch: false,
      ...expandProps,
    },{
      fieldName: "mobile",
    }]
  }

  let width = isMobile ? '100%' : '80%'; 
  let style={ 
    // TODO: modal高度设置，200px后续要修改成灵活设置的变量值
    height: 'calc(100% - 100px)',
    minHeight: '400px',
    maxHeight: 'calc(100% - 150px)',
    maxWidth: '1000px', 
    minWidth: '800px', 
    overflow: 'hidden'
  }
  let modalPropsStyle = isMobile ? null : style;
  const toolbar = isMobile ? {subTitle: false} : null;

  let searchConfig: any = {
    filterType: 'light',
  };
  let spaceUserSearchBar: any;
  if(isMobile){
    searchConfig = false;
    spaceUserSearchBar = ()=> [(
      <Form
        onValuesChange={(changeValues: any)=>{
          setSelectedOrgForMobile(changeValues.organizations_parents);
        }}
      >
        <Field 
          name="organizations_parents"
          showSearch
          valueType="lookup"
          mode="edit"
          placeholder="请选择所属组织"
          fieldSchema={{
            reference_to: "organizations",
          }}
        />
      </Form>
    )]
  }

  return (
    <ObjectModal
      width={width}
      modalProps={{
        style: {
          ...modalPropsStyle
        }
      }}
      filters={filters}
      toolBarRender={spaceUserSearchBar}
      toolbar={toolbar}
      contentComponent={SpaceUsers}
      {...props}
      {...omit(rest, ['objectApiName', 'contentComponent'])}
    />
  )
}

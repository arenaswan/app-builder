import React, { useState } from "react"
import { forEach, compact, filter, includes, keys, map, isEmpty, isFunction, isObject, uniq, find, sortBy, reverse, clone, isArray, isString } from 'lodash';
import useAntdMediaQuery from 'use-media-antd-query';
import { observer } from "mobx-react-lite"
import { Objects, API } from "@steedos/builder-store"
import { Spin } from 'antd';
import { concatFilters } from '@steedos/builder-sdk';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import { AllModules } from '@ag-grid-enterprise/all-modules';
import { ServerSideStoreType } from '@ag-grid-enterprise/all-modules';
import { getNameFieldColumnRender } from "@steedos/builder-form"
import { AgGridCellEditor } from "./CellEditor";
import { AgGridCellRenderer } from "./CellRender";
import { AgGridCellFilter } from "./CellFilter";
import { AgGridCellDateFilter } from './CellDateFilter';
import { AgGridCellTextFilter } from './CellTextFilter';
import { AgGridCellNumberFilter } from './CellNumberFilter';
import { AgGridCellBooleanFilter } from './CellBooleanFilter';
import { AgGridRowActions } from './RowActions';
import { Modal, Drawer, Button, Space } from 'antd';
import { AG_GRID_LOCALE_ZH_CN } from '../locales/locale.zh-CN'
import { Tables } from '@steedos/builder-store';
import { message } from 'antd';
import { translate } from '@steedos/builder-sdk';

import './ObjectGrid.less'

export type ObjectGridColumnProps = {
  fieldName: string,
  hideInTable: boolean,
  hideInSearch: boolean,
} 

export type ObjectGridProps<T extends ObjectGridColumnProps> =
  | ({
      name?: string
      objectApiName?: string
      columnFields?: T[]
      filters?: [] | string
      sort?: [] | string
      onChange?: ([any]) => void
      linkTarget?: string //单元格如果是链接，配置其链接的target属性值
      autoClearSelectedRows?: boolean//当请求列表数据时自动清除选中项
      // filterableFields?: [string]
    } & {
      defaultClassName?: string
    })
  | any

const FilterTypesMap = {
  'equals': '=',
  'notEqual': '!=',
  'contains': 'contains',
  'notContains': 'notcontains',
  'startsWith': 'startswith',
  'endsWith': '=', //TODO 不支持
  'lessThan': '<',
  'lessThanOrEqual': '<=',
  'greaterThan': '>',
  'greaterThanOrEqual': '>=',
  'empty': 'empty' //TODO 不支持
}

/**
 * 
 * @param filterModel 
 */

const filterModelToOdataFilters = (filterModel)=>{
  // console.log(`filterModelToOdataFilters filterModel`, filterModel);
  const filters = [];
  forEach(filterModel, (value, key)=>{
    if(value.type === 'between'){
      if(value.filterType === "number"){
        filters.push([key, "between", [value.numberFrom, value.numberTo]]);
      }else{
        if(value.filter){
          filters.push([key, value.type, value.filter]);
        }else{
          filters.push([key, "between", [value.dateFrom, value.dateTo]]);
        }
      }
      
    }else{
      if(!isEmpty(value.filter) || ["boolean", "toggle"].indexOf(value.filterType) > -1){
        const filter = [key, FilterTypesMap[value.type], value.filter];
        filters.push(filter);
      }else if(value.operator){
        const filter = [];
        if(value.condition1){
          filter.push([key, FilterTypesMap[value.condition1.type], value.condition1.filter]);
        }
        filter.push(value.operator.toLocaleLowerCase());
        if(value.condition2){
          filter.push([key, FilterTypesMap[value.condition2.type], value.condition2.filter]);
        }
        filters.push(filter);
      }
    }
  })
  // console.log(`filters`, filters)
  return filters;
}

const getField = (objectSchema, fieldName: any)=>{

  let _fieldName = fieldName;
  if(isObject(fieldName)){
    _fieldName = (fieldName as any).field
  }

  return _fieldName.split('.').reduce(function(o, x){
    if(!o){
      return
    }
    if(o.sub_fields){
      return o.sub_fields[x] 
    }
    return o[x]
  }, objectSchema.fields)
}

export const ObjectGrid = observer((props: ObjectGridProps<any>) => {

  const {
    name = 'default',
    objectApiName,
    columnFields = [],
    extraColumnFields = [],
    filters: defaultFilters,
    sort: defaultSort,
    defaultClassName,
    onChange,
    toolbar,
    rowButtons,
    rowSelection = 'multiple',
    sideBar: defaultSideBar,
    pageSize = 50,
    gridRef,
    onModelUpdated,
    onUpdated,
    checkboxSelection = true,
    pagination: defaultPagination = true,
    isInfinite: defaultIsInfinite = true,
    selectedRowKeys,
    rowKey = '_id',
    objectSchema: defaultObjectSchema,
    rows,
    linkTarget,
    autoClearSelectedRows = true,
    ...rest
  } = props;
  // const [gridApi, setGridApi] = useState({});
  let pagination = defaultPagination;
  let isInfinite = defaultIsInfinite;
  // const isInfinite = rowModelType === "infinite";
  let rowModelType = "serverSide"; //serverSide、infinite
  if(rows){
    // 传入rows静态数据时不支持翻页，以后有需求再说
    pagination = false;
    isInfinite = false;
  }
  if(pagination === false){
    // 传入defaultIsInfinite为false表示一次性加载所有数据，不需要按isInfinite来滚动翻页请求数据
    isInfinite = false;
  }
  if(isInfinite){
    rowModelType = "infinite";
    pagination = false;
  }
  const table = Tables.loadById(name, objectApiName,rowKey);
  const [editedMap, setEditedMap] = useState({});
  let sort = defaultSort;
  if(sort && sort.length){
    if(isArray(sort[0])){
      sort = sort.map((item)=>{
        return {field_name: item[0], order: item[1]} ;
      });
    }
  }
  // 将初始值存放到 stroe 中。
  if(selectedRowKeys && selectedRowKeys.length){
    table.addSelectedRowsByKeys(selectedRowKeys, columnFields, rows, defaultFilters)
  }
  // const [drawerVisible, setDrawerVisible] = useState(false);
  // const [modal] = Modal.useModal();
  // const colSize = useAntdMediaQuery();
  // const isMobile = (colSize === 'sm' || colSize === 'xs') && !props.disableMobile;
  let sideBar = defaultSideBar;
  let _pageSize = pageSize;
  if(!pagination && !isInfinite){
    _pageSize = 0;
  }
  if(isEmpty(sideBar) && sideBar !== false ){
    sideBar = {
      toolPanels:[
        {
          id: 'filters',
          labelKey: 'filters',
          labelDefault: 'Filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel',
        }
      ]
    }
  }
  if(rows){
    sideBar = false;
  }
  const object = objectApiName && Objects.getObject(objectApiName);
  if (object && object.isLoading) return (<div><Spin/></div>)

  const objectSchema = defaultObjectSchema ? defaultObjectSchema : object.schema;

  const setSelectedRows = (params, gridApi?)=>{
      // 当前显示页中store中的初始值自动勾选。
      const selectedRowKeys = table.getSelectedRowKeys();
      const currentGridApi = params.api || gridApi;
      if(selectedRowKeys && selectedRowKeys.length){
        currentGridApi.forEachNode(node => {
          if(node.data && node.data[rowKey]){
            if (selectedRowKeys.indexOf(node.data[rowKey])>-1) {
              node.setSelected(true);
            }else{
              node.setSelected(false);
            }
          }
        });
      }
      else{
        currentGridApi.deselectAll();
      }
  }

  const getDataSource = (gridApi?: any) => {
    return {
        getRows: params => {
          // console.log("===getRows=params==", params);
          // console.log("===getRows=isInfinite==", isInfinite);
          const currentGridApi = isInfinite ? gridApi : params.api;
          const sortModel = isInfinite ? params.sortModel : params.request.sortModel;
          const filterModel = isInfinite ? params.filterModel : params.request.filterModel;
          const startRow = isInfinite ? params.startRow : params.request.startRow;
          if(rows){
            const sort = []
            forEach(sortModel, (sortField)=>{
              sort.push([sortField.colId, sortField.sort])
            })
            let sortedRows = clone(rows);
            if(sort.length){
              sortedRows = sortBy(rows, [sort[0][0]]);
              if(sort[0][1] === "desc"){
                sortedRows = reverse(sortedRows)
              }
            }
            if(isInfinite){
              let lastRow = sortedRows.length;
              params.successCallback(sortedRows, lastRow);
            }
            else{
              params.success({
                rowData: sortedRows,
                rowCount: rows.length
              });
            }
            setSelectedRows(params, currentGridApi);
          }
          else{
            let fields = ['name'];
            forEach(columnFields, ({ fieldName, ...columnItem }: ObjectGridColumnProps) => {
              fields.push(fieldName)
            });
            fields = uniq(compact(fields.concat(extraColumnFields).concat(["owner", "company_id", "company_ids", "locked"])));
            const sort = []
            forEach(sortModel, (sortField)=>{
              sort.push([sortField.colId, sortField.sort])
            })
            // const filters = compact([].concat([defaultFilters]).concat(filterModelToOdataFilters(filterModel)));
            const modelFilters:any = filterModelToOdataFilters(filterModel);
            const filters = concatFilters(defaultFilters, modelFilters)
            // TODO 此处需要叠加处理 params.request.fieldModel
            // console.log("===params.request.startRow===", params.request.startRow);
            let options: any = {
              sort,
              $top: pageSize,
              $skip: startRow
            };
            if(!pagination && !isInfinite){
              options = {
                sort
              };
            }
            let isFirstPage = isInfinite ? startRow === 0 : params.api.paginationGetCurrentPage() === 0
            if(autoClearSelectedRows && isFirstPage){
              // 只有在第一页才自动清除选中项，这样翻页时就可以保持之前选中项不被清除
              table.clearSelectedRows();
            }
            API.requestRecords(
              objectApiName,
              filters,
              fields,options).then((data)=>{
                if(isInfinite){
                  let lastRow = data["@odata.count"];
                  params.successCallback(data.value, lastRow);
                }
                else{
                  params.success({
                    rowData: data.value,
                    rowCount: data['@odata.count']
                  });
                }

                if(!modelFilters.length && !data['@odata.count']){
                  currentGridApi.setSideBarVisible(false)
                }else if(sideBar !== false){
                  currentGridApi.setSideBarVisible(true)
                }
                setSelectedRows(params, currentGridApi);
            })
          }
        }
    };
  }

  const getFieldCellFilterComponent = (field: any)=>{
    let filter: any;
    if (["textarea", "text", "code"].includes(field.type)) {
      filter = 'AgGridCellTextFilter'
    }else if(["autonumber"].includes(field.type)){
      filter = 'AgGridCellTextFilter'
    }
    else if (["number", "percent", "currency"].includes(field.type)) {
      filter = 'AgGridCellNumberFilter'
    }
    else if (["date", "datetime"].includes(field.type)) {
      filter = 'AgGridCellDateFilter'
    }
    else if(["boolean", "toggle"].includes(field.type)){
      filter = 'AgGridCellBooleanFilter'
    }
    else if(["formula", "summary"].includes(field.type)){
      return getFieldCellFilterComponent({type: field.data_type});
    }
    else {
      filter = 'AgGridCellFilter'
    }
    return filter;
  }

  const onGridReady = (params) => {
    // setGridApi(params.api);
    if(isInfinite){
      params.api.setDatasource(getDataSource(params.api));
    }
  };

  const getColumns = (rowButtons)=>{
    const width = checkboxSelection ? 80 : 50;
    const columns:any[] = [
      {
        resizable: false,
        pinned: "left",
        valueGetter: params => {
          return parseInt(params.node.id) + 1
        },
        width: width,
        maxWidth: width,
        minWidth: width,
        cellStyle: {"text-align": "right" },
        checkboxSelection: checkboxSelection,
        headerCheckboxSelection: checkboxSelection, //仅rowModelType等于Client-Side时才生效
        suppressMenu: true,
        // 对象name_field字段为不存在时，列表视图上应该显示序号为name链接
        cellRenderer: 'AgGridCellRenderer',
        cellRendererParams: {
          render: !objectSchema?.NAME_FIELD_KEY && getNameFieldColumnRender(objectApiName)
        },
      },
      // {
      //   resizable: false,
      //   pinned: "left",
      //   width: 35,
      //   maxWidth: 35,
      //   minWidth: 35,
      // }
    ];
    forEach(columnFields, ({ fieldName, hideInTable, hideInSearch, ...columnItem }: ObjectGridColumnProps) => {
      const field = getField(objectSchema, fieldName);
      if(!field){
        return ;
      }
      let fieldRender = null;
      if((columnItem as any).render){
        fieldRender = (columnItem as any).render
      }
      let filter:any = true
      let filterParams:any = {}
      let rowGroup = false //["select", "lookup"].includes(field.type)
      if( hideInSearch ){
        filter = false;
      }
      else{
        filter = getFieldCellFilterComponent(field);
        if(["autonumber"].includes(field.type)){
          filterParams = {
            fieldSchema: Object.assign({}, field, {type: 'text'}),
            valueType: "text"
          }
        }
        else{
          filterParams = {
            fieldSchema: field,
            valueType: field.data_type ? field.data_type : field.type,
            objectApiName: objectApiName
          }
        }
      }
      let fieldSort = find(sort, (item)=>{
        return item.field_name === fieldName
      });

      if(fieldSort && !fieldSort.order){
        // 允许不配置order，不配置就按升序排序。
        fieldSort.order = "asc";
      }

      let fieldWidth = (columnItem as any).width ? (columnItem as any).width : (field.is_wide ? 300 : 150);

      columns.push({
        field: fieldName,
        hide: hideInTable,
        headerName: field.label ? field.label:fieldName,
        width: fieldWidth,
        minWidth: fieldWidth ? fieldWidth : 60,
        resizable: true,
        filter,
        sort: fieldSort ? fieldSort.order : undefined,
        filterParams,
        menuTabs: ['filterMenuTab','generalMenuTab','columnsMenuTab'],
        rowGroup,
        flex: 1,
        sortable: true,
        cellRenderer: 'AgGridCellRenderer',
        // cellClassRules: {
        //   "slds-is-edited": (params) => {
        //     const editedMap: any= params.colDef.editedMap
        //     if(editedMap){
        //       return editedMap[params.data._id]?.isEdited
        //     }
        //   }
        // },
        cellRendererParams: {
          fieldSchema: Object.assign({}, { ...field }, { link_target: linkTarget }),
          valueType: field.type,
          render: fieldRender
        },
        cellEditor: 'AgGridCellEditor',
        cellEditorParams: {
          fieldSchema: field,
          valueType: field.type,
        },
        // key: fieldName,
        // dataIndex: fieldName,
        // title: field.label?field.label:fieldName,
        // valueType: field.type,
        editable: (params)=>{
          return API.client.field.isEditable(objectApiName, params.colDef.filterParams.fieldSchema, params.data)
        }
      })
    });

    //处理filters depend_on  
    map(columns, (column)=>{
      if(column.filter === 'AgGridCellFilter' && isArray(column.filterParams.fieldSchema.depend_on)){
        map(filter(columns, (_column)=>{
          return includes(column.filterParams.fieldSchema.depend_on, _column.field)
        }), (__column)=>{
          if(__column.filterParams.fieldSchema && !isArray(__column.filterParams.depended)){
            __column.filterParams.depended = [];
          }
          __column.filterParams.depended.push(column.field)
        })
      }
    })

    if(rowButtons && isArray(rowButtons) && rowButtons.length > 0){
      // 操作按钮
      columns.push({
        width: 50,
        maxWidth: 50,
        minWidth: 50,
        resizable: false,
        pinned: "right",
        cellRenderer: 'rowActions',
        cellEditor: 'rowActions',
        suppressMenu: true,
        cellRendererParams: {
          objectApiName,
          rowButtons: rowButtons
        }
      });
    }
    return columns
  }

  const onCellValueChanged = (params) => {
    // 这里赋值有延迟，转移到 CellEditor
    if(!editedMap[params.data._id]){
      editedMap[params.data._id] = {};
    }
    editedMap[params.data._id][params.colDef.field] = params.value;
    setTimeout(function(){
      // setDrawerVisible(true);
      (document.getElementsByClassName(`grid-action-drawer-${name}`)[0] as any).style.display=''
    }, 300)
    // if(!params.colDef.editedMap){
    //   params.colDef.editedMap = {};
    // }
    // params.colDef.editedMap[params.data._id] = {
    //   isEdited: true
    // }
  };

  const onRowSelected = (params) => {
    const selectedRows = params.api.getSelectedRows();
    // 多选时， 新增一个选项就增加到store中，删除一个就从store中删除。 单选就替换store中的值。
    if(rowSelection === 'multiple'){
      if(params.node){
        if(params.node.selected){
          table.addSelectedRows([params.node.data]);
        }else{
          table.removeSelectedRows([params.node.data]);
        }
      }
    }else{
      table.setSelectedRows(selectedRows);
    }
  }

  const onRowValueChanged = (params)=>{
    // console.log(`onRowValueChanged params`, params)
  }


  const cancel = ()=>{
    // setDrawerVisible(false);
    const editDrawerElement = (document.getElementsByClassName(`grid-action-drawer-${name}`)[0] as any);
    if(editDrawerElement.style.display != 'none'){
      editDrawerElement.style.display='none'
      setEditedMap({})
    }
  }

  const onSortChanged = async (event)=>{
    cancel();
    if(event.api.paginationGetCurrentPage() > 0){
      // 过滤条件变更时，如果不在第一页，需要先切换过去
      // TODO:paginationGoToFirstPage函数会额外发一次请求，应该想办法避免
      event.api.paginationGoToFirstPage();
    }
  }

  const onFilterChanged = async (event)=>{
    cancel();
    if(event.api.paginationGetCurrentPage() > 0){
      // 过滤条件变更时，如果不在第一页，需要先切换过去
      // TODO:paginationGoToFirstPage函数会额外发一次请求，应该想办法避免
      event.api.paginationGoToFirstPage();
    }
  }

  const updateMany = async ()=>{
    // result = await API.updateRecord(objectApiName, recordId, values);
    const ids = keys(editedMap);
    try {
      for await (const id of ids) {
        try {
          await API.updateRecord(objectApiName, id, editedMap[id]);
        } catch (_error) {
          message.error(translate(_error.reason || _error.message));
        }
      }
      if(onUpdated && isFunction(onUpdated)){
        onUpdated(objectApiName, ids);
      }
    } catch (error) {
      message.error(translate(error.reason || error.message));
    }
    try {
      cancel();
    } catch (error) {
      
    }
  }

  // const modelUpdated = (event)=>{
  //   console.log(`modelUpdated event getDisplayedRowCount`, event.api.getDisplayedRowCount())
  // }

  const processCellForClipboard = (event)=>{
    if(isArray(event.value)){
      const fieldSchema = event.column?.colDef?.cellEditorParams?.fieldSchema
      console.log(`fieldSchema`, fieldSchema)
      if(fieldSchema && fieldSchema.multiple){
        event.value = event.value.join(',')
      }
    }
    return event.value;
  }
  const processCellFromClipboard = (event)=>{
    if(isString(event.value) && event.value){
      const fieldSchema = event.column?.colDef?.cellEditorParams?.fieldSchema
      if(fieldSchema && fieldSchema.multiple){
        event.value = event.value.split(',')
      }
    }
    return event.value;
  }

  return (

    <div className="ag-theme-balham" style={{height: "100%", flex: "1 1 auto",overflow:"hidden"}}>
      <AgGridReact
        columnDefs={getColumns(rowButtons)}
        paginationAutoPageSize={false}
        localeText={AG_GRID_LOCALE_ZH_CN}
        rowModelType={rowModelType}
        rowBuffer={0}//该参数默认值为10，ag-grid infinite-scrolling官网示例中该参数为0
        onGridReady={onGridReady}
        pagination={pagination}
        onSortChanged={onSortChanged}
        onFilterChanged={onFilterChanged}
        paginationPageSize={_pageSize}
        suppressCsvExport={true}
        suppressExcelExport={true}
        cacheBlockSize={_pageSize}
        rowSelection={rowSelection}
        suppressRowClickSelection={true}
        // suppressCellSelection={true}
        // rowMultiSelectWithClick={true}
        enableRangeSelection={true}
        suppressCopyRowsToClipboard={true}
        modules={AllModules}
        stopEditingWhenGridLosesFocus={false}
        stopEditingWhenCellsLoseFocus={false}
        serverSideDatasource={isInfinite ? null : getDataSource()}
        onModelUpdated={onModelUpdated}
        serverSideStoreType={ServerSideStoreType.Partial}
        sideBar={sideBar}
        undoRedoCellEditing={true}
        onCellValueChanged={onCellValueChanged}
        onRowValueChanged={onRowValueChanged}
        onRowSelected={onRowSelected}
        context={{editedMap: editedMap}}
        processCellForClipboard={processCellForClipboard}
        processCellFromClipboard={processCellFromClipboard}
        frameworkComponents = {{
          AgGridCellRenderer: AgGridCellRenderer,
          AgGridCellEditor: AgGridCellEditor,
          AgGridCellFilter: AgGridCellFilter,
          AgGridCellDateFilter: AgGridCellDateFilter,
          AgGridCellTextFilter: AgGridCellTextFilter,
          AgGridCellNumberFilter: AgGridCellNumberFilter,
          AgGridCellBooleanFilter: AgGridCellBooleanFilter,
          rowActions: AgGridRowActions,
        }}
        ref={gridRef}
      />
      <Drawer
        placement={"bottom"}
        closable={false}
        visible={true}
        mask={false}
        maskClosable={false}
        style={{height: "60px", display: "none"}}
        bodyStyle={{padding: "12px", textAlign: "center"}}
        className={`grid-action-drawer-${name}`}
      >
        <Space>
          <Button onClick={cancel}>取消</Button>
          <Button onClick={updateMany} type="primary" >确定</Button>
        </Space>
      </Drawer>
    </div>
  )
})

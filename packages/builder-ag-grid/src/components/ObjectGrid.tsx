import React, { useState, useEffect } from "react"
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
      rows?: any[]//静态数据配合objectSchema使用
      objectSchema?: any//不传入objectApiName时，使用静态objectSchema
      rowKey?: string//选中项的key，即字段名
      selectedRowKeys?: [string]//选中项值集合
      isInfinite?: boolean//是否使用滚动翻页模式，即rowModelType是否为infinite
      autoFixHeight?: boolean//当isInfinite且记录总数量大于pageSize时，自动把Grid高度设置为pageSize行的总高度，即rowHeight*pageSize
      autoHideForEmptyData: boolean//当数据为空时自动隐藏整个Grid记录详细界面子表需要该属性
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

const DEFAULT_ROW_HEIGHT = 28;
const DEFAULT_HEADER_HEIGHT = 33;
const DEFAULT_GRID_HEIGHT = "100%";

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
    suppressClickEdit = false,
    gridRef,
    onModelUpdated,
    onUpdated,
    checkboxSelection = true,
    pagination: defaultPagination = true,
    isInfinite: defaultIsInfinite = true,
    rowHeight,
    headerHeight,
    selectedRowKeys,
    rowKey = '_id',
    objectSchema: defaultObjectSchema,
    rows,
    linkTarget,
    autoClearSelectedRows = true,
    autoFixHeight = false,
    autoHideForEmptyData = false,
    ...rest
  } = props;
  const [objectGridApi, setObjectGridApi] = useState({} as any);
  const [isGridReady, setIsGridReady] = useState(false);
  const [gridHeight, setGridHeight] = useState(DEFAULT_GRID_HEIGHT as string | number);
  const [isDataEmpty, setIsDataEmpty] = useState(false);
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

  let getDataSource: Function;
  useEffect(() => {
    if(isGridReady && isInfinite){
      objectGridApi.setDatasource(getDataSource(objectGridApi));
    }
  }, [defaultFilters, isGridReady]);
  const table = Tables.loadById(name, objectApiName,rowKey);
  // 将初始值存放到 store 中。
  useEffect(() => {
    // 只需要触发一次selectedRowKeys即可
    // 用!isGridReady判断可以避免每次过滤条件变更后重新触发addSelectedRowsByKeys，进而带来多余的network请求
    if(!isGridReady && selectedRowKeys && selectedRowKeys.length){
      table.addSelectedRowsByKeys(selectedRowKeys, columnFields, rows, defaultFilters);
    }
  }, [selectedRowKeys, defaultFilters, isGridReady]);

  const [editedMap, setEditedMap] = useState({});
  let sort = defaultSort;
  if(sort && sort.length){
    if(isArray(sort[0])){
      sort = sort.map((item)=>{
        return {field_name: item[0], order: item[1]} ;
      });
    }
  }
  // const [drawerVisible, setDrawerVisible] = useState(false);
  // const [modal] = Modal.useModal();
  const colSize = useAntdMediaQuery();
  const isMobile = (colSize === 'sm' || colSize === 'xs') && !props.disableMobile;
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

  getDataSource = (gridApi?: any) => {
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
                const dataLength = data["@odata.count"];
                if(isInfinite){
                  if(autoFixHeight && pageSize && pageSize < dataLength){
                    // const rowItemHeight = currentGridApi.getRowNode().rowHeight;
                    setGridHeight(pageSize * (rowHeight || DEFAULT_ROW_HEIGHT) + (headerHeight || DEFAULT_HEADER_HEIGHT));
                  }
                  else{
                    // 这里故意不再重置为DEFAULT_GRID_HEIGHT，因为会重新渲染整个grid，比如正在过滤数据，会把打开的右侧过滤器自动隐藏了体验不好
                    // setGridHeight(DEFAULT_GRID_HEIGHT);
                  }
                  params.successCallback(data.value, dataLength);
                }
                else{
                  params.success({
                    rowData: data.value,
                    rowCount: dataLength
                  });
                }

                if(!modelFilters.length && !dataLength){
                  currentGridApi.setSideBarVisible(false)
                  setIsDataEmpty(true);
                }else {
                  if(sideBar !== false){
                    currentGridApi.setSideBarVisible(true)
                  }
                  setIsDataEmpty(false);
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
    if(isInfinite){
      // 如果在非isInfinite模式下执行下面两个state变更，会造成多次执行serverSideDatasource语句进而产生多余的network请求
      setObjectGridApi(params.api);
      setIsGridReady(true);
    }
  };

  const getColumns = (rowButtons)=>{
    const showSortNumber = !isMobile;
    let width = checkboxSelection ? 80 : 50;
    if(!showSortNumber){
      width -= 38;
    }
    let showSortColumnAsLink = false;
    if(showSortNumber && objectSchema?.NAME_FIELD_KEY){
      if(!find(columnFields,['fieldName',objectSchema.NAME_FIELD_KEY]) && !rows){
        showSortColumnAsLink = true;
      }
    }
    const columns:any[] = [
      {
        resizable: false,
        pinned: "left",
        valueGetter: params => {
          return showSortNumber ? parseInt(params.node.id) + 1 : null;
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
          // rows静态数据传入不应该显示为链接
          render: showSortColumnAsLink && getNameFieldColumnRender(objectApiName, props.linkTarget)
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
      let columnWidth = (columnItem as any).width;
      if(!columnWidth && field.is_wide){
        columnWidth = 300;
      }
      let columnFlex;
      if(!columnWidth){
        columnFlex = 1;
      }
      // console.log("===field.is_wide===", field.is_wide, fieldName);
      // console.log("===fieldWidth===", columnWidth, fieldName);
      // console.log("===columnFlex===", columnFlex, fieldName);

      let columnWrap = (columnItem as any).wrap;
      let wrapText = false;
      let autoHeight = false;
      // isInfinite为true时wrap功能有bug，见：https://github.com/ag-grid/ag-grid/issues/3909，暂时只支持isInfinite为false情况
      if(columnWrap && !isInfinite){
        wrapText = true;
        autoHeight = true;
      }

      columns.push({
        field: fieldName,
        hide: hideInTable,
        wrapText,
        autoHeight,
        headerName: field.label ? field.label:fieldName,
        width: columnWidth,
        minWidth: columnWidth ? columnWidth : 60,
        resizable: true,
        filter,
        sort: fieldSort ? fieldSort.order : undefined,
        filterParams,
        menuTabs: ['filterMenuTab','generalMenuTab','columnsMenuTab'],
        rowGroup,
        flex: columnFlex,
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

    <div className={`ag-theme-balham ${autoHideForEmptyData && isDataEmpty ? 'hidden' : ''}`}  style={{height: gridHeight, flex: "1 1 auto",overflow:"hidden"}}>
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
        rowHeight={rowHeight}
        headerHeight={headerHeight}
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
        suppressClickEdit={suppressClickEdit}
        suppressClipboardPaste={suppressClickEdit}
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

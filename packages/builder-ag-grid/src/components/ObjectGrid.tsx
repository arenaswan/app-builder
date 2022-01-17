import React, { useState, useEffect } from "react"
import { forEach, compact, filter, includes, keys, map, isEmpty, isFunction, isObject, uniq, find, sortBy, reverse, clone, isArray, isString, isBoolean } from 'lodash';
import useAntdMediaQuery from 'use-media-antd-query';
import { observer } from "mobx-react-lite"
import { Objects, API } from "@steedos-ui/builder-store"
import { Spin, Alert } from 'antd';
import { concatFilters } from '@steedos-ui/builder-sdk';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import { AllModules } from '@ag-grid-enterprise/all-modules';
import { ServerSideStoreType } from '@ag-grid-enterprise/all-modules';
import { getNameFieldColumnRender } from "@steedos-ui/builder-form"
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
import { Tables } from '@steedos-ui/builder-store';
import { message } from 'antd';
import { translate } from '@steedos-ui/builder-sdk';
import { getObjectNameFieldKey } from '@steedos-ui/builder-sdk';
import { getObjectBaseFieldNames } from '@steedos-ui/builder-sdk';

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
      filtersTransform: Function//DataSource的getRows最终过滤条件转换器
      dataValueTransform: Function//DataSource的getRows最终返回数据转换器，可以变更记录字段值或过滤掉部分记录
      showSortNumber: boolean//显示第一列勾选框中的序号数值
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

const getFieldMinWidth = (field: any)=>{
  const fieldType = field.type;
  let result = 80;
  if(["text", "textarea", "select", "lookup", "master_detail", "autonumber", "url", "email", "image", "file"].indexOf(fieldType) > -1){
    result = 110
  }
  else if(["date"].indexOf(fieldType) > -1){
    result = 110
  }
  else if(["datetime"].indexOf(fieldType) > -1){
    result = 150
  }
  else if(["html"].indexOf(fieldType) > -1){
    result = 220
  }
  else if(["formula", "summary", "number", "percent"].indexOf(fieldType) > -1){
    result = 80
  }
  if(field.is_wide){
    result = 220;
  }
  return result;
}

const getCellValueForClipboard = (event: any)=>{
  let value = event.value;
  if(isArray(value)){
    const fieldSchema = event.column?.colDef?.cellEditorParams?.fieldSchema
    console.log(`fieldSchema`, fieldSchema)
    if(fieldSchema && fieldSchema.multiple){
      value = value.join(',');
    }
  }
  return value;
}

const getCellValueFromClipboard = (event: any, forceFieldType?: string)=>{
  let value = event.value;
  if(isString(value) && value){
    const fieldSchema = event.column?.colDef?.cellEditorParams?.fieldSchema;
    const fileType = forceFieldType || fieldSchema.type;
    if(fieldSchema && fieldSchema.multiple){
      value = value.split(',');
    }
    if(["number", "currency", "percent"].indexOf(fileType) > -1){
      if(fieldSchema && fieldSchema.multiple){
        if(value instanceof Array && value.length){
          value = value.map((item)=>{
            return Number(item)
          });
        }
      }
      else{
        value = Number(value);
      }
    }
    else if(["boolean", "toggle"].indexOf(fileType) > -1){
      value = value === "true";
    }
    else if(["select"].indexOf(fileType) > -1){
      // select字段类型可能配置了data_type，如果配置了则以其配置的为准
      value = getCellValueFromClipboard(event, fieldSchema.data_type || "text");
    }
    else if(["formula", "summary"].indexOf(fileType) > -1){
      // 公式和汇总字段是只读的，不需要处理
      // value = getCellValueFromClipboard(event, fieldSchema.data_type);
    }
  }
  return value;
}

const getSortModel = (objectSchema: any, sortModel: any)=>{
  return sortModel.map((model: any)=>{
    if(model.colId === "ag-Grid-AutoColumn"){
      // tree模式下无法把group的field名称识别为colId，需要转换下
      return Object.assign({}, model, {
        colId: getObjectNameFieldKey(objectSchema)
      });
    }
    else{
      return model;
    }
  });
}

const getGridColumnFieldType = (fieldSchema: any)=>{
  if(["formula", "summary"].indexOf(fieldSchema.type) > -1){
    // 只有公式和汇总字段类型需要按data_type显示，其他比如select中的data_type只是保存数据类型，显示控制类型不需要换
    return fieldSchema.data_type ? fieldSchema.data_type : fieldSchema.type
  }
  else{
    return fieldSchema.type;
  }
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
    filtersTransform, 
    dataValueTransform,
    showSortNumber: defaultShowSortNumber,
    ...rest
  } = props;
  const [objectGridApi, setObjectGridApi] = useState({} as any);
  const [isGridReady, setIsGridReady] = useState(false);
  const [gridHeight, setGridHeight] = useState(DEFAULT_GRID_HEIGHT as string | number);
  const [isDataEmpty, setIsDataEmpty] = useState(false);
  let widthOfAllColumnsForFitSize = 0;
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

  const [editedMap, setEditedMap] = useState({});

  let getDataSource: Function;
  useEffect(() => {
    if(isGridReady && isInfinite){
      objectGridApi.setDatasource(getDataSource(objectGridApi));
    }
  }, [defaultFilters, isGridReady, editedMap]);
  const table = Tables.loadById(name, objectApiName,rowKey);
  // 将初始值存放到 store 中。
  useEffect(() => {
    // 只需要触发一次selectedRowKeys即可
    // 用!isGridReady判断可以避免每次过滤条件变更后重新触发addSelectedRowsByKeys，进而带来多余的network请求
    if(!isGridReady && selectedRowKeys && selectedRowKeys.length){
      table.addSelectedRowsByKeys(selectedRowKeys, columnFields, rows, defaultFilters);
    }
  }, [selectedRowKeys, defaultFilters, isGridReady]);

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
  if(isEmpty(objectSchema) || (objectSchema.permissions && objectSchema.permissions.allowRead !== true) ){
    const errorWarning = isEmpty(objectSchema) ? translate('creator_odata_collection_query_fail') : translate('creator_odata_user_access_fail');
    return (<Alert message={errorWarning} type="warning" showIcon style={{padding: '4px 15px'}}/>)
  }
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
          let sortModel = isInfinite ? params.sortModel : params.request.sortModel;
          sortModel = getSortModel(objectSchema, sortModel);
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
            let nameFieldKey = objectSchema.NAME_FIELD_KEY;
            let fields = [nameFieldKey];
            forEach(columnFields, ({ fieldName, ...columnItem }: ObjectGridColumnProps) => {
              fields.push(fieldName)
            });
            if(objectApiName === "cms_files"){
              // 附件列表需要这个字段判断权限
              extraColumnFields.push("parent")
            }
            const baseExtraFields = getObjectBaseFieldNames(objectSchema);
            fields = uniq(compact(fields.concat(extraColumnFields).concat(baseExtraFields)));
            // 当查询的某个字段有depend_on属性时，接口返回的数据字段要包含depend_on的值。 
            let dependOnFields = [];
            forEach(fields,(val)=>{
              const dependOnValues = objectSchema && objectSchema.fields && objectSchema.fields[val] && objectSchema.fields[val].depend_on;
              if(dependOnValues && dependOnValues.length){
                dependOnFields = dependOnFields.concat(dependOnValues)
              }
            })
            if(dependOnFields.length){
              fields = uniq(compact(fields.concat(dependOnFields)));
            }
            const sort = []
            forEach(sortModel, (sortField)=>{
              sort.push([sortField.colId, sortField.sort])
            })
            // const filters = compact([].concat([defaultFilters]).concat(filterModelToOdataFilters(filterModel)));
            const modelFilters:any = filterModelToOdataFilters(filterModel);
            let filters = concatFilters(defaultFilters, modelFilters)
            // TODO 此处需要叠加处理 params.request.fieldModel
            // console.log("===params.request.startRow===", params.request.startRow);
            if(isFunction(filtersTransform)){
              filters = filtersTransform(params, filters);
            }
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
                let dataLength = data["@odata.count"];
                let dataValue = data.value;
                if(isFunction(dataValueTransform)){
                  dataValue = dataValueTransform(params, dataValue);
                  dataLength -= data.value.length - dataValue.length;
                }
                if(isInfinite){
                  if(autoFixHeight && pageSize && pageSize < dataLength){
                    // const rowItemHeight = currentGridApi.getRowNode().rowHeight;
                    setGridHeight(pageSize * (rowHeight || DEFAULT_ROW_HEIGHT) + (headerHeight || DEFAULT_HEADER_HEIGHT));
                  }
                  else{
                    // 这里故意不再重置为DEFAULT_GRID_HEIGHT，因为会重新渲染整个grid，比如正在过滤数据，会把打开的右侧过滤器自动隐藏了体验不好
                    // setGridHeight(DEFAULT_GRID_HEIGHT);
                  }
                  params.successCallback(dataValue, dataLength);
                }
                else{
                  params.success({
                    rowData: dataValue,
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

  const onGridSizeChanged = (params)=>{
    // console.log("===onGridSizeChanged=1==", params.api.getHorizontalPixelRange());
    // console.log("===onGridSizeChanged=2==", document.getElementsByClassName("ag-theme-balham")[0].clientWidth);
    // 自动调整各个列宽使其满屏显示，当出现水平滚动条即widthOfAllColumnsForFitSize < gridWidth时，不执行sizeColumnsToFit自动调整宽度
    const {left: scrollLeft, right: scrollRight} = params.api.getHorizontalPixelRange();
    const gridWidth = scrollRight - scrollLeft;
    // console.log("===onGridSizeChanged=3==", widthOfAllColumnsForFitSize, gridWidth, widthOfAllColumnsForFitSize < gridWidth);
    if(widthOfAllColumnsForFitSize > 0  && widthOfAllColumnsForFitSize < gridWidth){
      params.api.sizeColumnsToFit();
    }
  }

  const getColumns = (rowButtons)=>{
    let showSortNumber = defaultShowSortNumber;
    if(!isBoolean(showSortNumber)){
      showSortNumber = !isMobile;
    }
    let width = checkboxSelection ? 80 : 50;
    if(!showSortNumber){
      width -= 38;
    }
    let showSortColumnAsLink = false;
    if(showSortNumber){
      if(rows){
        showSortColumnAsLink = false;
      }
      else if(!objectSchema?.NAME_FIELD_KEY){
        showSortColumnAsLink = true;
      }
      else if(!find(columnFields,['fieldName',objectSchema.NAME_FIELD_KEY])){
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
            valueType: getGridColumnFieldType(field),
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
        columnWidth = 220;
      }
      let columnFlex:any;
      if(!columnWidth){
        columnFlex = 1;
        if(field.is_wide){
          columnFlex = 2;
        }
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

      const minWidth = getFieldMinWidth(field);

      columns.push({
        field: fieldName,
        hide: hideInTable,
        wrapText,
        autoHeight,
        headerName: field.label ? field.label:fieldName,
        width: columnWidth,
        minWidth,
        // minWidth: columnWidth ? columnWidth : 60,
        resizable: true,
        filter,
        sort: fieldSort ? fieldSort.order : undefined,
        filterParams,
        menuTabs: ['filterMenuTab'],
        // menuTabs: ['filterMenuTab','generalMenuTab','columnsMenuTab'],
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
          objectApiName: objectApiName,
          render: fieldRender
        },
        cellEditor: 'AgGridCellEditor',
        cellEditorParams: {
          fieldSchema: field,
          valueType: field.type,
          objectApiName: objectApiName
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
    
    //处理列宽自动适应
    widthOfAllColumnsForFitSize = 0;
    let hasNoSetWidthColumns = false;
    forEach(columns, (column)=>{
      if (column.field && !column.hide) {
        if(column.width){
          widthOfAllColumnsForFitSize += parseInt(column.width);
        }
        else{
          hasNoSetWidthColumns = true;
        }
      }
    });
    if(hasNoSetWidthColumns){
      // 不是每个列都设置了宽度的话，就不执行自动宽度逻辑，只有每个列都设置了宽度才按近似百分比的方式显示各个列宽度
      widthOfAllColumnsForFitSize = 0;
    }

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

  const onCellEditingStopped = (params) => {
    // console.log("====onCellEditingStopped===params===", params, name, editedMap);
    setTimeout(function(){
      if(!isEmpty(editedMap) && !isEmpty(editedMap[params.data._id])){
        (document.getElementsByClassName(`grid-action-drawer-${name}`)[0] as any).style.display=''
      }
    }, 300)
  }

  const onCellValueChanged = (params) => {
    // console.log("====onCellValueChanged===params===", params, name);
    // 这里赋值有延迟，转移到 CellEditor
    if(!editedMap[params.data._id]){
      editedMap[params.data._id] = {};
    }
    let value:any = params.value === undefined ? null : params.value;
    editedMap[params.data._id][params.colDef.field] = value;
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
    event.value = getCellValueForClipboard(event);
    return event.value;
  }

  const processCellFromClipboard = (event)=>{
    event.value = getCellValueFromClipboard(event);
    // 列表中复制内容粘贴在单元格时底部弹出 “取消/保存” 确认框
    (document.getElementsByClassName(`grid-action-drawer-${name}`)[0] as any).style.display='' ;
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
        onGridSizeChanged={onGridSizeChanged}
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
        onCellEditingStopped={onCellEditingStopped}
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
          // agGroupCellInnerRenderer: AgGridCellRenderer,
          rowActions: AgGridRowActions,
        }}
        ref={gridRef}
        {...rest}
      />
      <Drawer
        placement={"bottom"}
        closable={false}
        visible={true}
        mask={false}
        maskClosable={false}
        style={{height: "48px", display: "none"}}
        bodyStyle={{padding: "8px", textAlign: "center", background: "rgb(243, 242, 242)"}}
        className={`grid-action-drawer-${name}`}
      >
        <Space>
          <Button onClick={cancel}>取消</Button>
          <Button onClick={updateMany} type="primary" >保存</Button>
        </Space>
      </Drawer>
    </div>
  )
})

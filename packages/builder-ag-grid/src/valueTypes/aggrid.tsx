import { forEach, isArray, remove, sortBy, map } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import ProField from "@ant-design/pro-field";
import Dropdown from '@salesforce/design-system-react/components/menu-dropdown'; 
import Button from '@salesforce/design-system-react/components/button'; 
import Popover from '@salesforce/design-system-react/components/popover'; 
import { ComponentRegistry } from "@steedos-ui/builder-store";
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import {AllCommunityModules} from '@ag-grid-community/all-modules';

import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import './aggrid.less';
import { AgGridCellRenderer } from '../components/CellRender';
import { AgGridCellEditor } from '../components/CellEditor';

// 表格类型字段，
// value格式：{ gridField: [{subField1: 666, subField2: 'yyy'}] }
// 编辑时调用 editable protable，要求行可拖拉调整顺序
// 显示时调用只读 protable
// props.fields [] 列数组
export const ObjectFieldGrid = (props) => {
  const {mode='read', text =[], fieldProps={}, form} = props;
  const { field_schema: fieldSchema = {}, depend_field_values: dependFieldValues={}, value:initialValue, onChange } = fieldProps;
  forEach(initialValue, (row)=>{
    if (!row._id)
      row._id=uuidv4()
  })
  const defaultValue = initialValue && isArray(initialValue)? initialValue : [];
  const [gridApi, setGridApi] = useState<any>(null)

  const addRow = () => {
    const newRow = {
      _id: uuidv4(),
    }
    const newValue = defaultValue.concat(newRow)
    gridApi.setRowData(newValue);
    onChange(newValue)
  }

  const deleteRow = (props) => {
    const selectedId = props.data?._id
    const rows = map(props.api.rowModel.rowsToDisplay, 'data');
    const newValue = rows.filter(function (dataItem) {
      return dataItem._id != selectedId
    });
    props.api.setRowData(newValue);
    onChange(newValue)
  }

  const RowActions = (props: any) => {
    return (
      <Dropdown
        assistiveText={{ icon: 'Options' }}
        iconCategory="utility"
        iconName="down"
        iconVariant="border-filled"
        iconSize='x-small'
        width='x-small'
        menuPosition="overflowBoundaryElement"
        onSelect={(option) => {
          if (option.value === 'delete') {
            deleteRow(props)
          }
        }}
        options={[
          { label: '删除', value: 'delete' }
        ]}
      />
    )
  }

  const onCellClicked = ($event) => {
    if (mode == 'read')
      return;
    $event.api.startEditingCell({
      rowIndex: $event.rowIndex,
      colKey: $event.column.colId
    });
  };

  const onRowDragEnd = (e) => {
    var rowData = [];
    e.api.forEachNode(function (node) {
      rowData.push(node.data);
    });
    onChange(rowData)
  };

  const getRowNodeId = function (data) {
    return data._id;
  };
  const getColumns = ()=>{

    let {sub_fields={} , readonly } = fieldSchema;

    const columns:any[] = [{
      rowDrag: mode == 'edit',
      hide: !(mode == 'edit'),
      resizable: false,
      pinned: "left",
      width: 35,
      maxWidth: 35,
      minWidth: 35,
    }];
    // 把 fieldName（字段名） 存到该对象（字段）值中去。
    forEach(sub_fields,(field, fieldName) => {
      sub_fields[fieldName]._key = fieldName;
    });
    // sortBy(sub_fields, "sort_no") 根据sort_no对列字段进行排序。（字段属性sort_no值越小当前列越靠近左边）
    forEach(sortBy(sub_fields, "sort_no"), (field)=>{
      columns.push({
        field: field._key,
        headerName: field.label ? field.label : field._key,
        width: field.is_wide? 300: 150,
        minWidth: field.is_wide? 300: 150,
        resizable: true,
        filter: true,
        cellRenderer: 'AgGridCellRenderer',
        cellRendererParams: {
          fieldSchema: field,
          valueType: field.type,
          form: form,
          mode
        },
        cellEditor: 'AgGridCellEditor',
        cellEditorParams: {
          fieldSchema: field,
          valueType: field.type,
          form: form,
          mode,
        },
        // key: fieldName,
        // dataIndex: fieldName,
        // title: field.label?field.label:fieldName,
        // valueType: field.type,
        editable: readonly ? false : !field.readonly,
      })
    });
    // 操作按钮
    columns.push({
      hide: !(mode == 'edit'),
      width: 50,
      pinned: "right",
      maxWidth: 50,
      minWidth: 50,
      resizable: false,
      cellRenderer: 'rowActions',
      cellEditor: 'rowActions',
    });
    return columns
  }
  return (
    <div className="ag-theme-balham steedos-grid">
      <AgGridReact
        modules={AllCommunityModules}
        immutableData={true}
        getRowNodeId={getRowNodeId}
        rowDragManaged={true}
        animateRows={true}
        rowData={defaultValue}
        columnDefs={getColumns()}
        suppressMovableColumns={mode === 'read' ? true : false}
        onRowDragEnd={onRowDragEnd.bind(this)}
        onCellClicked={onCellClicked}
        onCellValueChanged={onRowDragEnd.bind(this)}
        context={{}}
        onGridReady={(params) => {
          setGridApi(params.api);
          params.api.sizeColumnsToFit();
        }}
        suppressNoRowsOverlay={true}
        stopEditingWhenGridLosesFocus={false}
        stopEditingWhenCellsLoseFocus={false}
        frameworkComponents = {{
          AgGridCellRenderer: AgGridCellRenderer,
          AgGridCellEditor: AgGridCellEditor,
          rowActions: RowActions,
        }}
      />
      { mode == 'edit' && (
        <Button
          iconCategory="utility"
          iconName="add"
          iconPosition="left"
          label="新建"
          variant="base"
          onClick={()=>addRow()}
        />
      )}
    </div>
  )
}

export const grid = {
  render: (text: any, props: any) => {
    return (
        <ObjectFieldGrid {...props} mode='read'/>
    )
  },
  renderFormItem: (_: any, props: any) => {
    return (
        <ObjectFieldGrid {...props} mode='edit'/>
    )
  }
}
ComponentRegistry.valueTypes['grid'] = grid;
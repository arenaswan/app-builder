import React, { useState } from "react"
import _ from "lodash"
import { Checkbox, Button, Space } from 'antd';
import './CellMultipleUpdatePanel.less';

export const getIsMultipleUpdatable = (selectedRows: any, currentRowId: string)=>{
  const currentSelectedRow = selectedRows.find((row: any)=>{
    return row.data._id === currentRowId;
  });
  // 当前正在编辑的列所属行勾选上了，并且至少勾选了2行才显示批量更新按钮。
  return currentSelectedRow && selectedRows.length > 1;
}

export const CellMultipleUpdatePanel = (props: any) => {
  const { 
    cellProps,
    value,
    setValue,
    context
  } = props;
  const editedMap: any= context?.editedMap;
  const [multipleUpdateEnable, setMultipleUpdateEnable] = useState(false);
  const selectedRows = cellProps.api.getSelectedNodes();
  const colField = cellProps.colDef.field;
  const rowId = cellProps.data._id;

  // 当前正在编辑的列所属行勾选上了，并且至少勾选了2行才显示批量更新按钮。
  const isMultipleUpdatable = getIsMultipleUpdatable(selectedRows, rowId);
  
  function onMultipleUpdateEnableChange(e) {
    // console.log("===onMultipleUpdateChange===");
    setMultipleUpdateEnable(e.target.checked);
  }
  const doUpdate = ()=>{
    // console.log("===doUpdate==isMultipleUpdatable====", isMultipleUpdatable);
    if(!isMultipleUpdatable || !multipleUpdateEnable){
      return;
    }
    // console.log("===doUpdate==selectedRows.length====", selectedRows.length);
    selectedRows.forEach((row: any)=>{
      const tempRowId = row.data._id;
      if(!editedMap[tempRowId]){
        editedMap[tempRowId] = {};
      }
      editedMap[tempRowId][colField] = value;
      if(rowId !== tempRowId){
        // row.setData只是为了把其他勾选记录的值在界面上立刻显示为修改后的值，不影响保存结果
        // tempRowId如果是当前单元格字段则不需要setData，而且如果执行setData会造成不触发ObjectGrid组件的onCellValueChanged事件，也不会弹出底部保存数据按钮
        row.setData(Object.assign({},row.data, {[colField]:value}));
      }
    });
    // cellProps.api.setValue(value);
    // setTimeout(() => cellProps.api.stopEditing(false), 300);
    // console.log("===doUpdate==value====", value);
    // console.log("===doUpdate==editedMap====", editedMap);
  }
  const cancel = ()=>{
    if(!editedMap[rowId]){
      editedMap[rowId] = {};
    }
    delete editedMap[rowId][colField];
    setValue(cellProps.value);
    // currentSelectedRow.setData(Object.assign({}, currentSelectedRow.data, {[colField]:cellProps.value}));
    // cellProps.api.stopEditing(false);
  }
  return (
    <>
      {isMultipleUpdatable && (
        <>
          <Space className="justify-start p-1 my-1 w-full ag-grid-multiple-update-chckbox">
            <Checkbox onChange={onMultipleUpdateEnableChange} checked={multipleUpdateEnable}>
              {`更新${selectedRows.length}个选定项目`}
            </Checkbox>
          </Space>
          <Space className="justify-end p-1 w-full ag-grid-multiple-update-footer">
            <Button onClick={cancel} size="small">取消</Button>
            <Button onClick={doUpdate} type="primary" size="small">应用</Button>
          </Space>
        </>
      )}
    </>
  );
};
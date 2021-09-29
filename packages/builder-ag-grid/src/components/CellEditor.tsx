import React, { useContext, useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback, useMemo } from "react"
import _ from "lodash"
import ProField from "@ant-design/pro-field";
import { Checkbox, Button, Space } from 'antd';

function getParentsClassName(element, classNames=[]){
  if(element){
    classNames.push(element.className)
    if(element.parentElement){
      classNames = classNames.concat(getParentsClassName(element.parentElement))
    }
  }
  return classNames
}

function useOnClickOutside(ref, handler) {
  useEffect(
    () => {
      const listener = (event) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        const target = event.target;
        const modelDom = target.closest('.ant-modal-root');
        if(modelDom && !modelDom.contains(ref.current) && !target.closest('.ant-btn')){
          return; // 表单（弹出框）：包含一个浮动的下拉框（时间框等）点击外部就退出编辑； 表单（弹出框）中 有的字段选项也是弹出框，在其字段的弹出框中点击不退出编辑。
        }
        if(target.closest('.ant-select-dropdown')){
          return; // 下拉框
        }
        if(target.closest('.ant-picker-dropdown') && !target.closest('.ant-btn') && !target.closest('.ant-picker-now-btn') && !target.closest('.ant-picker-today-btn') ){
          return; // 日期时间字段、 日期字段： 点击 此刻/今天 后退出编辑
        }
        // if(target.closest('.ag-grid-multiple-update-footer')){
        //   return; 
        // }
        handler(event);
      };
      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  );
}

const CellMultipleUpdatePanel = (props: any) => {
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
  const currentSelectedRow = selectedRows.find((row: any)=>{
    return row.data._id === rowId;
  });
  // 当前正在编辑的列所属行勾选上了，并且至少勾选了2行才显示批量更新按钮。
  const isMultipleUpdatable = currentSelectedRow && selectedRows.length > 1;
  
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

export const AgGridCellEditor = forwardRef((props: any, ref) => {
  const { 
    valueType = 'text',
    fieldSchema,
    form,
    context
  } = props;
  const editedMap: any= context?.editedMap
  const [value, setValue] = useState(props.value);
  const fieldRef = useRef(null)
  const refEditor = useRef(null)
  /* Component Editor Lifecycle methods */
  useImperativeHandle(ref, () => {
    return {
        getValue() {
            return value;
        },
        isPopup() {    
          return true;
        }
    }; 
  });

  useOnClickOutside(refEditor, (e) => {
    setTimeout(() => props.api.stopEditing(false), 300);
  });

  // const IntervalID = setInterval(()=>{
  //   console.log(`fieldRef.current`, document.activeElement, fieldRef.current.input)
  //   if(fieldRef.current && document.activeElement != fieldRef.current.input){
  //     props.api.stopEditing(false);
  //     clearInterval(IntervalID);
  //   }
  // }, 300)
  return (
    <section className="slds-popover slds-popover slds-popover_edit" role="dialog" ref={refEditor}>
      <div className="slds-popover__body">
        <ProField 
          mode='edit'
          valueType={valueType} 
          value={value}
          onChange={(element, value)=>{
            // console.log("===ProField=onChange==");
            const newValue = (element?.currentTarget)? element.currentTarget.value: element
            if (newValue === props.value)
              return;

            setValue(newValue)
            if(editedMap){
              if(!editedMap[props.data._id]){ 
                editedMap[props.data._id] = {};
              }
              editedMap[props.data._id][props.colDef.field] = newValue;
            }
            if (['lookup','select','master_detail'].indexOf(valueType)>=0 && fieldSchema.multiple != true){
              return setTimeout(() => props.api.stopEditing(false), 100);
            }

            if(fieldSchema.multiple != true){
              if(element?.target && document.activeElement === element.target){
                // console.log("==document.activeElement,element.target===", document.activeElement,element.target);
                const IntervalID = setInterval(()=>{
                  if(document.activeElement != element.target){
                    if(document.activeElement.closest('.ag-grid-multiple-update-chckbox')){
                      return;
                    }
                    props.api.stopEditing(false);
                    clearInterval(IntervalID);
                  }
                }, 300)
              }
            }
          }}
          fieldProps={{
            _grid_row_id: props.data._id,
            field_schema: fieldSchema
          }}
          form={form}
          allowClear={false}
        />
        <CellMultipleUpdatePanel cellProps={props} value={value} setValue={setValue} context={context} />
      </div>
    </section>
  ) 
});
  
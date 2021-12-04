import React, { useContext, useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback, useMemo } from "react"
import ProField from "@ant-design/pro-field";
import { Checkbox, Button, Space } from 'antd';
import { CellMultipleUpdatePanel, getIsMultipleUpdatable } from './CellMultipleUpdatePanel';
import { forEach } from "lodash"

function getParentsClassName(element, classNames=[]){
  if(element){
    classNames.push(element.className)
    if(element.parentElement){
      classNames = classNames.concat(getParentsClassName(element.parentElement))
    }
  }
  return classNames
}

function useOnClickOutside(ref, isMultipleUpdatable, handler) {
  useEffect(
    () => {
      const listener = (event) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        if(isMultipleUpdatable){
          // 表格单元格批量编辑时，所有字段操作都不自动退出编辑，统一由字段底下的应用操作
          return;
        }
        const target = event.target;
        const modelDom = target.closest('.ant-modal-root');
        const modalNum = document.getElementsByClassName('object-modal').length;
        let isCreateButton = false;
        if(modelDom){
          const buttonDom = target.closest('.ant-modal-footer .ant-btn');
          const buttonContent = buttonDom && buttonDom.querySelector(".ant-btn span").innerHTML;
          if(buttonContent === '新建'){
            isCreateButton = true;
          }
        }
        if (modelDom && !modelDom.contains(ref.current) && !(((target.closest('.ant-modal-footer .ant-btn') && !isCreateButton) || target.closest('.ant-modal-close')) && modalNum == 1)) {
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
        // console.log("=====handler====");
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

export const AgGridCellEditor = forwardRef((props: any, ref) => {
  const { 
    valueType = 'text',
    fieldSchema,
    objectApiName,
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

  const isMultipleUpdatable = getIsMultipleUpdatable(props.api.getSelectedNodes(), props.data._id);

  useOnClickOutside(refEditor, isMultipleUpdatable, (e) => {
    setTimeout(() => props.api.stopEditing(false), 300);
  });

  // const IntervalID = setInterval(()=>{
  //   console.log(`fieldRef.current`, document.activeElement, fieldRef.current.input)
  //   if(fieldRef.current && document.activeElement != fieldRef.current.input){
  //     props.api.stopEditing(false);
  //     clearInterval(IntervalID);
  //   }
  // }, 300)  let depend_field_values = {};
  let depend_field_values = {};
  let allValues = {};
  if(!form){
    // ObjectGrid的form为undefined, 依赖了depend_field_values；   aggrid的form有表单值，且此时传入的值可能会覆盖外面同名的字段值，所以目前不需要depend_field_values；
    if(fieldSchema && fieldSchema.depend_on && fieldSchema.depend_on.length){
      forEach(fieldSchema.depend_on,(val)=>{
        if(props.data[val] !== undefined){
          depend_field_values[val] = props.data[val];
          allValues = props.data;
        }
      })
    }
  }
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
            
            if(isMultipleUpdatable){
              // 表格单元格批量编辑时，所有字段操作都不自动退出编辑，统一由字段底下的应用操作
              return;
            }
            
            if (['lookup','select','master_detail'].indexOf(valueType)>=0 && fieldSchema.multiple != true){
              return setTimeout(() => props.api.stopEditing(false), 100);
            }

            if(fieldSchema.multiple != true){
              if(element?.target && document.activeElement === element.target){
              // if(element?.target && document.activeElement.closest('.ag-popup-editor.ag-popup-child')){
                // console.log("==document.activeElement,element.target===1===", document.activeElement,element.target);
                const IntervalID = setInterval(()=>{
                  if(document.activeElement != element.target){
                  // if(!document.activeElement.closest('.ag-popup-editor.ag-popup-child')){
                    // console.log("==document.activeElement,element.target====2===", document.activeElement,element.target);
                    // if(document.activeElement.closest('.ag-grid-multiple-update-chckbox')){
                    //   return;
                    // }
                    // if(document.activeElement.closest('.ag-grid-multiple-update-footer')){
                    //   return;
                    // }
                    // if(document.activeElement.closest('.ag-popup-editor.ag-popup-child')){
                    //   return;
                    // }
                    // console.log("==document.activeElement,element.target====3===", document.activeElement,element.target);
                    // console.log("==clearInterval===");
                    props.api.stopEditing(false);
                    clearInterval(IntervalID);
                  }
                }, 300)
              }
            }
          }}
          fieldProps={{
            _grid_row_id: props.data._id,
            allValues,
            depend_field_values,
            field_schema: fieldSchema,
          }}
          form={form}
          allowClear={false}
          object_api_name={objectApiName}
        />
        <CellMultipleUpdatePanel cellProps={props} value={value} setValue={setValue} context={context} />
      </div>
    </section>
  ) 
});
  

import React, { useContext, useRef, useEffect, useState, useImperativeHandle, forwardRef } from "react"
import { isNil } from "lodash"
import ProField from "@ant-design/pro-field";

import './CellFilter.less';

export const AgGridCellBooleanFilter = forwardRef((props:any, ref) => {
  const { 
    value: initialValue,
    valueType = 'boolean',
    fieldSchema,
  } = props;
  const [filter, setFilter] = useState(initialValue || null);

  // expose AG Grid Filter Lifecycle callbacks
  useImperativeHandle(ref, () => {
      return {
          // doesFilterPass(params) {
          // },

          isFilterActive() {
            return !isNil(filter)
          },

          // this example isn't using getModel() and setModel(),
          // so safe to just leave these empty. don't do this in your code!!!
          getModel() {
            if (!isNil(filter))
              return {
                filterType: valueType,
                type: 'equals',
                filter,
              }
          },

          setModel() {
          }
      }
  });

  useEffect(() => {
    if(filter !== null){
      props.filterChangedCallback()
    }
  }, [filter]);

  const fieldProps = {
    field_schema: Object.assign({}, fieldSchema, {
      options: [{
        label: "是",
        value: true
      },{
        label: "否",
        value: false
      }]
    })
  }

  const onChange = (value)=>{
    setFilter(value);
  }

  return (
    <div style={{padding:5}}>
      <ProField 
        mode='edit'
        valueType={"select"} 
        fieldProps={fieldProps}
        onChange={onChange}
        text={initialValue}
        emptyText=''
      />
    </div>
  )
});
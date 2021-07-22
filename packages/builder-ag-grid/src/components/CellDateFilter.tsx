
import React, { useContext, useRef, useEffect, useState, useImperativeHandle, forwardRef } from "react"
import ProField from "@ant-design/pro-field";
import moment from 'moment';

import './CellFilter.less';

export const AgGridCellDateFilter = forwardRef((props:any, ref) => {
  const { 
    value: initialValue,
    valueType = 'text',
    fieldSchema,
  } = props;
  const [dateFrom, setDateFrom] = useState(initialValue || null);
  const [dateTo, setDateTo] = useState(initialValue || null);
  const [betweenValue, setBetweenValue] = useState(null);

  // expose AG Grid Filter Lifecycle callbacks
  useImperativeHandle(ref, () => {
      return {
          // doesFilterPass(params) {
          // },

          isFilterActive() {
            if(betweenValue){
              if(betweenValue != 'inRange'){
                return true
              }else{
                return !!dateTo || !!dateFrom
              }
            }
          },

          // this example isn't using getModel() and setModel(),
          // so safe to just leave these empty. don't do this in your code!!!
          getModel() {
            if(betweenValue){
              if ((!!dateTo || !!dateFrom) || betweenValue != 'inRange'){
                if(betweenValue == 'inRange'){
                  return {
                    filterType: "date",
                    type: 'between',
                    dateFrom: dateFrom,
                    dateTo: dateTo
                  }
                }else{
                  return {
                    filterType: "date",
                    type: 'between',
                    filter: betweenValue
                  }
                }
              }
            }
          },

          setModel() {
          }
      }
  });

  useEffect(() => {
    if((dateTo !== null || dateFrom !== null) || (betweenValue != 'inRange' && betweenValue !== null)){
      props.filterChangedCallback()
    }
  }, [betweenValue, dateTo, dateFrom]);

  const startFieldProps = {
    field_schema: fieldSchema,
    placeholder: '开始',
    dropdownClassName: "ag-custom-component-popup"
  }
  const endFieldProps = {
    field_schema: fieldSchema,
    placeholder: '结束',
    dropdownClassName: "ag-custom-component-popup"
  }

  const options = [
    {
      label: '范围',
      value: 'inRange',
    },
    {
      label: '去年',
      value: 'last_year',
    },
    {
      label: '今年',
      value: 'this_year',
    },
    {
      label: '明年',
      value: 'next_year',
    },
    {
      label: '上季度',
      value: 'last_quarter',
    },
    {
      label: '本季度',
      value: 'this_quarter',
    },
    {
      label: '下季度',
      value: 'next_quarter',
    },
    {
      label: '上月',
      value: 'last_month',
    },
    {
      label: '本月',
      value: 'this_month',
    },
    {
      label: '下月',
      value: 'next_month',
    },
    {
      label: '上周',
      value: 'last_week',
    },
    {
      label: '本周',
      value: 'this_week',
    },
    {
      label: '下周',
      value: 'next_week',
    },
    {
      label: '昨天',
      value: 'yestday',
    },
    {
      label: '今天',
      value: 'today',
    },
    {
      label: '明天',
      value: 'tomorrow',
    },
    {
      label: '过去7天',
      value: 'last_7_days',
    },
    {
      label: '过去30天',
      value: 'last_30_days',
    },
    {
      label: '过去60天',
      value: 'last_60_days',
    },
    {
      label: '过去90天',
      value: 'last_90_days',
    },
    {
      label: '过去120天',
      value: 'last_120_days',
    },
    {
      label: '未来7天',
      value: 'next_7_days',
    },
    {
      label: '未来30天',
      value: 'next_30_days',
    },
    {
      label: '未来60天',
      value: 'next_60_days',
    },
    {
      label: '未来90天',
      value: 'next_90_days',
    },
    {
      label: '未来120天',
      value: 'next_120_days',
    }
  ]

  return (
    <div style={{padding:5}}>
      <ProField 
        dropdownClassName="ag-custom-component-popup"
        mode='edit'
        valueType="select"
        fieldProps={{field_schema: {
          type: 'select',
          options: options
        }}}
        onChange={(value)=>{
          if(!value){
            setDateFrom(null);
            setDateTo(null)
          }
          setBetweenValue(value)
        }}
        emptyText=''
      />
      {betweenValue == 'inRange' && 
      <>
        <ProField
          dropdownClassName="ag-custom-component-popup"
          mode='edit'
          valueType={valueType}
          fieldProps={startFieldProps}
          onChange={(event, value) => {
            let dateValue = event;
            if (moment.isMoment(event)) {
              dateValue = event.toDate()
            }
            setDateFrom(dateValue === null ? undefined : dateValue)
          }}
          text={initialValue}
          emptyText=''
        />
        <ProField
          dropdownClassName="ag-custom-component-popup"
          mode='edit'
          valueType={valueType}
          fieldProps={endFieldProps}
          onChange={(event, value) => {
            let dateValue = event;
            if (moment.isMoment(event)) {
              dateValue = event.toDate()
            }
            setDateTo(dateValue === null ? undefined : dateValue)
          }}
          text={initialValue}
          emptyText=''
        />
      </>
      }
      
    </div>
  )
});
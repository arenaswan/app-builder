
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
    placeholder: '??????',
    dropdownClassName: "ag-custom-component-popup"
  }
  const endFieldProps = {
    field_schema: fieldSchema,
    placeholder: '??????',
    dropdownClassName: "ag-custom-component-popup"
  }

  const options = [
    {
      label: '??????',
      value: 'inRange',
    },
    {
      label: '??????',
      value: 'last_year',
    },
    {
      label: '??????',
      value: 'this_year',
    },
    {
      label: '??????',
      value: 'next_year',
    },
    {
      label: '?????????',
      value: 'last_quarter',
    },
    {
      label: '?????????',
      value: 'this_quarter',
    },
    {
      label: '?????????',
      value: 'next_quarter',
    },
    {
      label: '??????',
      value: 'last_month',
    },
    {
      label: '??????',
      value: 'this_month',
    },
    {
      label: '??????',
      value: 'next_month',
    },
    {
      label: '??????',
      value: 'last_week',
    },
    {
      label: '??????',
      value: 'this_week',
    },
    {
      label: '??????',
      value: 'next_week',
    },
    {
      label: '??????',
      value: 'yestday',
    },
    {
      label: '??????',
      value: 'today',
    },
    {
      label: '??????',
      value: 'tomorrow',
    },
    {
      label: '??????7???',
      value: 'last_7_days',
    },
    {
      label: '??????30???',
      value: 'last_30_days',
    },
    {
      label: '??????60???',
      value: 'last_60_days',
    },
    {
      label: '??????90???',
      value: 'last_90_days',
    },
    {
      label: '??????120???',
      value: 'last_120_days',
    },
    {
      label: '??????7???',
      value: 'next_7_days',
    },
    {
      label: '??????30???',
      value: 'next_30_days',
    },
    {
      label: '??????60???',
      value: 'next_60_days',
    },
    {
      label: '??????90???',
      value: 'next_90_days',
    },
    {
      label: '??????120???',
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
            // dateValue???null????????????undefined???????????????useEffect?????????null???????????????????????????????????????undefined??????????????????????????????????????????????????????????????????????????????bug
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
            // dateValue???null????????????undefined???????????????useEffect?????????null???????????????????????????????????????undefined??????????????????????????????????????????????????????????????????????????????bug
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
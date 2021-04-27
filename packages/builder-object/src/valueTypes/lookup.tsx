import React, { useState } from "react";
import { formatFiltersToODataQuery } from '@steedos/filters';
import { Tag } from 'antd';
import _ from 'lodash';
import { Objects, API } from '@steedos/builder-store';
import { observer } from "mobx-react-lite";
import FieldSelect from '@ant-design/pro-field/es/components/Select';
import { Link } from "react-router-dom";
import { getObjectRecordUrl } from "../utils";

// 相关表类型字段
// 通过下拉框显示相关表中的数据，可以搜索
// 参数 props.reference_to:

export const LookupField = observer((props:any) => {
    const [params, setParams] = useState({open: false,openTag: null});
    const { valueType, mode, fieldProps, request, ...rest } = props;
    const { field_schema: fieldSchema = {},depend_field_values: dependFieldValues={} } = fieldProps;
    const { reference_to, reference_sort,reference_limit, multiple, reference_to_field = "_id", filters: fieldFilters = [],filtersFunction } = fieldSchema;
    const value = fieldProps.value || props.text;//ProTable那边fieldProps.value没有值，只能用text
    let tags:any[] = [];
    const referenceTo = _.isFunction(reference_to) ? reference_to() : reference_to;
    let options = fieldSchema.optionsFunction ? fieldSchema.optionsFunction : fieldSchema.options ;
    if(mode==='read'){
        if(value){
            if (referenceTo) {
                const object = Objects.getObject(referenceTo);
                if (object.isLoading) return (<div>Loading object ...</div>);
                let referenceToLableField = object.schema["NAME_FIELD_KEY"] ? object.schema["NAME_FIELD_KEY"] : "name";
                const filter = value ? [[reference_to_field, '=', value]] : [];
                const fields = [reference_to_field, referenceToLableField, "_id"];
                const recordList: any = object.getRecordList(filter, fields);
                if (recordList.isLoading) return (<div>Loading recordList ...</div>);
                const recordListData = recordList.data;
                if (recordListData && recordListData.value && recordListData.value.length > 0) {
                    let tagsValueField = reference_to_field;
                    if(referenceTo === "space_users" && reference_to_field === "user"){
                        // 选人字段只读时链接应该显示的是space_users的_id字段值，而不是user字段值
                        tagsValueField = "_id"
                    }
                    tags = recordListData.value.map((recordItem: any) => { return { value: recordItem[tagsValueField], label: recordItem[referenceToLableField] } });
                }
            }else{
                // TODO:options({}) 里的对象后期需要存放value进入
                options = _.isFunction(options) ? options(dependFieldValues) : options;
                // tags = _.filter(options,["value",value])
                tags = _.filter(options,(optionItem: any)=>{
                    return multiple ? value.indexOf(optionItem.value) > -1 : optionItem.value === value;
                })
            }
        }
        return (<React.Fragment>{tags.map((tagItem, index)=>{return (
            <React.Fragment key={tagItem.value}>
                {index > 0 && ', '}
                { referenceTo ? (<Link to={getObjectRecordUrl(referenceTo, tagItem.value)} className="text-blue-600 hover:text-blue-500 hover:underline">{tagItem.label}</Link>) : (tagItem.label) }
            </React.Fragment>
        )})}</React.Fragment>)
    }else{
        if (multiple)
            fieldProps.mode = 'multiple';

        let dependOnValues: any = dependFieldValues;
        let options = fieldSchema.optionsFunction ? fieldSchema.optionsFunction : fieldSchema.options ;
        let request: any;
        let requestFun= async (params: any, props: any) => {
            // 注意，request 里面的代码不会抛异常，包括编译错误。
            // console.log("===request===params, props==", params, props);
            // console.log("===request===reference_to==", reference_to);
            if(_.isFunction(options)) {
                dependOnValues.__keyWords = params.keyWords;
                const results = await options(dependOnValues);
                return results;
            }
            else{
                const object = Objects.getObject(referenceTo);
                let referenceToLableField = object.schema["NAME_FIELD_KEY"] ? object.schema["NAME_FIELD_KEY"] : "name";
                let filters: any = [], textFilters: any = [], keyFilters: any = [];
                if (props.text)
                    textFilters = [reference_to_field, '=', props.text]
                if (params.keyWords)
                    keyFilters = [referenceToLableField, 'contains', params.keyWords]
                let filtersOfField:[] =  filtersFunction ? filtersFunction(fieldFilters) : fieldFilters;
                if (filtersOfField.length) {
                    if (keyFilters.length) {
                        if (_.isArray(filtersOfField)) {
                            keyFilters = [filtersOfField, keyFilters]
                        }
                        else {
                            const odataKeyFilters = formatFiltersToODataQuery(keyFilters);
                            keyFilters = `(${filtersOfField}) and (${odataKeyFilters})`;
                        }
                    }
                    else {
                        keyFilters = filtersOfField;
                    }
                }
                if (textFilters.length && keyFilters.length) {
                    if (_.isArray(keyFilters)) {
                        filters = [textFilters, 'or', keyFilters]
                    }
                    else {
                        const odataTextFilters = formatFiltersToODataQuery(textFilters);
                        filters = `(${odataTextFilters}) or (${keyFilters})`;
                    }
                }
                else if (textFilters.length && !open) {
                    filters = textFilters;
                }
                else if (keyFilters.length) {
                    filters = keyFilters;
                }
                const fields = [reference_to_field, referenceToLableField];
                // console.log("===filters===", filters);
                let option: any = {};
                if (reference_sort) {
                    option.sort = _.map(reference_sort, (value, key) => { return `${key}${value == 1 ? '' : ' desc'}` }).join(",")
                }
                if (reference_limit) {
                    option.pageSize = reference_limit
                }
                const data = await API.requestRecords(referenceTo, filters, fields, option);
                const results = data.value.map((item: any) => {
                    return {
                        label: item[referenceToLableField],
                        value: item[reference_to_field]
                    }
                })
                return results;
            }
        }
        
        if (referenceTo){ // 含有reference_to
            if (referenceTo && !options) {
                request = requestFun;
            }
            if (referenceTo && options) {
                if (_.isArray(options)) {
                    fieldProps.options = options;
                } else if (_.isFunction(options)) {
                    request = requestFun;
                }
            }
        }else{ // 最后一种情况 没有referenceTo 只有options 或 optionsFunction 
            if(_.isFunction(options)){
                request = async (params: any, props: any) => {
                  dependFieldValues.__keyWords = params.keyWords;
                  const results = await options(dependFieldValues);
                  return results;
                };
              }else{
                fieldProps.options = options;
              }
        }
        const onDropdownVisibleChange = (open: boolean) => {
            if (open) {
                setParams({ open, openTag: new Date() });
            }
        }

        const proFieldProps = {
            mode: mode,
            showSearch: true,
            showArrow: true,
            optionFilterProp: 'label',
            fieldProps,
            request,
            params,
            onDropdownVisibleChange,
            ...rest
        }
        return (
            <FieldSelect {...proFieldProps} />
        )
    }
});

export const lookup = {
    render: (text: any, props: any) => {
        return (<LookupField {...props} mode="read"></LookupField>)
    },
    renderFormItem: (text: any, props: any) => {
        return (<LookupField {...props} mode="edit"></LookupField>)
    }
}
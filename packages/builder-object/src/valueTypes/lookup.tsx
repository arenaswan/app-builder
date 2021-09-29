import React, { useState , useRef, useEffect} from "react";
import { formatFiltersToODataQuery } from '@steedos/filters';
import { Select, Spin, Alert } from 'antd';
import "antd/es/tree-select/style/index.css";
import { isFunction, isArray, isObject, uniq, filter, map, forEach, isString, isEmpty, concat, isBoolean } from 'lodash';
import { concatFilters } from '@steedos/builder-sdk';
import { Objects, API, Settings } from '@steedos/builder-store';
import { observer } from "mobx-react-lite";
import FieldSelect from '@ant-design/pro-field/es/components/Select';
import { getObjectRecordUrl , Link } from "@steedos/builder-form"
import { SteedosIcon } from '@steedos/builder-lightning';
import "./lookup.less"
import { PlusOutlined } from "@ant-design/icons";
import { safeRunFunction } from '@steedos/builder-sdk';
import { ObjectForm, ObjectTable, ObjectExpandTable,ObjectListView, 
    ObjectModal, ObjectTableModal, SpaceUsersModal, OrganizationsModal, ObjectFieldTreeSelect } from "../components";
import { BAD_FILTERS } from '../utils';

const { Option } = Select;

const getObjectEnhancedLookup=(objectSchema)=>{
    const enable_enhanced_lookup = objectSchema.enable_enhanced_lookup;
    return isBoolean(enable_enhanced_lookup) ? enable_enhanced_lookup : true;
}
// 相关表类型字段
// 通过下拉框显示相关表中的数据，可以搜索
// 参数 props.reference_to:
export const LookupField = observer((props:any) => {
    const [params, setParams] = useState({open: false,openTag: null});
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { valueType, mode, fieldProps, request, form, ...rest } = props;
    const { field_schema: fieldSchema = {},onChange, _grid_row_id, depend_field_values: dependFieldValues={} } = fieldProps;
    const { reference_to, reference_sort,reference_limit, showIcon = true, multiple, reference_to_field = "_id", filters: fieldFilters = [],filtersFunction, create = true, modal_mode, table_schema, link_target, modalClassName } = fieldSchema;
    // TODO: 添加 fieldProps.defaultValue 修复lookup字段默认值显示value 而不显示label的bug。 select字段一直是正常了，lookup字段一开始是正常的，后面就出问题了。
    let fieldValue = fieldProps.defaultValue || fieldProps.value || props.text;//ProTable那边fieldProps.value没有值，只能用text
    let [ fieldsValue ,setFieldsValue ] = useState({});
    // 按原来lookup控件的设计，this.template.data._value为原来数据库中返回的选项值，this.template.data.value为当前用户选中的选项
    const optionsFunctionThis = {
        filters: fieldFilters,
        form: form,
        template: {
            data: {
                value: fieldValue,
                _value: fieldValue
            }
        }
    };
    const objectApiName = props.object_api_name;
    // useEffect(() => {
    //     console.log('aaaaaaaaaa')
    //     setFieldsValue(form?.getFieldsValue());
    //     setParams({ open: params.open, openTag: new Date() });
    // }, [dependFieldValues])
    const fieldsValues = Object.assign({}, form?.getFieldsValue() , dependFieldValues);
    let optionsFunctionValues:any = Object.assign({}, fieldsValues || {}, {
        _grid_row_id: _grid_row_id,
        space: Settings.tenantId,
        _object_name: objectApiName
    });
    let tags:any[] = [];
    let referenceTos = isFunction(reference_to) ? reference_to() : reference_to;
    let defaultReferenceTo:any;
    if(isArray(referenceTos)){
        if(fieldValue && fieldValue.o){
            defaultReferenceTo = fieldValue.o;
        }else{
            defaultReferenceTo = referenceTos[0];
        }
    }
    let [referenceTo, setReferenceTo] = useState(isArray(referenceTos) ? defaultReferenceTo : referenceTos);
    // selectedValue 只有在reference_to 是数组的才用到， 值的格式为(value:xx, label:xx)
    const [selectedValue, setSelectedValue] = useState();
    // optionsFunction优先options
    let options = fieldSchema.optionsFunction ? fieldSchema.optionsFunction : fieldSchema.options ;
    // if(isArray(referenceTos) && value ){
        if(isObject(fieldValue) && !isArray(fieldValue)){
            fieldValue=fieldValue['ids'];
        }
    //}
    let referenceToObject,referenceToObjectSchema,referenceToLableField, referenceToObjectIcon, referenceParentField, isAllowCreate;
    if(referenceTo){
        referenceToObject = Objects.getObject(referenceTo);
        if (referenceToObject.isLoading) return (<div><Spin/></div>);
        if(isEmpty(referenceToObject.schema)){
            return null;
            // return (<Alert message="未找到引用的对象" type="warning" showIcon style={{padding: '4px 15px'}}/>)
        }
        referenceToObjectSchema = referenceToObject.schema;
        isAllowCreate = referenceToObject.getPermissions().allowCreate;
        referenceToLableField = referenceToObjectSchema["NAME_FIELD_KEY"] ? referenceToObjectSchema["NAME_FIELD_KEY"] : "name";
        // TODO: organizations.object.yml 文件里后续也要添加一个类似enable_tree属性 parent_field。
        referenceParentField = referenceToObjectSchema.parent_field || "parent"
        if(referenceToObjectSchema.icon){
            referenceToObjectIcon = referenceToObjectSchema.icon;
        }
    }
    let selectItem = [], recordListData: any, referenceTofilters: any[] | string, fields: any;
    if(referenceToObject && fieldValue){
        referenceTofilters = [[reference_to_field, '=', fieldValue]];
        fields = uniq([reference_to_field, referenceToLableField, "_id"]);
    }
    if(mode==='read'){
        if(fieldValue){
            // if (referenceTo && !options) {
            if (referenceTo) {
                // 只读情况下指定referenceTo时，直接根据id查数据就行，如果执行optionsFunction会造成列表性能差
                // tree-select 编辑时会调用只读的缓存，编辑时需要显示字段name，而不是fullname.
                if(referenceTo==='organizations'){
                    fields.push('name')
                }
                // 如果不是按ID查询要显示的数据，就把filters过滤条件加上然后再查询要显示的数据。
                if(reference_to_field !== "_id" ){
                    const filters = filtersFunction ? safeRunFunction(filtersFunction,[fieldFilters, optionsFunctionValues],BAD_FILTERS,optionsFunctionThis) : fieldFilters
                    referenceTofilters = concatFilters(referenceTofilters,filters);
                }

                const recordList = referenceToObject.getRecordList(referenceTofilters, fields);
                if (recordList.isLoading) return (<div><Spin/></div>);
                recordListData = recordList.data;
                if (recordListData && recordListData.value && recordListData.value.length > 0) {
                    let tagsValueField = reference_to_field;
                    if(reference_to_field && reference_to_field !== "_id"){
                        // 选人字段只读时链接应该显示的是space_users的_id字段值，而不是user字段值
                        tagsValueField = "_id"
                    }
                    selectItem = recordListData.value.map((recordItem: any) => { 
                        return { value: recordItem[tagsValueField], label: recordItem[referenceToLableField] } 
                    });
                }
                tags = selectItem;
            }else{
                // TODO:options({}) 里的对象后期需要存放value进入
                options = isFunction(options) ? safeRunFunction(options,[optionsFunctionValues],[], optionsFunctionThis) : options;
                tags = filter(options,(optionItem: any)=>{
                    return multiple ? fieldValue.indexOf(optionItem.value) > -1 : optionItem.value === fieldValue;
                })
            }
            if (multiple && fieldValue.length > 1) {
                tags.sort((m,n)=>{return fieldValue.indexOf(m.value) - fieldValue.indexOf(n.value)})
            }
        }
        return (<React.Fragment>{tags.map((tagItem, index)=>{return (
            <React.Fragment key={tagItem.value}>
                {index > 0 && ', '}
                { referenceTo ? (<Link target={link_target} to={getObjectRecordUrl(referenceTo, tagItem.value)} className="text-blue-600 hover:text-blue-500 hover:underline">{tagItem.label}</Link>) : (tagItem.label) }
            </React.Fragment>
        )})}</React.Fragment>)
    }else{
        if (multiple){
            fieldProps.mode = 'multiple';
        }

        let request: any;
        let labelInValue=false;
        let requestFun= async (params: any, props: any) => {
            // 注意，request 里面的代码不会抛异常，包括编译错误。
            // console.log("===request===params, props==", params, props);
            // console.log("===request===reference_to==", reference_to);

            if(isFunction(options)) {
                optionsFunctionValues._keyWords = params.keyWords;
                optionsFunctionValues._referenceTo = referenceTo;
                const results = await safeRunFunction(options,[optionsFunctionValues],[], optionsFunctionThis);
                return results;
            }
            else{
                let filters: any = [], textFilters: any = [], keyFilters: any = [];
                let fields = [reference_to_field, referenceToLableField];
                // console.log("===filters===", filters);
                let option: any = {};
                if(params.open){
                    if (reference_sort) {
                        option.sort = map(reference_sort, (value, key) => { 
                            if(fields.indexOf(key)<0){ fields.push(key) };
                            return `${key}${value == 1 ? '' : ' desc'}` 
                        }).join(",")
                    }
                    if (reference_limit) {
                        option.pageSize = reference_limit
                    }
                    if (fieldValue){
                        textFilters = [reference_to_field, '=', fieldValue];
                    }
                    if (params.keyWords){
                        keyFilters = [referenceToLableField, 'contains', params.keyWords];
                    }
                    // filtersFunction执行后可能返回空，如果返回空表示加载所有数据
                    let filtersOfField:[] =  filtersFunction ? safeRunFunction(filtersFunction,[fieldFilters, optionsFunctionValues],BAD_FILTERS,optionsFunctionThis) : fieldFilters;
                    if (filtersOfField?.length) {
                        if (keyFilters.length) {
                            if (isArray(filtersOfField)) {
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
                        if (isArray(keyFilters)) {
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
                }else{
                    const _filters = filtersFunction ? safeRunFunction(filtersFunction,[fieldFilters, optionsFunctionValues],BAD_FILTERS,optionsFunctionThis) : fieldFilters
                    filters = concatFilters(referenceTofilters,_filters);
                }
                let data = await API.requestRecords(referenceTo, filters, fields, option);

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
            if (!options) {
                request = requestFun;
            }
            else if (options) {
                if (isArray(options)) {
                    fieldProps.options = options;
                } else if (isFunction(options)) {
                    request = requestFun;
                }
            }
        }else{ // 最后一种情况 没有referenceTo 只有options 或 optionsFunction 
            if (isFunction(options)) {
                request = async (params: any, props: any) => {
                    optionsFunctionValues._keyWords = params.keyWords;
                    const results = await safeRunFunction(options, [optionsFunctionValues], [], optionsFunctionThis);
                    return results;
                };
            } else {
                fieldProps.options = options;
            }
        }
        const onDropdownVisibleChange = (open: boolean) => {
            if (open) {
                setParams({ open, openTag: new Date() });
            }
        }

        let newFieldProps:any=fieldProps;
        if(isArray(referenceTos)){
            labelInValue=true;
            let defaultReferenceToValue:any = [];
            if(fieldValue){
                const recordList = referenceToObject.getRecordList(referenceTofilters, fields);
                // 下拉框选中某个选项，获取其对应的lable。因为如果加下面的isloading判断，就会在重新选择其它选项时会有isLoading状态的效果， 所以不需要下面这行isloading判断。
                // if (recordList.isLoading) return (<div><Spin/></div>);
                recordListData = recordList.data;
                if (recordListData && recordListData.value && recordListData.value.length > 0) {
                    forEach(recordListData.value, (recordItem: any) => {
                        let valueLabel = { value: recordItem[reference_to_field], label: recordItem[referenceToLableField] };
                        defaultReferenceToValue.push(valueLabel)
                    })
                }
            }
            if(!multiple){
                defaultReferenceToValue = defaultReferenceToValue[0];
            }
            let idsValue = [];
            newFieldProps = Object.assign({}, fieldProps, {
                value: selectedValue ? selectedValue : defaultReferenceToValue,
                onChange:(values: any, option: any)=>{
                    let tempSelectedValue:any = undefined;
                    if (multiple) {
                        tempSelectedValue=[];
                        forEach(values, (item) => {
                            idsValue.push(item.value);
                            tempSelectedValue.push({value: item.value, label: item.label})
                        })
                    } else {
                        if(values.value){ idsValue = [values.value]; }
                        tempSelectedValue = {value: values.value, label:values.label};
                    }
                    setSelectedValue(tempSelectedValue)
                    onChange({o: referenceTo, ids: idsValue })
                }
            })
        }
        let optionItemRender;
        if(showIcon){
            optionItemRender = (item) => {
                return (
                    referenceToObjectIcon || item.icon ?
                    (<React.Fragment>
                        <span role="img" aria-label="smile" className="anticon anticon-smile"><SteedosIcon name={item.icon || referenceToObjectIcon} size="x-small"/></span>
                        <span>{item.label}</span>
                    </React.Fragment>)
                    : item.label
                )
            }
        }
        let proFieldProps: any;
        let dropdownRender;
        // TODO: 下拉框新建按钮有bug, 解决后再放开。 其create默认值也要再思考下。
        if(isAllowCreate && create && false){
            const createObjectName = referenceToObjectSchema.label;
            dropdownRender = (menu)=>{
            return (
                <React.Fragment>
                    {menu}
                    <ObjectForm
                        // initialValues={initialValues} 
                        key="standard_new" 
                        title={`新建 ${createObjectName}`} 
                        mode="edit" 
                        isModalForm={true} 
                        objectApiName={referenceTo} 
                        name={`lookup-create-${objectApiName}-${props.name}-${referenceTo}`}
                        submitter={false}
                        trigger={
                            <a className="add_button text-blue-600 hover:text-blue-500 hover:underlin"  onClick={()=>{
                                // 新建弹出后新建按钮应该隐藏掉
                                setIsDropdownOpen(false);
                            }} >
                                <PlusOutlined /> 新建 {createObjectName}
                            </a>
                        } 
                        // 新建的 createObjectName 自动被选中
                        afterInsert={async (values)=>{
                            let insertedId = values[0] && values[0]._id;
                            if (insertedId) {
                                let createdFieldValue: any = [];
                                // fieldValue 是多选字段当前选中的值。只有多选字段才会将已选中id 和 新建id 合并返回。
                                createdFieldValue = (multiple && isArray(fieldValue)) ? concat(fieldValue, insertedId) : [insertedId];
                                let value:any = multiple ? createdFieldValue : createdFieldValue[0];
                                if(isArray(referenceTos)){
                                    value = {o: referenceTo, ids: createdFieldValue };
                                }
                                onChange(value);
                                // 利用setParams执行request函数返回[{value:xx, label:xx}], 显示label。
                                setParams({ open: false, openTag: new Date() });
                            }
                            return true;
                        }}
                    />
                </React.Fragment>
            )
            }
        }
        let showModal = ["dialog", "drawer"].indexOf(modal_mode) > -1 || (referenceToObjectSchema &&  getObjectEnhancedLookup(referenceToObjectSchema))
        if(options){
            showModal = false;
        }
        const isLookupTree = !showModal && referenceToObjectSchema && referenceToObjectSchema.enable_tree;
        let modalDom: any;
        let proFieldPropsForDropdown = {
            open: isDropdownOpen,
            onClick: (e)=>{
                if(e.target.closest(".ant-select")){
                    setIsDropdownOpen(true);
                }
                rest.onClick && rest.onClick(e);
            },
            onBlur: (e)=>{
                // 加setTimeout的原因是立即隐藏下拉选项会造成下拉选项底部的新建按钮事件不生效
                setTimeout(()=>{
                    setIsDropdownOpen(false);
                }, 500);
                rest.onBlur && rest.onBlur(e);
            },
            onSelect: (value: any, option: any)=>{
                if(!multiple){
                    setIsDropdownOpen(false);
                }
                rest.onSelect && rest.onSelect(value, option);
            }
        };
        if(isLookupTree){
            // organizations 对象： 下拉框展开时显示name， 关闭时显示fullname.
            let treeReferenceToLableField = referenceToLableField;
            if(referenceTo === 'organizations' && isDropdownOpen){
                treeReferenceToLableField = 'name';
            }
            //主要用到了newFieldProps中的onChange和value属性
            proFieldProps = Object.assign({}, {...newFieldProps}, {
                objectApiName: referenceTo,
                multiple,
                filters: fieldFilters,
                filtersFunction,
                nameField: treeReferenceToLableField,
                parentField: referenceParentField,
                ...proFieldPropsForDropdown
            })
        }
        else{
            let proFieldPropsForModal = {};
            if(showModal){
                proFieldPropsForModal = {
                    showSearch: false,
                    onDropdownVisibleChange: false,
                    open: false,
                    onClick: null,
                    onBlur: null, 
                    onSelect: null
                }
                const referenceToObjectLabel = referenceToObjectSchema.label;
                modalDom = (trigger: any)=>{
                    let ModalComponent = ObjectModal;
                    let modalPorps:any = {
                        title: `选择 ${referenceToObjectLabel}`,
                        modalProps: { className: modalClassName},
                        objectApiName: referenceTo,
                        multiple,
                        // TODO: 有可能后续带上recordId ? recordId : 'new'
                        name: `lookup-${objectApiName}-${props.name}-${referenceTo}`,
                        showCreateButton: isAllowCreate && create,
                        value: fieldValue,
                        // 弹出框会返回rowKey对应的字段值，默认为_id，比如space_users要求返回user字段值
                        rowKey: reference_to_field,
                        // filtersFunction执行后可能返回空，如果返回空表示加载所有数据
                        filters: filtersFunction ? safeRunFunction(filtersFunction,[fieldFilters, optionsFunctionValues],BAD_FILTERS,optionsFunctionThis) : fieldFilters,
                        trigger,
                        onFinish: onModalFinish
                    };
                    if(table_schema){
                        if(isObject(table_schema) && !isEmpty(table_schema)){
                            modalPorps.listSchema = table_schema;
                        }
                        if(isString(table_schema)){
                            modalPorps.listName = table_schema;
                        }
                    }                
                    if(referenceTo === "space_users"){
                        ModalComponent = SpaceUsersModal;
                        Object.assign(modalPorps, {
                            showCreateButton: false,
                            columnFields: undefined //使用SpaceUsersModal默认定义的columnFields
                        })
                    }
                    else if(referenceTo === "organizations"){
                        ModalComponent = OrganizationsModal;
                        // TODO: 暂时不允许新建 organizations; 放开后 新建完能保存，但是点击保存后窗口没关闭。
                        Object.assign(modalPorps, {
                            showCreateButton: false
                        })
                    }
                    return (
                        <ModalComponent {...modalPorps}/>
                    )
                };
            }
            proFieldProps = {
                mode: mode,
                showSearch: true,
                showArrow: true,
                optionFilterProp: 'label',
                fieldProps: newFieldProps,
                request,
                labelInValue,
                params,
                onDropdownVisibleChange,
                optionItemRender,
                dropdownRender,
                ...rest,
                ...proFieldPropsForDropdown,
                ...proFieldPropsForModal
            }
        }
        const referenceToSelectProps = {
            mode: mode,
            showArrow: true,
            optionFilterProp: 'label',
            onChange: (value: any) => {
                setReferenceTo(value)
            },
            dropdownMatchSelectWidth:172,
            defaultValue:referenceTo
        }
        const needReferenceToSelect = isArray(referenceTos) && !isArray(options)
        let referenceToOptions:any = [];
        let isLoadingReferenceTosObject;
        if(needReferenceToSelect){
            forEach(referenceTos,(val)=>{
                const referenceToObject = Objects.getObject(val);
                referenceToObjectSchema = referenceToObject.schema;
                let referenceToObjectLeftIcon;
                if(referenceToObjectSchema.icon){
                    referenceToObjectLeftIcon = referenceToObjectSchema.icon;
                }
                if (!referenceToObject.isLoading){
                    if(referenceToObjectLeftIcon){
                        referenceToOptions.push({label:referenceToObjectSchema.label,value:val,icon:referenceToObjectLeftIcon})
                    }else{
                        referenceToOptions.push({label:referenceToObjectSchema.label,value:val})
                    }   
                }
            })
            isLoadingReferenceTosObject = referenceToOptions.length !== referenceTos.length;
        }
        if(isLoadingReferenceTosObject) return (<div><Spin/></div>)

        const lookupInput = isLookupTree ? (<ObjectFieldTreeSelect {...proFieldProps}  />) : (<FieldSelect {...proFieldProps} />);
        const onModalFinish = (selectedRowKeys: any, selectedRows: any)=>{
            // ag-grid只传一个参数（rows）过来，这里获取其内部的value。
            if(!selectedRows){
                selectedRowKeys = map(selectedRowKeys,reference_to_field)
            }
            let changedValue = multiple ? selectedRowKeys : selectedRowKeys[0];
            if(isArray(referenceTos)){
                changedValue = {o: referenceTo, ids: selectedRowKeys };
            }
            onChange(changedValue);
            setParams({ open:false, openTag: new Date() });
        }
        return (
            <div className="lookup-field-container">
                {
                    needReferenceToSelect && 
                    (<Select   {...referenceToSelectProps} className="lookup-field-left-select">
                    {
                        map(referenceToOptions,(item)=>{
                            return (
                            <Option value={item.value} key={item.value}>
                                {item.icon ? <span role="img" aria-label="smile" className="anticon anticon-smile"><SteedosIcon name={item.icon} size="x-small"/></span> : null}
                                <span className="left_label">{item.label}</span>
                            </Option>)
                        })
                    }
                    </Select>)
                }
                {showModal ? modalDom(lookupInput) : lookupInput}
            </div>
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
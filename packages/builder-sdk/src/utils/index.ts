import { isArray, isNil } from 'lodash';

export const safeRunFunction = (fun: any, args: any, defaultValue?: any, _this?: any) => {
  try {
    let params = [];
    if(!isNil(args)){
      params = isArray(args) ? args : [args] ;
    }
    return fun.bind(_this || {})(...params);
  } catch (error) {
    console.log(error);
    return defaultValue;
  }
}

export const BASE_FIELDNAMES_FOR_PERMISSIONS = ["owner", "company_id", "company_ids", "locked"];

export const getObjectBaseFieldNames = (objectSchema: any) =>{
  // 自定义schema允许不配置datasource，默认按default数据源处理
  if(objectSchema && ["default", "meteor"].indexOf(objectSchema.datasource || "default") > -1){
    return BASE_FIELDNAMES_FOR_PERMISSIONS;
  }
  else{
    return [];
  }
}

export const getObjectNameFieldKey = (objectSchema: any) =>{
  let nameFieldKey = objectSchema.NAME_FIELD_KEY;
  if(objectSchema.name === "organizations"){
    nameFieldKey = "name";
  }
  return nameFieldKey || "name";
}

export const getObjectChildrenFieldName = (objectSchema: any) =>{
  return objectSchema.children_field || "children"
}

export const getObjectParentFieldName = (objectSchema: any) =>{
  return objectSchema.parent_field || "parent"
}
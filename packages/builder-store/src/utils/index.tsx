import { each, isArray, forEach, isObject, isString, keys, isFunction, isNil} from 'lodash';
export function safeEval(js: string){
	try{
    return eval(js.replace(/_\./g, "window._.").replace(/\bt\(/g, "window.t("))
	}catch (e){
		console.error(e, js);
	}
};

/**
  把原来的默认值公式表达式转换成新的表达式语法，原来的表达式语法如下所示：
  ==========
  取一个字段的值：使用“{”和“}” (注意都是半角)将字段名扩起来，如：{price}
  基于当前用户的系统变量：包括姓名、角色、部门等
  ID: {userId}
  姓名：{user.name}
  所在部门（当申请人属于多个部门时，为所在主部门的全路径）： {user.organization.fullname}
  所在部门（最底层部门名）： {user.organization.name}
  角色名： {user.roles}
  手机： {user.mobile}
  固定电话： {user.work_phone}
  职务： {user.position}
  取当前工作区的信息
  ID: {spaceId}
  ===========
 * @param express 
 */
const getCompatibleDefaultValueExpression = (express: string, multiple?: boolean)=>{
  const reg = /^\{\w+(\.*\w+)*\}$/;//只转换{}包着的老语法，新语法是两层大括号{{}}，不运行转换
  let result = express;
  if(reg.test(express)){
    if(express.indexOf("userId") > -1 || express.indexOf("spaceId") > -1 || express.indexOf("user.") > -1 || express.indexOf("now") > -1){
      result = `{${express}}`.replace("{{", "{{global.");
    }
    else{
      result = `{${express}}`.replace("{{", "{{formData.");
    }
    if(multiple){
      // 如果是多选字段，则返回值应该加上中括号包裹，表示返回数组
      result = result.replace(/\{\{(.+)\}\}/, "{{[$1]}}")
    }
  }
  return result;
}

const getFieldSchema = (fieldName: any, objectConfig: any)=>{
  let fieldSchema: any = {};
  const field = objectConfig.fields[fieldName];
  const fieldType = field && field.type;
  let sub_fields: any;
  // fieldName变量中可能带$和.符号，需要转换成RegExp匹配的带转义符的字符
  const fieldNameForReg = fieldName.replace(/\$/g,"\\$").replace(/\./g,"\\.");
  const precision = field.precision || 18;
  if(fieldType === 'object'){
    // 根据对象的子表字段信息，返回子表配置属性
    sub_fields = {};
    each(objectConfig.fields, (fieldItem, key) => {
      const reg = new RegExp(`^${fieldNameForReg}\\.\\\w+$`); //以fieldName开头，且用.号连接下一个字段名
      // if(key.startsWith(`${fieldName}.`)){
      if(reg.test(key)){
        // members.users、instances.$._id、sharing.$之类的复合字段中取出最后一个.字段名，但是不匹配$结尾的字段名
        let matches = key.match(/.(\w+)$/g);
        let lastFieldKey = matches && matches[0].replace(".", "");
        if(lastFieldKey){
          sub_fields[lastFieldKey] = getFieldSchema(key, objectConfig);   ;                           
        }
      }
    });
    fieldSchema = Object.assign({}, field, {sub_fields});
  }
  else if(fieldType === 'grid'){
    // 根据对象的子表字段信息，返回子表配置属性
    sub_fields = {};
    each(objectConfig.fields, (fieldItem, key) => {
      const reg = new RegExp(`^${fieldNameForReg}\\.\\$\\.\\\w+$`); //以fieldName开头，且后面接着用.$.号连接下一个字段名
      // if(key.startsWith(`${fieldName}.$.`)){
      if(reg.test(key)){
        // members.users、instances.$._id、sharing.$之类的复合字段中取出最后一个.字段名，但是不匹配$结尾的字段名
        let matches = key.match(/.(\w+)$/g);
        let lastFieldKey = matches && matches[0].replace(".", "");
        if(lastFieldKey){
          sub_fields[lastFieldKey] = getFieldSchema(key, objectConfig);                           
        }
      }
    });
    fieldSchema = Object.assign({}, field, {sub_fields});
  }
  else if(['lookup','master_detail'].indexOf(fieldType)>-1){
    if(field.reference_to === "users"){
      fieldSchema = Object.assign({}, field, {
        reference_to: "space_users",
        reference_to_field: "user"
      });
    }
    else if(field._reference_to){
      // 如果只有_reference_to， 那就给field增加一个reference_to属性。
      let reference_to = safeEval(`(${field._reference_to})`);
      fieldSchema = Object.assign({}, field, {reference_to});
    }
    else{
      fieldSchema = field;
    }
    if(field._filtersFunction || isString(field.filtersFunction) ){
      let filtersFunction = safeEval(`(${field._filtersFunction || field.filtersFunction})`);
      fieldSchema = Object.assign({}, fieldSchema, {filtersFunction});
    }
    if(field._optionsFunction || isString(field.optionsFunction)){
      let optionsFunction = safeEval(`(${field._optionsFunction || field.optionsFunction})`);
      fieldSchema = Object.assign({}, fieldSchema, {optionsFunction});
    }
    if(field._options){
      let options = safeEval(`(${field._options})`);
      fieldSchema = Object.assign({}, fieldSchema, {options});
    }
  }
  else if(fieldType === 'select'){
    if(field._optionsFunction){
      let optionsFunction = safeEval(`(${field._optionsFunction})`);
      fieldSchema = Object.assign({}, field, {optionsFunction});
    }else{
      fieldSchema = field;
    }
    if(field._options){
      let options = safeEval(`(${field._options})`);
      fieldSchema = Object.assign({}, fieldSchema, {options});
    }
  }
  else if(fieldType === 'currency'){
    // 金额类型默认显示2位小数
    if(isNil(field.scale)){
      fieldSchema = Object.assign({}, field, {scale: 2, precision});
    }
    else{
      fieldSchema = Object.assign({}, field, {precision});
    }
  }
  else if(fieldType === 'number'){
    fieldSchema = Object.assign({}, field, {precision});
  }
  else{
    fieldSchema = field;
  }
  // 所有字段如果含有_defaultValue属性就为其添加一个defaultValue属性。
  if(field._defaultValue){
    let defaultValue = safeEval(`(${field._defaultValue})`);
    fieldSchema = Object.assign({}, fieldSchema, {defaultValue});
  }
  else if(typeof field.defaultValue === "string"){
    // _defaultValue属性存在说明defaultValue是一个function，不需要进行公式表达式兼容性转换
    fieldSchema = Object.assign({}, fieldSchema, {defaultValue: getCompatibleDefaultValueExpression(field.defaultValue, field.multiple)});
  }

  if(["autonumber", "formula", "summary"].indexOf(fieldType) > -1){
    fieldSchema.readonly = true;
  }
  return fieldSchema;
}

/**
 * 转换传入的objectConfig中的 object, grid 类型字段，生成 sub_fields 属性，相关函数为字段串格式转换为函数
 * @param objectConfig 对象配置文件中字段所属对象的配置
 * @returns 转换后的fields
 */
 export function getFieldsSchema(objectConfig: any) {
  let fieldsSchema: any = {}
  // console.log("convertFieldsSchema===", objectConfig.name, JSON.stringify(objectConfig.fields));
  each(objectConfig.fields, (field, fieldName) => {
    if(/\w+\.($\.)?(\w+)?/.test(fieldName)){
      // 所有的members.users、instances.$._id、sharing.$之类的复合字段会根据需要自动加到sub_fields中，所以不用再加到fieldsSchema中
      return;
    }
    const fieldSchema = getFieldSchema(fieldName, objectConfig);
    if(fieldSchema){
      fieldsSchema[fieldName] = fieldSchema;
    }
  });
  // console.log("convertFieldsSchema====fieldsSchema===", objectConfig.name, fieldsSchema);
  return fieldsSchema;
}


/**
  视图过虑器需要支持function，后台转成字符串，前台eval成函数
  让过虑器支持两种function方式：
  1. 整个filters为function:
  如：
  filters: ()->
    return [[["object_name","=","project_issues"],'or',["object_name","=","tasks"]]]
  2. filters内的filter.value为function
  如：
  filters: [["object_name", "=", ()->
    return "project_issues"
  ]]
  或
  filters: [{
    "field": "object_name"
    "operation": "="
    "value": ()->
      return "project_issues"
  }]
 */
const getListViewSchema = (listView: any)=>{
  if(listView._filters){
    let filters = safeEval(`(${listView._filters})`);
    return Object.assign({}, listView, {filters});
  }
  else if(isArray(listView.filters)){
    forEach(listView.filters, function(filter: any, _index) {
      if (isArray(filter)) {
        if (filter.length === 4 && isString(filter[2]) && filter[3] === "FUNCTION") {
          filter[2] = safeEval("(" + filter[2] + ")");
          filter.pop();
        }
        if (filter.length === 4 && isString(filter[2]) && filter[3] === "DATE") {
          filter[2] = new Date(filter[2]);
          return filter.pop();
        }
      } else if (isObject(filter) as any) {
        if (isString(filter && filter._value)) {
          return filter.value = safeEval("(" + filter._value + ")");
        } else if (filter._is_date === true) {
          return filter.value = new Date(filter.value);
        }
      }
    });
    return listView;
  }
  else{
    return listView;
  }
}

/**
 * 转换传入的objectConfig中list_views，相关函数为字段串格式转换为函数
 * @param objectConfig 对象配置文件中列表视图所属对象的配置
 * @returns 转换后的list_views
 */
 export function getListViewsSchema(objectConfig: any) {
  let listViewsSchema: any = {}
  each(objectConfig.list_views, (listView, listName) => {
    const listViewSchema = getListViewSchema(listView);
    if(listViewSchema){
      listViewsSchema[listName] = listViewSchema;
    }
  });
  return listViewsSchema;
}

/**
 * 转换传入的objectConfig中form，相关函数为字段串格式转换为函数
 * @param objectConfig 对象配置文件中form所属对象的配置
 * @returns 转换后的form
 */
 export function getFormSchema(objectConfig: any) {
  if(!objectConfig.form){
    return;
  }
  let form: any = safeEval(`(${objectConfig.form})`);
  // 以function开头的即认为是函数表达式，转换成函数，允许前缀为空格或回车符
  // 低代码过来的字符器一般以function anonymous开头，零代码要求以function开头前面允许空格回车
  let regFunction = /^[\s]*function\b/;
  forEach(form, (value, key)=>{
    if(regFunction.test(value)){
      form[key] = safeEval(`(${value})`);
    }
  });
  return form;
}

/**
 * 转换传入的objectConfig中的fields及list_views
 * @param objectConfig 对象配置文件中该字段所属对象的配置
 * @returns 转换后的对象
 */
 export function convertObjectSchema(objectConfig: any) {
  objectConfig.fields = getFieldsSchema(objectConfig);
  // console.log("convertObjectSchema====objectConfig.fields===", objectConfig.name, objectConfig.fields);
  objectConfig.list_views = getListViewsSchema(objectConfig);
  objectConfig.form = getFormSchema(objectConfig);
  // console.log("convertObjectSchema====objectConfig.form===", objectConfig.name, objectConfig.form);
}

export function getObjectOdataExpandFields(object: any,columns: string[]) {
  var expand_fields, fields:[];
  expand_fields = [];
  fields = object.fields;
  if (!columns || columns.length ==0) {
    columns = keys(fields);
  }
  each(columns,(n)=>{
    var ref1, ref2;
    if(fields){
      if (((ref1 = fields[n]) != null ? ref1.type : void 0) === "master_detail" || ((ref2 = fields[n]) != null ? ref2.type : void 0) === "lookup") {
        return expand_fields.push(n)
      }
    }
  })
  return expand_fields.join(",");
}

export function convertRecordsForLookup(data, fieldsSchema) {
  /* TODO: lookup组件中reference_to是数组时，初始化值需要 {o:'contract_types',ids:['fcxTeWMEvgdMQnvwZ'],labels:["合同分类1"]} 这种格式，
  故 将以下格式转换下。
  contracts_reference_to_func: {
    "reference_to._o": "contract_types",
    "reference_to.o": "contract_types",
    '_NAME_FIELD_VALUE': "合同分类1",
    '_id': "fcxTeWMEvgdMQnvwZ"
  }, 
  当lookup组件中 reference_to不是数组，初始化值需要 string || [] ; 也就是 '_id' 的值。
  */
  let recoreds=data && data.value;
  if(recoreds && recoreds.length){
    data.value = recoreds.map((record: any)=>{
      each(record, (fieldValue, key)=>{
        if(fieldValue){
          const fieldSchema = fieldsSchema && fieldsSchema[key];
          if(fieldSchema && ['lookup', 'master_detail'].indexOf(fieldSchema.type) > -1 && fieldSchema.reference_to){
            let fieldReferenceTo :any;
            if(fieldSchema.reference_to){
              fieldReferenceTo=fieldSchema.reference_to;
              if(isFunction(fieldReferenceTo)){
                fieldReferenceTo = fieldReferenceTo();
              }
            }
            if(fieldReferenceTo && fieldReferenceTo.length){
              if(!isArray(fieldValue)){
                fieldValue=[fieldValue];
              }
              let referenceTo:any, ids=[], labels=[];
              
              forEach(fieldValue,(val)=>{
                referenceTo=val['reference_to.o'];
                if(referenceTo){
                  const id = val["_id"];
                  const label = val["_NAME_FIELD_VALUE"];
                  if(id){
                    ids.push(id)
                  }
                  if(label){
                    labels.push(label)
                  }
                }
              })
              if(referenceTo){
                if( isArray(fieldReferenceTo)){
                  record[key].o = referenceTo;
                  if(ids && ids.length){
                    record[key].ids = ids;
                  }
                  if(labels && labels.length){
                    record[key].labels = labels;
                  }
                  delete record[key]["reference_to._o"];
                  delete record[key]["reference_to.o"];
                  delete record[key]._NAME_FIELD_VALUE;
                  delete record[key]._id;
                }else{
                  record[key] = fieldSchema.multiple ? ids : ids[0];
                }
              }
            }
          }
        }
      });
      return record;
    });
  }
  return data;
}
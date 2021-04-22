import _ from 'lodash';

export function isRecentListView(listViewName: string) {
  return listViewName === "recent"
}

/*
  从columns参数中过滤出用于手机端显示的columns
	规则：
	1.优先把columns中的name字段排在第一个
	2.最多只返回4个字段
	3.考虑宽字段占用整行规则条件下，最多只返回两行
 */
export function pickObjectMobileColumns(objectSchema: any, columns: []) {
  // TODO:需要把Creator.pickObjectMobileColumns函数逻辑带过来
  return columns;
};

export function getObjectDefaultView(objectSchema: any) {
  // 原来Creator.getObjectDefaultView函数逻辑
  // TODO:待切换视图功能完成后应该需要改为默认取第一个视图
  const listViews = objectSchema.list_views;
  return _.find(listViews, function(listView, key) {
    return listView.name === "all" || key === "all";
  });
}

export function getObjectDefaultExtraColumns(objectSchema: any){
  // 原来getObjectDefaultExtraColumns函数逻辑
	const defaultView = getObjectDefaultView(objectSchema)
	return defaultView && defaultView.extra_columns
}

export function getObjectExtraColumns(objectSchema: any, relatedObjectApiName: string){
  // 原来_getExtraColumns函数逻辑
  let extra_columns = _.intersection(["owner", "company_id", "company_ids", "locked"], _.keys(objectSchema.fields));
	if(!relatedObjectApiName && objectSchema.enable_tree){
		extra_columns.push("parent")
		extra_columns.push("children")
  }
	let defaultExtraColumns = getObjectDefaultExtraColumns(objectSchema)
	if(defaultExtraColumns){
		extra_columns = _.union(extra_columns, defaultExtraColumns);
  }
	return extra_columns
}

export function getObjectDepandOnFields(objectSchema: any, columns: any){
	// 原来_depandOnFields函数逻辑
	const fields = objectSchema.fields
	let depandOnFields = []
	_.each(columns, (column)=>{
    const dependOn = fields[column] && fields[column].depend_on;
		if(dependOn){
			depandOnFields = _.union(depandOnFields, dependOn);
    }
  });
	return depandOnFields
}

export function unionSelectColumnsWithExtraAndDepandOn(objectSchema: any, columns: any, relatedObjectApiName: string){
	// 原来Creator.unionSelectColumnsWithExtraAndDepandOn函数逻辑
  // # extra_columns不需要显示在表格上
	const extra_columns = getObjectExtraColumns(objectSchema, relatedObjectApiName)
	let selectColumns = _.union(columns, extra_columns)
	selectColumns = _.union(selectColumns, getObjectDepandOnFields(objectSchema, selectColumns))
	return selectColumns
}

export function removeCurrentRelatedColumns(objectSchema: any, columns: any, relatedObjectApiName: string) {
	// 移除主键字段，即columns中的reference_to等于object_name的字段
  // TODO: 任务，附件，日程等子表列表还是没有移除，原来1.23就一直是有问题的
  const fields = objectSchema.fields;
  if (relatedObjectApiName) {
    columns = columns.filter(function(n: string) {
      const field = fields[n];
      if (field && field?.type == "master_detail") {
        if (field.multiple) {
          return true;
        }
        let referenceTo = field.reference_to;
        if (referenceTo) {
          if (_.isFunction(referenceTo)) {
            referenceTo = referenceTo();
          }
        }
        if (_.isArray(referenceTo)) {
          return true;
        } else {
          return referenceTo !== relatedObjectApiName;
        }
      } else {
        return true;
      }
    });
  }
  
  return columns;
};

export function getListviewColumns(objectSchema: any, listName: string, relatedObjectApiName: string, isMobile: boolean) {
	// 原来Creator.getListviewColumns函数逻辑
  const listView = objectSchema.list_views[listName];
  let columns = listView && listView.columns

  if (isMobile) {
    const mobileColumns = listView && listView.mobile_columns
    if (mobileColumns) {
      columns = mobileColumns;
    } else {
      const defaultView = getObjectDefaultView(objectSchema);
      const defaultMobileColumns = defaultView && defaultView.mobile_columns
      if (defaultMobileColumns) {
        columns = defaultMobileColumns;
      } else if (columns) {
        columns = pickObjectMobileColumns(objectSchema, columns);
      }
    }
  }

  columns = columns.map(function(column: any) {
    var n: string;
    if (_.isObject(column)) {
      n = (column as any).field;
    } else {
      n = column;
    }
    if (objectSchema.fields[n]) {
      return n;
    } else {
      return undefined;
    }
  });

  if (objectSchema.name === "cms_files") {
		// 附件列表需要这个字段判断权限
    columns.push("parent");
  }
  columns = _.compact(columns)
  columns = removeCurrentRelatedColumns(objectSchema, columns, relatedObjectApiName)
  return columns;
}





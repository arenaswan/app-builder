import { values } from "mobx"
import { types, getParent, flow } from "mobx-state-tree"
import { API } from './API';
import { getObjectOdataExpandFields ,convertRecordsForLookup} from './utils/index'
import { without } from 'lodash';

const RECORD_CACHE_TTL = 60 * 1000;

export const RecordCache = types.model({
  id: types.identifier, //记录ID
  objectApiName: types.string,
  fields: types.array(types.string),
  data: types.frozen(),
  permissions: types.frozen(),
  isLoading: true,
  expires: types.number
})
.actions((self) => {

  const loadRecord = flow(function* loadRecord() {
    try {
      const filters = ['_id', '=', self.id]
      // const object = Objects.getObject(self.objectApiName);
      // const objectSchema = object.schema;
      // const expand = getObjectOdataExpandFields(objectSchema, self.fields)
      // 添加 expand 参数
      // const dataResult = yield API.requestRecords(self.objectApiName, filters, self.fields, {expand})
      // lookup组件reference_to是否是数组 的初始化值 的转换。
      // self.data = convertRecordsForLookup(dataResult, objectSchema.fields)
      self.data = yield API.requestRecord(self.objectApiName, self.id, self.fields)

      self.permissions = yield API.requestRecordPermissions(self.objectApiName, self.id);
      self.isLoading = false
    } catch (err) {
      self.isLoading = false
      console.error(`Failed to load record ${self.id} `, err)
    }
  });

  const deleteRecord = flow(function* deleteRecord() {
    try {
      return yield API.deleteRecord(self.objectApiName, self.id);
      self.isLoading = false
    } catch (err) {
      console.error(`Failed to delete record ${self.id} `, err)
    }
  });

  return {
    loadRecord,
    deleteRecord
  }
});

export const RecordListCache = types.model({
  id: types.identifier, //请求的filters, fields
  objectApiName: types.string,
  filters: types.string,
  fields: types.array(types.string),
  options: types.union(types.string, types.undefined),
  recordsJson: types.string,
  isLoading: true,
})
.views((self) => ({
  get data() {
    if (!self.recordsJson)
      return null
    return JSON.parse(self.recordsJson)
  },
}))
.actions((self) => {
  const loadRecords = flow(function* loadRecords() {
    try {
      const filters = JSON.parse(self.filters);
      const options = self.options ? JSON.parse(self.options) : undefined;
      const json = yield API.requestRecords(self.objectApiName, filters, self.fields, options)
      self.recordsJson = JSON.stringify(json)
      self.isLoading = false
    } catch (err) {
      self.isLoading = false;
      console.error(`Failed to load record ${self.id} `, err)
    }
  })

  return {
    loadRecords,
  }
});

export const ObjectModel = types.model({
  id: types.identifier, // object_api_name
  schema: types.frozen(),
  recordCaches: types.map(RecordCache),
  recordListCaches: types.map(RecordListCache),
  isLoading: true
})
.actions((self) => {

  const loadObject = flow(function* loadObject() {
    try {
      self.schema = yield API.requestObject(self.id)
      self.isLoading = false
      // TODO: 可能会有隐藏的bug。
      const Creator = window.Creator;
      Creator.Objects[self.id] = self.schema;
      return self
    } catch (err) {
      self.isLoading = false
      console.error(`Failed to load object ${self.id} `, err)
    }
  })

  const getRecord = (recordId: string, fields: string[]) => {
    if (!recordId)
      return null;
    const record = self.recordCaches.get(recordId)
    const recordFields = record?.fields || []
    if (record && record.expires > (new Date()).getTime() && without(fields, ...recordFields).length == 0)
      return record
    const newRecord = RecordCache.create({
      id: recordId,
      objectApiName: self.id,
      fields,
      data: {},
      isLoading: true,
      expires: new Date().getTime() + RECORD_CACHE_TTL
    })
    self.recordCaches.put(newRecord);
    newRecord.loadRecord();
    return newRecord
  }

  const reloadRecord = (recordId: string) => {
    if (!recordId)
      return null;
    const record = self.recordCaches.get(recordId);
    record?.loadRecord();
  }

  const deleteRecord = (recordId: string)=>{
    if (!recordId){
      return null;
    }
    const record = self.recordCaches.get(recordId)
    if (record){
      record.deleteRecord();
      self.recordCaches.delete(recordId)
    }
  }

  const getRecordList = (filters: any, fields: any, options?) => {
    const stringifyFilters = JSON.stringify(filters);
    const stringifyFields = JSON.stringify(fields);
    const stringifyOptions = options ? JSON.stringify(options) : "";
    const recordListId = stringifyFilters;
    const recordList = self.recordListCaches.get(recordListId)
    if (recordList)
      return recordList
    
    const newRecordList = RecordListCache.create({
      id: recordListId,
      objectApiName: self.id,
      filters: stringifyFilters,
      fields,
      options: stringifyOptions,
      recordsJson: '',
      isLoading: true
    })
    self.recordListCaches.put(newRecordList);
    newRecordList.loadRecords();
    return newRecordList
  }

  const getPermissions = ()=>{
    const Creator = window.Creator;
    if(Creator && Creator.getPermissions){
      return Creator.getPermissions(self.id);
    }
    else{
      return self.schema?.permissions;
    }
  }

  return {
    loadObject,
    getRecord,
    reloadRecord,
    deleteRecord,
    getRecordList,
    getPermissions
  }
})

export const Objects = types.model({
  objects: types.optional(types.map(ObjectModel), {})
})
.actions((self) => {
  const getObject = (objectApiName: string)=>{
    if (!objectApiName)
      return null;
    const object = self.objects.get(objectApiName) 
    if (object) {
      return object
    }
    const newObject = ObjectModel.create({
      id: objectApiName,
      schema: {},
      isLoading: true
    })
    self.objects.put(newObject);
    newObject.loadObject();
    return newObject
  }
  const reloadObject = (objectApiName: string)=>{
    const object = getObject(objectApiName);
    if(object){
      object.loadObject();
    }
  }
  return {
    getObject,
    reloadObject
  }
}).create()

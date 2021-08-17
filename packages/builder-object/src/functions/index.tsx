import * as modal from './modal'
import { Tables, Objects } from '@steedos/builder-store';
import * as render from './render'
export * from './modal'
export * from './render'

const SteedosUI = Object.assign({}, modal, render, {
  getTableSelectedRows(id: string = "default"){
    return Tables.loadById(id).getSelectedRows();
  },
  clearTableSelectedRows(id: string = "default"){
    return Tables.loadById(id).clearSelectedRows();
  },
  reloadRecord(objectApiName: string, id: string){
    Objects.getObject(objectApiName).reloadRecord(id)
  },
  reloadObject(objectApiName: string){
    const object = Objects.getObject(objectApiName);
    object && object.loadObject()
  },
});

if(!window.SteedosUI){
  window.SteedosUI = SteedosUI;
}
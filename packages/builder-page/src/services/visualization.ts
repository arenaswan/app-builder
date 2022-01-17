import { API, Objects } from '@steedos-ui/builder-store';
import { } from 'lodash';
const CHART_OBJECT_APINAME ='charts';

const saveOrCreateUrl = data => (data.id ? `api/visualizations/${data.id}` : "api/visualizations");
//TDOO
const Visualization = {
  save: (data) => {
    if(data.id){
      let doc: any = {type: data.type, label: data.label, name: data.name, options: data.options, description: data.description, query: data.query_id};
      return API.updateRecord(CHART_OBJECT_APINAME, data.id, doc)
    }else{
      let doc: any = {type: data.type, label: data.label, name: data.name, options: data.options, description: data.description, query: data.query_id};
      return API.insertRecord(CHART_OBJECT_APINAME, doc)
    }
    // return API.client.doFetch(saveOrCreateUrl(data), {method: 'post', body: JSON.stringify(data)})
  },
  delete: data => API.deleteRecord(CHART_OBJECT_APINAME, data.id),
};

export default Visualization;

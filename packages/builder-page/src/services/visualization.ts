import { API } from '@steedos/builder-store';

const saveOrCreateUrl = data => (data.id ? `api/visualizations/${data.id}` : "api/visualizations");
//TDOO
const Visualization = {
  save: data => API.client.doFetch(saveOrCreateUrl(data), {method: 'post', body: JSON.stringify(data)}),
  delete: data => API.client.doFetch(`api/visualizations/${data.id}`, {method: 'post', body: JSON.stringify(data)}),
};

export default Visualization;

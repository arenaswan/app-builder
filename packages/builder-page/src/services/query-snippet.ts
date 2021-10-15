import { axios } from "./axios";
import { extend, map } from "lodash";

class QuerySnippet {
  constructor(querySnippet) {
    extend(this, querySnippet);
  }

  getSnippet() {
    let name = (this as any).trigger;
    if ((this as any).description !== "") {
      name = `${(this as any).trigger}: ${(this as any).description}`;
    }

    return {
      name,
      content: (this as any).snippet,
      tabTrigger: (this as any).trigger,
    };
  }
}

const getQuerySnippet = querySnippet => new QuerySnippet(querySnippet);

const QuerySnippetService = {
  get: data => axios.get(`/service/api/~packages-@steedos/service-charts/query_snippets/${data.id}`).then(getQuerySnippet),
  query: () => axios.get("/service/api/~packages-@steedos/service-charts/query_snippets").then(data => map(data, getQuerySnippet)),
  create: data => axios.post("/service/api/~packages-@steedos/service-charts/query_snippets", data).then(getQuerySnippet),
  save: data => axios.post(`/service/api/~packages-@steedos/service-charts/query_snippets/${data.id}`, data).then(getQuerySnippet),
  delete: data => axios.delete(`/service/api/~packages-@steedos/service-charts/query_snippets/${data.id}`),
};

export default QuerySnippetService;

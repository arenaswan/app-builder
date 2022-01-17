import { flow, types } from "mobx-state-tree";
import { API } from './API';
import { each, keys} from 'lodash';

const RECORD_CACHE_TTL = 60 * 1000;

export const WidgetsModel = types.model({
    _id: types.identifier,
    name: types.maybeNull(types.string),
    page: types.maybeNull(types.string),
    type: types.maybeNull(types.string),
    visualization: types.maybeNull(types.string),
    options: types.frozen(),
})

export const PageCacheModel = types.model({
    _id: types.maybeNull(types.string),
    name: types.maybeNull(types.string),
    dashboard_filters_enabled: types.maybeNull(types.boolean),
    is_archived: types.maybeNull(types.boolean),
    is_draft: types.maybeNull(types.boolean),
    is_favorite: types.maybeNull(types.boolean),
    can_edit: types.maybeNull(types.boolean),
    layout: types.frozen(),
    public_url: types.maybeNull(types.string),
    updated_at: types.maybeNull(types.Date),
    tags: types.frozen(),
    user: types.frozen(),
    uper_id: types.maybeNull(types.string),
    widgets: types.optional(types.map(WidgetsModel), {}),
})

export const PageModel = types.model({
    id: types.identifier,
    isLoading: true,
    data: types.frozen(),
    expires: types.number
}).actions((self) => {
    const loadPage = flow(function* loadPage() {
      try {
        self.data = yield API.client.doFetch(API.client.getUrl() + `/service/api/~packages-@steedos/service-pages/page/${self.id}`, { method: 'get' });
        self.isLoading = false
      } catch (err) {
        console.error(`Failed to load record ${self.id} `, err)
      }
    });
    return {
        loadPage
    }
  });

export const Pages = types.model({
    pages: types.optional(types.map(PageModel), {})
}).actions((self) => {
    const getPage = (pageId) => {
        if (!pageId)
          return null;
        const record = self.pages.get(pageId)
        if (record && record.expires > (new Date()).getTime())
          return record
        const newRecord = PageModel.create({
          id: pageId,
          data: {},
          isLoading: true,
          expires: new Date().getTime() + RECORD_CACHE_TTL
        })
        self.pages.put(newRecord);
        newRecord.loadPage();
        return newRecord
    }
    return {
        getPage
    }
}).create()

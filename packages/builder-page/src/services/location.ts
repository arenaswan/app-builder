import { isNil, isUndefined, isFunction, isObject, trimStart, mapValues, omitBy, extend } from "lodash";
import qs from "query-string";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

function normalizeLocation(rawLocation) {
  const { pathname, search, hash } = rawLocation;
  const result: any = {};

  result.path = pathname;
  result.search = mapValues(qs.parse(search), value => (isNil(value) ? true : value));
  result.hash = trimStart(hash, "#");
  result.url = `${pathname}${search}${hash}`;

  return result;
}

const location = {
  listen(handler) {
    if (isFunction(handler)) {
      return history.listen((unused, action) => handler(location, action));
    } else {
      return () => {};
    }
  },

  confirmChange(handler) {
    if (isFunction(handler) && false) {
      console.log(`history.block`, handler)
      return history.block(nextLocation => {
        return handler(normalizeLocation(nextLocation), location);
      });
    } else {
      return () => {};
    }
  },

  update(newLocation: any, replace = false) {

    if(typeof (window as any).Meteor != 'undefined'){
      return ;
    }

    if (isObject(newLocation)) {
      // remap fields and remove undefined ones
      newLocation = omitBy(
        {
          pathname: (newLocation as any).path,
          search: (newLocation as any).search,
          hash: (newLocation as any).hash,
        },
        isUndefined
      );

      // keep existing fields (!)
      newLocation = extend(
        {
          pathname: location.path,
          search: location.search,
          hash: location.hash,
        },
        newLocation
      );

      // serialize search and keep existing search parameters (!)
      if (isObject(newLocation.search)) {
        newLocation.search = omitBy(extend({}, location.search, newLocation.search), isNil);
        newLocation.search = mapValues(newLocation.search, value => (value === true ? null : value));
        newLocation.search = qs.stringify(newLocation.search);
      }
    }
    if (replace) {
      history.replace(newLocation);
    } else {
      history.push(newLocation);
    }
  },

  url: undefined,

  path: undefined,
  setPath(path, replace = false) {
    location.update({ path }, replace);
  },

  search: undefined,
  setSearch(search, replace = false) {
    location.update({ search }, replace);
  },

  hash: undefined,
  setHash(hash, replace = false) {
    location.update({ hash }, replace);
  },
};

function locationChanged() {
  extend(location, normalizeLocation(history.location));
}

history.listen(locationChanged);
locationChanged(); // init service
(window as any).__location = location;
export default location;

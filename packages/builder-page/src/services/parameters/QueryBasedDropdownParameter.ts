import { isNull, isUndefined, isArray, isEmpty, get, map, join, has } from "lodash";
import { Query } from "../../services/query";
import Parameter from "./Parameter";

class QueryBasedDropdownParameter extends Parameter {
  constructor(parameter, parentQueryId) {
    super(parameter, parentQueryId);
    (this as any).queryId = parameter.queryId;
    (this as any).multiValuesOptions = parameter.multiValuesOptions;
    this.setValue(parameter.value);
  }

  normalizeValue(value) {
    if (
      isUndefined(value) ||
      isNull(value) ||
      (isArray(value) && isEmpty(value))
    ) {
      return null;
    }

    if ((this as any).multiValuesOptions) {
      value = isArray(value) ? value : [value];
    } else {
      value = isArray(value) ? value[0] : value;
    }
    return value;
  }

  getExecutionValue(extra: any = {}) {
    const { joinListValues } = extra;
    if (joinListValues && isArray((this as any).value)) {
      const separator = get((this as any).multiValuesOptions, "separator", ",");
      const prefix = get((this as any).multiValuesOptions, "prefix", "");
      const suffix = get((this as any).multiValuesOptions, "suffix", "");
      const parameterValues = map(
        (this as any).value,
        (v) => `${prefix}${v}${suffix}`
      );
      return join(parameterValues, separator);
    }
    return (this as any).value;
  }

  toUrlParams() {
    const prefix = (this as any).urlPrefix;

    let urlParam = (this as any).value;
    if ((this as any).multiValuesOptions && isArray((this as any).value)) {
      urlParam = JSON.stringify((this as any).value);
    }

    return {
      [`${prefix}${(this as any).name}`]: !this.isEmpty ? urlParam : null,
    };
  }

  fromUrlParams(query) {
    const prefix = (this as any).urlPrefix;
    const key = `${prefix}${(this as any).name}`;
    if (has(query, key)) {
      if ((this as any).multiValuesOptions) {
        try {
          const valueFromJson = JSON.parse(query[key]);
          this.setValue(isArray(valueFromJson) ? valueFromJson : query[key]);
        } catch (e) {
          this.setValue(query[key]);
        }
      } else {
        this.setValue(query[key]);
      }
    }
  }

  loadDropdownValues() {
    if ((this as any).parentQueryId) {
      return Query.associatedDropdown({
        queryId: (this as any).parentQueryId,
        dropdownQueryId: (this as any).queryId,
      }).catch(() => Promise.resolve([]));
    }

    return Query.asDropdown({ id: (this as any).queryId }).catch(
      Promise.resolve([])
    );
  }
}

export default QueryBasedDropdownParameter;

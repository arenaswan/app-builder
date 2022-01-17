import { isArray, isEmpty, includes, intersection, get, map, join, has } from "lodash";
import Parameter from "./Parameter";

class EnumParameter extends Parameter {
  constructor(parameter, parentQueryId) {
    super(parameter, parentQueryId);
    (this as any).enumOptions = parameter.enumOptions;
    (this as any).multiValuesOptions = parameter.multiValuesOptions;
    (this as any).setValue(parameter.value);
  }

  normalizeValue(value) {
    if (isEmpty((this as any).enumOptions)) {
      return null;
    }

    const enumOptionsArray = (this as any).enumOptions.split("\n") || [];
    if ((this as any).multiValuesOptions) {
      if (!isArray(value)) {
        value = [value];
      }
      value = intersection(value, enumOptionsArray);
    } else if (!value || isArray(value) || !includes(enumOptionsArray, value)) {
      value = enumOptionsArray[0];
    }

    if (isArray(value) && isEmpty(value)) {
      return null;
    }
    return value;
  }

  getExecutionValue(extra = {}) {
    const { joinListValues } = extra as any;
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
      [`${prefix}${(this as any).name}`]: !(this as any).isEmpty
        ? urlParam
        : null,
    };
  }

  fromUrlParams(query) {
    const prefix = (this as any).urlPrefix;
    const key = `${prefix}${(this as any).name}`;
    if (has(query, key)) {
      if ((this as any).multiValuesOptions) {
        try {
          const valueFromJson = JSON.parse(query[key]);
          (this as any).setValue(
            isArray(valueFromJson) ? valueFromJson : query[key]
          );
        } catch (e) {
          (this as any).setValue(query[key]);
        }
      } else {
        (this as any).setValue(query[key]);
      }
    }
  }
}

export default EnumParameter;

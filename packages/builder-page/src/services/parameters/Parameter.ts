import { isNull, isObject, isFunction, isUndefined, isEqual, has, omit, isArray, each } from "lodash";

class Parameter {
  constructor(parameter, parentQueryId) {
    console.log(`start parameter, parentQueryId`, parameter, parentQueryId);
    (this as any).title = parameter.title;
    (this as any).name = parameter.name;
    (this as any).type = parameter.type;
    (this as any).global = parameter.global; // backward compatibility in Widget service
    (this as any).parentQueryId = parentQueryId;

    // Used for meta-parameters (i.e. dashboard-level params)
    (this as any).locals = [];

    // Used for URL serialization
    (this as any).urlPrefix = "p_";
    console.log(
      `Parameter end。。。。`,
      (this as any).title,
      (this as any).type
    );
  }

  static getExecutionValue(param: any, extra = {}) {
    if (!isObject(param) || !isFunction((param as any).getExecutionValue)) {
      return null;
    }

    return (param as any).getExecutionValue(extra);
  }

  static setValue(param, value) {
    if (!isObject(param) || !isFunction((param as any).setValue)) {
      return null;
    }

    return (param as any).setValue(value);
  }

  get isEmpty() {
    return isNull(this.normalizedValue);
  }

  get hasPendingValue() {
    return (
      (this as any).pendingValue !== undefined &&
      !isEqual((this as any).pendingValue, this.normalizedValue)
    );
  }

  /** Get normalized value to be used in inputs */
  get normalizedValue() {
    return (this as any).$$value;
  }

  isEmptyValue(value) {
    return isNull(this.normalizeValue(value));
  }

  // eslint-disable-next-line class-methods-use-this
  normalizeValue(value) {
    if (isUndefined(value)) {
      return null;
    }
    return value;
  }

  updateLocals() {
    if (isArray((this as any).locals)) {
      each((this as any).locals, (local) => {
        local.setValue((this as any).value);
      });
    }
  }

  setValue(value) {
    const normalizedValue = this.normalizeValue(value);
    (this as any).value = normalizedValue;
    (this as any).$$value = normalizedValue;

    this.updateLocals();
    this.clearPendingValue();
    return this;
  }

  /** Get execution value for a query */
  getExecutionValue() {
    return (this as any).value;
  }

  setPendingValue(value) {
    (this as any).pendingValue = this.normalizeValue(value);
  }

  applyPendingValue() {
    if (this.hasPendingValue) {
      this.setValue((this as any).pendingValue);
    }
  }

  clearPendingValue() {
    (this as any).pendingValue = undefined;
  }

  /** Update URL with Parameter value */
  toUrlParams() {
    const prefix = (this as any).urlPrefix;
    // `null` removes the parameter from the URL in case it exists
    return {
      [`${prefix}${(this as any).name}`]: !this.isEmpty
        ? (this as any).value
        : null,
    };
  }

  /** Set parameter value from the URL */
  fromUrlParams(query) {
    const prefix = (this as any).urlPrefix;
    const key = `${prefix}${(this as any).name}`;
    if (has(query, key)) {
      this.setValue(query[key]);
    }
  }

  toQueryTextFragment() {
    return `{{ ${(this as any).name} }}`;
  }

  /** Get a saveable version of the Parameter by omitting unnecessary props */
  toSaveableObject() {
    return omit(this, [
      "$$value",
      "urlPrefix",
      "pendingValue",
      "parentQueryId",
    ]);
  }
}

export default Parameter;

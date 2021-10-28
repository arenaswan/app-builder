import { startsWith, has, includes, findKey, values, isObject, isArray } from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import Parameter from "./Parameter";

const DATETIME_FORMATS = {
  "date-range": "YYYY-MM-DD",
  "datetime-range": "YYYY-MM-DD HH:mm",
  "datetime-range-with-seconds": "YYYY-MM-DD HH:mm:ss",
};

const DYNAMIC_PREFIX = "d_";

/**
 * Dynamic date range preset value with end set to current time
 * @param from {function(): moment.Moment}
 * @param now {function(): moment.Moment=} moment - defaults to now
 * @returns {function(withNow: boolean): [moment.Moment, moment.Moment|undefined]}
 */
const untilNow = (from, now = () => moment()) => (withNow = true) => [from(), withNow ? now() : undefined];

const DYNAMIC_DATE_RANGES = {
  today: {
    name: "Today",
    value: () => [moment().startOf("day"), moment().endOf("day")],
  },
  yesterday: {
    name: "Yesterday",
    value: () => [
      moment()
        .subtract(1, "day")
        .startOf("day"),
      moment()
        .subtract(1, "day")
        .endOf("day"),
    ],
  },
  this_week: {
    name: "This week",
    value: () => [moment().startOf("week"), moment().endOf("week")],
  },
  this_month: {
    name: "This month",
    value: () => [moment().startOf("month"), moment().endOf("month")],
  },
  this_year: {
    name: "This year",
    value: () => [moment().startOf("year"), moment().endOf("year")],
  },
  last_week: {
    name: "Last week",
    value: () => [
      moment()
        .subtract(1, "week")
        .startOf("week"),
      moment()
        .subtract(1, "week")
        .endOf("week"),
    ],
  },
  last_month: {
    name: "Last month",
    value: () => [
      moment()
        .subtract(1, "month")
        .startOf("month"),
      moment()
        .subtract(1, "month")
        .endOf("month"),
    ],
  },
  last_year: {
    name: "Last year",
    value: () => [
      moment()
        .subtract(1, "year")
        .startOf("year"),
      moment()
        .subtract(1, "year")
        .endOf("year"),
    ],
  },
  last_hour: {
    name: "Last hour",
    value: untilNow(() => moment().subtract(1, "hour")),
  },
  last_8_hours: {
    name: "Last 8 hours",
    value: untilNow(() => moment().subtract(8, "hour")),
  },
  last_24_hours: {
    name: "Last 24 hours",
    value: untilNow(() => moment().subtract(24, "hour")),
  },
  last_7_days: {
    name: "Last 7 days",
    value: untilNow(
      () =>
        moment()
          .subtract(7, "days")
          .startOf("day"),
      () => moment().endOf("day")
    ),
  },
  last_14_days: {
    name: "Last 14 days",
    value: untilNow(
      () =>
        moment()
          .subtract(14, "days")
          .startOf("day"),
      () => moment().endOf("day")
    ),
  },
  last_30_days: {
    name: "Last 30 days",
    value: untilNow(
      () =>
        moment()
          .subtract(30, "days")
          .startOf("day"),
      () => moment().endOf("day")
    ),
  },
  last_60_days: {
    name: "Last 60 days",
    value: untilNow(
      () =>
        moment()
          .subtract(60, "days")
          .startOf("day"),
      () => moment().endOf("day")
    ),
  },
  last_90_days: {
    name: "Last 90 days",
    value: untilNow(
      () =>
        moment()
          .subtract(90, "days")
          .startOf("day"),
      () => moment().endOf("day")
    ),
  },
  last_12_months: {
    name: "Last 12 months",
    value: untilNow(
      () =>
        moment()
          .subtract(12, "months")
          .startOf("day"),
      () => moment().endOf("day")
    ),
  },
};

export const DynamicDateRangeType = PropTypes.oneOf(values(DYNAMIC_DATE_RANGES));

export function isDynamicDateRangeString(value) {
  if (!startsWith(value, DYNAMIC_PREFIX)) {
    return false;
  }
  return !!DYNAMIC_DATE_RANGES[value.substring(DYNAMIC_PREFIX.length)];
}

export function getDynamicDateRangeStringFromName(dynamicRangeName) {
  const key = findKey(DYNAMIC_DATE_RANGES, range => range.name === dynamicRangeName);
  return key ? DYNAMIC_PREFIX + key : undefined;
}

export function isDynamicDateRange(value) {
  return includes(DYNAMIC_DATE_RANGES, value);
}

export function getDynamicDateRangeFromString(value) {
  if (!isDynamicDateRangeString(value)) {
    return null;
  }
  return DYNAMIC_DATE_RANGES[value.substring(DYNAMIC_PREFIX.length)];
}

class DateRangeParameter extends Parameter {
  constructor(parameter, parentQueryId) {
    super(parameter, parentQueryId);
    this.setValue(parameter.value);
  }

  get hasDynamicValue() {
    return isDynamicDateRange((this as any).normalizedValue);
  }

  // eslint-disable-next-line class-methods-use-(this as any)
  normalizeValue(value) {
    if (isDynamicDateRangeString(value)) {
      return getDynamicDateRangeFromString(value);
    }

    if (isDynamicDateRange(value)) {
      return value;
    }

    if (isObject(value) && !isArray(value)) {
      value = [(value as any).start, (value as any).end];
    }

    if (isArray(value) && value.length === 2) {
      value = [moment(value[0]), moment(value[1])];
      if (value[0].isValid() && value[1].isValid()) {
        return value;
      }
    }
    return null;
  }

  setValue(value) {
    const normalizedValue = (this as any).normalizeValue(value);
    if (isDynamicDateRange(normalizedValue)) {
      (this as any).value =
        DYNAMIC_PREFIX + findKey(DYNAMIC_DATE_RANGES, normalizedValue);
    } else if (isArray(normalizedValue)) {
      (this as any).value = {
        start: normalizedValue[0].format(DATETIME_FORMATS[(this as any).type]),
        end: normalizedValue[1].format(DATETIME_FORMATS[(this as any).type]),
      };
    } else {
      (this as any).value = normalizedValue;
    }
    (this as any).$$value = normalizedValue;

    (this as any).updateLocals();
    (this as any).clearPendingValue();
    return this as any;
  }

  getExecutionValue() {
    if ((this as any).hasDynamicValue) {
      const format = (date) =>
        date.format(DATETIME_FORMATS[(this as any).type]);
      const [start, end] = (this as any).normalizedValue.value().map(format);
      return { start, end };
    }
    return (this as any).value;
  }

  toUrlParams() {
    const prefix = (this as any).urlPrefix;
    if (
      isObject((this as any).value) &&
      ((this as any).value as any).start &&
      ((this as any).value as any).end
    ) {
      return {
        [`${prefix}${(this as any).name}`]: `${
          ((this as any).value as any).start
        }--${((this as any).value as any).end}`,
      };
    }
    return super.toUrlParams();
  }

  fromUrlParams(query) {
    const prefix = (this as any).urlPrefix;
    const key = `${prefix}${(this as any).name}`;

    // backward compatibility
    const keyStart = `${prefix}${(this as any).name}.start`;
    const keyEnd = `${prefix}${(this as any).name}.end`;

    if (has(query, key)) {
      const dates = query[key].split("--");
      if (dates.length === 2) {
        (this as any).setValue(dates);
      } else {
        (this as any).setValue(query[key]);
      }
    } else if (has(query, keyStart) && has(query, keyEnd)) {
      (this as any).setValue([query[keyStart], query[keyEnd]]);
    }
  }

  toQueryTextFragment() {
    return `{{ ${(this as any).name}.start }} {{ ${(this as any).name}.end }}`;
  }
}

export default DateRangeParameter;

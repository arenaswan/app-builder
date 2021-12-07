import React from "react";
import PropTypes from "prop-types";
import { includes } from "lodash";
import { getDynamicDateRangeFromString } from "../../services/parameters/DateRangeParameter";
import DynamicDateRangePicker from "./DynamicDateRangePicker";

const DYNAMIC_DATE_OPTIONS = [
  {
    name: "本周",//This week
    value: getDynamicDateRangeFromString("d_this_week"),
    label: () =>
      getDynamicDateRangeFromString("d_this_week")
        .value()[0]
        .format("MMM D") +
      " - " +
      getDynamicDateRangeFromString("d_this_week")
        .value()[1]
        .format("MMM D"),
  },
  {
    name: "本月",//This month
    value: getDynamicDateRangeFromString("d_this_month"),
    label: () =>
      getDynamicDateRangeFromString("d_this_month")
        .value()[0]
        .format("MMMM"),
  },
  {
    name: "今年",//This year
    value: getDynamicDateRangeFromString("d_this_year"),
    label: () =>
      getDynamicDateRangeFromString("d_this_year")
        .value()[0]
        .format("YYYY"),
  },
  {
    // name: "Last week",
    name: "上周",
    value: getDynamicDateRangeFromString("d_last_week"),
    label: () =>
      getDynamicDateRangeFromString("d_last_week")
        .value()[0]
        .format("MMM D") +
      " - " +
      getDynamicDateRangeFromString("d_last_week")
        .value()[1]
        .format("MMM D"),
  },
  {
    // name: "Last month",
    name: "上个月",
    value: getDynamicDateRangeFromString("d_last_month"),
    label: () =>
      getDynamicDateRangeFromString("d_last_month")
        .value()[0]
        .format("MMMM"),
  },
  {
    // name: "Last year",
    name: "去年",
    value: getDynamicDateRangeFromString("d_last_year"),
    label: () =>
      getDynamicDateRangeFromString("d_last_year")
        .value()[0]
        .format("YYYY"),
  },
  {
    // name: "Last 7 days",
    name: "过去7天",
    value: getDynamicDateRangeFromString("d_last_7_days"),
    label: () =>
      getDynamicDateRangeFromString("d_last_7_days")
        .value()[0]
        .format("MMM D") + " - 今天",
  },
  {
    // name: "Last 14 days",
    name: "过去14天",
    value: getDynamicDateRangeFromString("d_last_14_days"),
    label: () =>
      getDynamicDateRangeFromString("d_last_14_days")
        .value()[0]
        .format("MMM D") + " - 今天",
  },
  {
    // name: "Last 30 days",
    name: "过去30天",
    value: getDynamicDateRangeFromString("d_last_30_days"),
    label: () =>
      getDynamicDateRangeFromString("d_last_30_days")
        .value()[0]
        .format("MMM D") + " - 今天",
  },
  {
    // name: "Last 60 days",
    name: "过去60天",
    value: getDynamicDateRangeFromString("d_last_60_days"),
    label: () =>
      getDynamicDateRangeFromString("d_last_60_days")
        .value()[0]
        .format("MMM D") + " - 今天",
  },
  {
    // name: "Last 90 days",
    name: "过去90天",
    value: getDynamicDateRangeFromString("d_last_90_days"),
    label: () =>
      getDynamicDateRangeFromString("d_last_90_days")
        .value()[0]
        .format("MMM D") + " - 今天",
  },
  {
    // name: "Last 12 months",
    name: "过去12个月",
    value: getDynamicDateRangeFromString("d_last_12_months"),
    label: null,
  },
];

const DYNAMIC_DATETIME_OPTIONS = [
  {
    name: "今天",//Today
    value: getDynamicDateRangeFromString("d_today"),
    label: () =>
      getDynamicDateRangeFromString("d_today")
        .value()[0]
        .format("MMM D"),
  },
  {
    name: "昨天",//Yesterday
    value: getDynamicDateRangeFromString("d_yesterday"),
    label: () =>
      getDynamicDateRangeFromString("d_yesterday")
        .value()[0]
        .format("MMM D"),
  },
  ...DYNAMIC_DATE_OPTIONS,
];

function DateRangeParameter(props) {
  const options = includes(props.type, "datetime-range") ? DYNAMIC_DATETIME_OPTIONS : DYNAMIC_DATE_OPTIONS;
  return <DynamicDateRangePicker {...props} dynamicButtonOptions={{ options }} />;
}

DateRangeParameter.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  value: PropTypes.any, // eslint-disable-line react/forbid-prop-types
  parameter: PropTypes.any, // eslint-disable-line react/forbid-prop-types
  onSelect: PropTypes.func,
};

DateRangeParameter.defaultProps = {
  type: "",
  className: "",
  value: null,
  parameter: null,
  onSelect: () => {},
};

export default DateRangeParameter;

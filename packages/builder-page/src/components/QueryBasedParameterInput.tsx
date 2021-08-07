import { find, isArray, get, first, map, intersection, isEqual, isEmpty } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import SelectWithVirtualScroll from "./SelectWithVirtualScroll";

export default class QueryBasedParameterInput extends React.Component {
  static propTypes = {
    parameter: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    mode: PropTypes.oneOf(["default", "multiple"]),
    queryId: PropTypes.number,
    onSelect: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object
  };

  static defaultProps = {
    value: null,
    mode: "default",
    parameter: null,
    queryId: null,
    onSelect: () => {},
    className: "",
  };

  constructor(props) {
    super(props);
    this.state = {
      options: [],
      value: null,
      loading: false,
    };
  }

  componentDidMount() {
    this._loadOptions((this.props as any).queryId);
  }

  componentDidUpdate(prevProps) {
    if ((this.props as any).queryId !== prevProps.queryId) {
      this._loadOptions((this.props as any).queryId);
    }
    if ((this.props as any).value !== prevProps.value) {
      this.setValue((this.props as any).value);
    }
  }

  setValue(value) {
    const { options } = this.state as any;
    if ((this.props as any).mode === "multiple") {
      value = isArray(value) ? value : [value];
      const optionValues = map(options, option => option.value);
      const validValues = intersection(value, optionValues);
      this.setState({ value: validValues });
      return validValues;
    }
    const found = find(options, option => option.value === (this.props as any).value) !== undefined;
    value = found ? value : get(first(options), "value");
    this.setState({ value });
    return value;
  }

  async _loadOptions(queryId) {
    if (queryId && queryId !== (this.state as any).queryId) {
      this.setState({ loading: true });
      const options = await (this.props as any).parameter.loadDropdownValues();

      // stale queryId check
      if ((this.props as any).queryId === queryId) {
        this.setState({ options, loading: false }, () => {
          const updatedValue = this.setValue((this.props as any).value);
          if (!isEqual(updatedValue, (this.props as any).value)) {
            (this.props as any).onSelect(updatedValue);
          }
        });
      }
    }
  }

  render() {
    const { className, mode, onSelect, queryId, value, ...otherProps } = this.props as any;
    const { loading, options } = this.state as any;
    return (
      <span>
        <SelectWithVirtualScroll
          className={className}
          disabled={loading}
          loading={loading}
          mode={mode}
          value={(this.state as any).value}
          onChange={onSelect}
          options={map(options, ({ value, name }) => ({ label: String(name), value }))}
          showSearch
          showArrow
          notFoundContent={isEmpty(options) ? "No options available" : null}
          {...otherProps}
        />
      </span>
    );
  }
}

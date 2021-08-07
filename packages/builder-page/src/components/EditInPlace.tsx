import { trim } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import Input from "antd/lib/input";

export default class EditInPlace extends React.Component {
  static propTypes = {
    ignoreBlanks: PropTypes.bool,
    isEditable: PropTypes.bool,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onDone: PropTypes.func.isRequired,
    onStopEditing: PropTypes.func,
    multiline: PropTypes.bool,
    editorProps: PropTypes.object,
    defaultEditing: PropTypes.bool,
  };

  static defaultProps = {
    ignoreBlanks: false,
    isEditable: true,
    placeholder: "",
    value: "",
    onStopEditing: () => {},
    multiline: false,
    editorProps: {},
    defaultEditing: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      editing: props.defaultEditing,
    };
  }

  componentDidUpdate(_, prevState) {
    if (!(this.state as any).editing && prevState.editing) {
      (this.props as any).onStopEditing();
    }
  }

  startEditing = () => {
    if ((this.props as any).isEditable) {
      this.setState({ editing: true });
    }
  };

  stopEditing = currentValue => {
    const newValue = trim(currentValue);
    const ignorableBlank = (this.props as any).ignoreBlanks && newValue === "";
    if (!ignorableBlank && newValue !== (this.props as any).value) {
      (this.props as any).onDone(newValue);
    }
    this.setState({ editing: false });
  };

  handleKeyDown = event => {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      this.stopEditing(event.target.value);
    } else if (event.keyCode === 27) {
      this.setState({ editing: false });
    }
  };

  renderNormal = () =>
    (this.props as any).value ? (
      <span
        role="presentation"
        onFocus={this.startEditing}
        onClick={this.startEditing}
        className={(this.props as any).isEditable ? "editable" : ""}>
        {(this.props as any).value}
      </span>
    ) : (
      <a className="clickable" onClick={this.startEditing}>
        {(this.props as any).placeholder}
      </a>
    );

  renderEdit = () => {
    const { multiline, value, editorProps } = this.props as any;
    const InputComponent = multiline ? Input.TextArea : Input;
    return (
      <InputComponent
        defaultValue={value}
        aria-label="Editing"
        onBlur={e => this.stopEditing(e.target.value)}
        onKeyDown={this.handleKeyDown}
        autoFocus
        {...editorProps}
      />
    );
  };

  render() {
    return (
      <span className={cx("edit-in-place", { active: (this.state as any).editing }, (this.props as any).className)}>
        {(this.state as any).editing ? this.renderEdit() : this.renderNormal()}
      </span>
    );
  }
}

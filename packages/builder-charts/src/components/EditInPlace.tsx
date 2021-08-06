import React from 'react';
import PropTypes from 'prop-types';
import { trim } from 'lodash';

export class EditInPlace extends React.Component {
  static propTypes = {
    ignoreBlanks: PropTypes.bool,
    isEditable: PropTypes.bool,
    editor: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onDone: PropTypes.func,
  };

  static defaultProps = {
    ignoreBlanks: false,
    isEditable: true,
    placeholder: '',
    value: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      editing: false,
    };
    (this as any).inputRef = React.createRef();
    const self = this;
    this.componentDidUpdate = (prevProps, prevState: any) => {
      if ((self.state as any).editing && !prevState.editing) {
        (self as any).inputRef.current.focus();
      }
    };
  }

  startEditing = () => {
    if ((this.props as any).isEditable) {
      this.setState({ editing: true });
    }
  };

  stopEditing = () => {
    const newValue = trim((this as any).inputRef.current.value);
    const ignorableBlank = (this.props as any).ignoreBlanks && newValue === '';
    if (!ignorableBlank && newValue !== (this.props as any).value) {
      (this.props as any).onDone(newValue);
    }
    this.setState({ editing: false });
  };

  keyDown = (event) => {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      this.stopEditing();
    } else if (event.keyCode === 27) {
      this.setState({ editing: false });
    }
  };

  renderNormal = () => (
    <span
      role="presentation"
      onFocus={this.startEditing}
      onClick={this.startEditing}
      className={(this.props as any).isEditable ? 'editable' : ''}
    >
      {(this.props as any).value || (this.props as any).placeholder}
    </span>
  );

  renderEdit = () => React.createElement((this.props as any).editor, {
    ref: (this as any).inputRef,
    className: 'rd-form-control',
    defaultValue: (this.props as any).value,
    onBlur: this.stopEditing,
    onKeyDown: this.keyDown,
  });

  render() {
    return (
      <span className={'edit-in-place' + ((this.state as any).editing ? ' active' : '')}>
        {(this.state as any).editing ? this.renderEdit() : this.renderNormal()}
      </span>
    );
  }
}

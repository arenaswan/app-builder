import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { isEmpty } from "lodash";
import Dropdown from "antd/lib/dropdown";
import Modal from "antd/lib/modal";
import Menu from "antd/lib/menu";

import "./Widget.less";

class Widget extends React.Component {
  static propTypes = {
    widget: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    children: PropTypes.node,
    header: PropTypes.node,
    footer: PropTypes.node,
    canEdit: PropTypes.bool,
    isPublic: PropTypes.bool,
    menuOptions: PropTypes.node,
    tileProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onDelete: PropTypes.func,
  };

  static defaultProps = {
    className: "",
    children: null,
    header: null,
    footer: null,
    canEdit: false,
    isPublic: false,
    refreshStartedAt: null,
    menuOptions: null,
    tileProps: {},
    onDelete: () => {},
  };


  deleteWidget = () => {
    const { widget, onDelete } = (this.props as any);

    Modal.confirm({
      title: "Delete Widget",
      content: "Are you sure you want to remove this widget from the dashboard?",
      okText: "Delete",
      okType: "danger",
      onOk: () => widget.delete().then(onDelete),
      maskClosable: true,
      autoFocusButton: null,
    });
  };

  render() {
    const { className, children, header, footer, canEdit, isPublic, menuOptions, tileProps } = (this.props as any);
    const showDropdownButton = !isPublic && (canEdit || !isEmpty(menuOptions));
    return (
      <div className="widget-wrapper">
        <div className={cx("tile body-container", className)} {...tileProps}>
          <div className="widget-actions">
            
          </div>
          <div className="body-row widget-header">{header}</div>
          {children}
          {footer && <div className="body-row tile__bottom-control">{footer}</div>}
        </div>
      </div>
    );
  }
}

export default Widget;

import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { isEmpty } from "lodash";
import { Modal, Menu, Dropdown, Button } from 'antd';
import recordEvent from "../../../services/recordEvent";
import { Moment } from "../../proptypes";
import PlainButton from "../../PlainButton";

import "./Widget.less";

function WidgetDropdownButton({ extraOptions, showDeleteOption, onDelete, isPublic = false }) {
  const WidgetMenu = (
    <Menu data-test="WidgetDropdownButtonMenu">
      {extraOptions}
      {!isPublic && showDeleteOption && extraOptions && extraOptions.length > 0 && <Menu.Divider />}
      {!isPublic && showDeleteOption && <Menu.Item onClick={onDelete}>Remove from Page</Menu.Item>}
    </Menu>
  );

  return (
    <div className="widget-menu-regular">
      <Dropdown overlay={WidgetMenu} placement="bottomRight" trigger={["click"]}>
        <PlainButton className="action p-l-15 p-r-15" data-test="WidgetDropdownButton" aria-label="More options">
          <i className="zmdi zmdi-more-vert" aria-hidden="true" />
        </PlainButton>
      </Dropdown>
    </div>
  );
}

WidgetDropdownButton.propTypes = {
  extraOptions: PropTypes.node,
  showDeleteOption: PropTypes.bool,
  onDelete: PropTypes.func,
};

WidgetDropdownButton.defaultProps = {
  extraOptions: null,
  showDeleteOption: false,
  onDelete: () => {},
};

function WidgetDeleteButton({ onClick }) {
  return (
    <div className="widget-menu-remove">
      <PlainButton
        className="action"
        title="Remove From Page"
        onClick={onClick}
        data-test="WidgetDeleteButton"
        aria-label="Close">
        <i className="zmdi zmdi-close" aria-hidden="true" />
      </PlainButton>
    </div>
  );
}

WidgetDeleteButton.propTypes = { onClick: PropTypes.func };
WidgetDeleteButton.defaultProps = { onClick: () => {} };

class Widget extends React.Component {
  static propTypes = {
    widget: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    children: PropTypes.node,
    header: PropTypes.node,
    footer: PropTypes.node,
    canEdit: PropTypes.bool,
    isPublic: PropTypes.bool,
    refreshStartedAt: Moment,
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

  componentDidMount() {
    const { widget } = (this.props as any);
    recordEvent("view", "widget", widget._id);
  }

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
    const { className, children, header, footer, canEdit, isPublic, menuOptions, tileProps } = ( this.props as any);
    const showDropdownButton = !isPublic && (canEdit || !isEmpty(menuOptions));
    return (
      <div className="widget-wrapper">
        <div className={cx("tile body-container", className)} {...tileProps}>
          <div className="widget-actions">
            {/* {showDropdownButton && (
              <WidgetDropdownButton
                extraOptions={menuOptions}
                showDeleteOption={canEdit}
                onDelete={this.deleteWidget}
              />
            )} */}
            <WidgetDropdownButton
              extraOptions={menuOptions}
              isPublic={isPublic}
              showDeleteOption={canEdit}
              onDelete={this.deleteWidget}
            />
            {canEdit && <WidgetDeleteButton onClick={this.deleteWidget} />}
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

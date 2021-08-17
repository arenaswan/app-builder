import { replace } from "lodash";
import React from "react";
// import { axios } from "@/services/axios";
import PropTypes from "prop-types";
import Switch from "antd/lib/switch";
import Modal from "antd/lib/modal";
import Form from "antd/lib/form";
import Alert from "antd/lib/alert";
import notification from "../../../components/notification";
import { wrap as wrapDialog, DialogPropType } from "../../../components/DialogWrapper";
import _InputWithCopy from "../../../components/InputWithCopy";
import HelpTrigger from "../../../components/HelpTrigger";
const axios: any = {};
const API_SHARE_URL = "api/dashboards/{id}/share";
const InputWithCopy: any = _InputWithCopy;

class ShareDashboardDialog extends React.Component {
  static propTypes = {
    dashboard: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    hasOnlySafeQueries: PropTypes.bool.isRequired,
    dialog: DialogPropType.isRequired,
  };

  formItemProps = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
    style: { marginBottom: 7 },
  };
  apiUrl: any;
  enabled: any;

  constructor(props) {
    super(props);
    const { dashboard } = this.props as any;

    this.state = {
      saving: false,
    };

    this.apiUrl = replace(API_SHARE_URL, "{id}", dashboard.id);
    this.enabled = (this.props as any).hasOnlySafeQueries || dashboard.publicAccessEnabled;
  }

  static get headerContent() {
    return (
      <React.Fragment>
        Share Dashboard
        <div className="modal-header-desc">
          Allow public access to this dashboard with a secret address. <HelpTrigger type="SHARE_DASHBOARD" />
        </div>
      </React.Fragment>
    );
  }

  enableAccess = () => {
    const { dashboard } = this.props as any;
    this.setState({ saving: true });

    axios
      .post(this.apiUrl)
      .then(data => {
        dashboard.publicAccessEnabled = true;
        dashboard.public_url = data.public_url;
      })
      .catch(() => {
        notification.error.call({}, "Failed to turn on sharing for this dashboard");
      })
      .finally(() => {
        this.setState({ saving: false });
      });
  };

  disableAccess = () => {
    const { dashboard } = this.props as any;
    this.setState({ saving: true });

    axios
      .delete(this.apiUrl)
      .then(() => {
        dashboard.publicAccessEnabled = false;
        delete dashboard.public_url;
      })
      .catch(() => {
        notification.error.call({}, "Failed to turn off sharing for this dashboard");
      })
      .finally(() => {
        this.setState({ saving: false });
      });
  };

  onChange = checked => {
    if (checked) {
      this.enableAccess();
    } else {
      this.disableAccess();
    }
  };

  render() {
    const { dialog, dashboard } = this.props as any;

    return (
      <Modal {...dialog.props} title={(this.constructor as any).headerContent} footer={null}>
        <Form layout="horizontal">
          {!(this.props as any).hasOnlySafeQueries && (
            <Form.Item>
              <Alert
                message="For your security, sharing is currently not supported for dashboards containing queries with text parameters. Consider changing the text parameters in your query to a different type."
                type="error"
              />
            </Form.Item>
          )}
          <Form.Item label="Allow public access" {...this.formItemProps}>
            <Switch
              checked={dashboard.publicAccessEnabled}
              onChange={this.onChange}
              loading={(this.state as any).saving}
              disabled={!this.enabled}
              data-test="PublicAccessEnabled"
            />
          </Form.Item>
          {dashboard.public_url && (
            <Form.Item label="Secret address" {...this.formItemProps}>
              <InputWithCopy value={(dashboard.public_url as any)} data-test="SecretAddress" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  }
}

export default wrapDialog(ShareDashboardDialog);
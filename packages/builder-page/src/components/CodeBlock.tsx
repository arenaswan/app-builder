import React from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import Tooltip from "./Tooltip";
import CopyOutlinedIcon from "@ant-design/icons/CopyOutlined";
import "./CodeBlock.less";

export default class CodeBlock extends React.Component {
  static propTypes = {
    copyable: PropTypes.bool,
    children: PropTypes.node,
  };

  static defaultProps = {
    copyable: false,
    children: null,
  };

  state = { copied: null };

  constructor(props) {
    super(props);
    (this as any).ref = React.createRef();
    (this as any).copyFeatureEnabled = props.copyable && document.queryCommandSupported("copy");
    (this as any).resetCopyState = null;
  }

  componentWillUnmount() {
    if ((this as any).resetCopyState) {
      clearTimeout((this as any).resetCopyState);
    }
  }

  copy = () => {
    // select text
    window.getSelection().selectAllChildren((this as any).ref.current);

    // copy
    try {
      const success = document.execCommand("copy");
      if (!success) {
        throw new Error();
      }
      this.setState({ copied: "Copied!" });
    } catch (err) {
      this.setState({
        copied: "Copy failed",
      });
    }

    // reset selection
    window.getSelection().removeAllRanges();

    // reset tooltip
    (this as any).resetCopyState = setTimeout(() => this.setState({ copied: null }), 2000);
  };

  render() {
    const { copyable, children, ...props } = this.props as any;

    const copyButton = (
      <Tooltip title={this.state.copied || "Copy"}>
        <Button icon={<CopyOutlinedIcon />} type="dashed" size="small" onClick={this.copy} />
      </Tooltip>
    );

    return (
      <div className="code-block">
        <code {...props} ref={(this as any).ref}>
          {children}
        </code>
        {(this as any).copyFeatureEnabled && copyButton}
      </div>
    );
  }
}

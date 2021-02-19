
import React from "react";
import {Form} from 'antd'

// https://developer.salesforce.com/docs/component-library/bundle/lightning-record-edit-form
export class RecordEditForm extends React.Component<any> {
  static defaultProps = {
    layout: "vertical"
  }

  render() {
    const {objectApiName, recordId, layout, children, ...rest} = this.props

    return (
      <Form layout={layout} {...rest} >
          {children}
      </Form>
    )
  }
}

export default RecordEditForm;
// @flow
import * as React from "react";
import Frame from "./components/Frame";

const URL_REGEX = /\/videos\//i;


export default class Video extends React.Component<any> {
  static ENABLED = [URL_REGEX];

  render() {
    const { attrs } = this.props;
    const src = attrs.href.replace('/videos/', '/embed/videos/')
    const Component: any = Frame;
    console.log(`this.props`, this.props)
    return (
      <Component
        {...this.props}
        src={src}
      />
    );
  }
}
   
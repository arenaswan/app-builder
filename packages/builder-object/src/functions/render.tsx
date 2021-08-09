import * as React from "react"
import ReactDOM from "react-dom";
import { SteedosProvider } from "../";
import {
  BrowserRouter as Router
} from "react-router-dom";

const withModalWrap = (component: React.FunctionComponent, provideProps) => {
  return (props: any) => {
    const ModalComponent = component;
    return (<SteedosProvider {...provideProps}>
      <Router>
        <ModalComponent {...props}/>
      </Router>
    </SteedosProvider>);
  }
}
export const render = (component: React.FunctionComponent, componentParams: any, modalRoot: any, provideProps: any = {} ) => {
    const wrapComponent: any = withModalWrap(component, provideProps);
    const contentEle = React.createElement(wrapComponent,{
        ...componentParams
      });
    ReactDOM.render(contentEle, modalRoot);
}
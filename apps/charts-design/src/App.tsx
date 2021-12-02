import React from 'react';
// import logo from './logo.svg';
import './App.css';
import { SteedosProvider } from '@steedos-ui/builder-object';
import { Settings } from '@steedos-ui/builder-store';
import { Switch, HashRouter, Route, Redirect } from 'react-router-dom';
import QuerySourcePage from './pages/QuerySource';
import PublicPage from './pages/PublicPage';
// import { QuerySource } from '@steedos-ui/builder-community';
const initialStore = {
  rootUrl: Settings.rootUrl,
  tenantId: Settings.tenantId,
  userId: Settings.userId,
  authToken: Settings.authToken,
  locale: 'zh_CN'
}

const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
  initialStore.tenantId = process.env.DEV_APP_TENANTID;
  initialStore.userId = process.env.DEV_APP_USERID;
  initialStore.authToken = process.env.DEV_APP_AUTHTOKEN;
}

function App() {
  console.log(`HashRouter`);
  return (
    <SteedosProvider {...initialStore}>
      <HashRouter basename="/">
        <Switch>
          <Route path="/page/public/:pageId" component={PublicPage} />
          <Route path="/charts-design/:queryId" component={QuerySourcePage} />
        </Switch>
      </HashRouter>
    </SteedosProvider>
  );
}

export default App;

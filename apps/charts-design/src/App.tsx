import React from 'react';
// import logo from './logo.svg';
import './App.css';
import { SteedosProvider } from '@steedos/builder-object';
import { Settings } from '@steedos/builder-store';
import { QuerySource } from '@steedos/builder-page';
// import { QuerySource } from '@steedos/builder-community';
const initialStore = {
  rootUrl: Settings.rootUrl,
  tenantId: Settings.tenantId,
  userId: Settings.userId,
  authToken: Settings.authToken,
  locale: 'zh_CN'
}

const isProd = process.env.NODE_ENV === 'production';

if(!isProd){
  initialStore.tenantId = process.env.DEV_APP_TENANTID;
  initialStore.userId = process.env.DEV_APP_USERID;
  initialStore.authToken = process.env.DEV_APP_AUTHTOKEN;
}

function App() {
  return (
    <div style={{height: '100%'}}>
      <SteedosProvider {...initialStore}>
        <QuerySource queryId="test4" onError={(err: any)=>{console.log(`QuerySource error`, err)}}/>
      </SteedosProvider>
    </div>
  );
}

export default App;

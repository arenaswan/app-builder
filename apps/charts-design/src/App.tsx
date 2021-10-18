import React from 'react';
// import logo from './logo.svg';
import './App.css';
import { SteedosProvider } from '@steedos/builder-object';
import { Settings } from '@steedos/builder-store';
import { QuerySource } from '@steedos/builder-page';
// import { QuerySource } from '@steedos/builder-community';
const initialStore = {
  rootUrl: Settings.rootUrl,
  tenantId: Settings.tenantId || "immYoecxSfp5vNMRH",
  userId: Settings.userId || "6161169069c04a1fdcfec2ed",
  authToken: Settings.authToken || "d3a497b48211d7525d2deb18eff9d1f2660ecdf548b4cdb5f2bcd4d3aa3880a7b05434718ecf1cafca0e9b",
  locale: 'zh_CN'
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

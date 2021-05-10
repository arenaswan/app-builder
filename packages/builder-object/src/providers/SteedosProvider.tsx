
import React from "react";

import { getSnapshot } from "mobx-state-tree";
import { SteedosClient } from '@steedos/builder-sdk';
import { SteedosContext } from '..';
import { ObjectProvider } from "@steedos/builder-object";
import { Settings, API } from "@steedos/builder-store";
import { SteedosIconSettings } from "@steedos/builder-lightning";

/*
参数：
- locale: zh_CN, en_US, zh_TW  TODO: 和steedos的locale值不一样，获取user之后需要转换。

*/
export function SteedosProvider(props: any) {

  const {
    rootUrl,
    tenantId = localStorage.getItem('steedos:spaceId'),
    userId = localStorage.getItem('steedos:userId'),
    authToken = localStorage.getItem('steedos:token'),
    locale,
  } = props;

  Settings.setRootUrl(rootUrl);
  Settings.setTenantId(tenantId);
  Settings.setUserId(userId);
  Settings.setAuthToken(authToken);
  Settings.setLocale(locale);


  const objectProviderProps = {
    locale,
    requestObject: API.requestObject,
    requestRecords: API.requestRecords,
    updateRecord: API.updateRecord,
    insertRecord: API.insertRecord
  }

  return (
    <SteedosContext.Provider value={{}}>
      <SteedosIconSettings>
        <ObjectProvider {...objectProviderProps}>
          {props.children}
        </ObjectProvider>
      </SteedosIconSettings>
    </SteedosContext.Provider>
  )
}
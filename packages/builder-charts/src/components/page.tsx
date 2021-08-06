import React, { useState } from "react";
import * as _ from 'lodash';
import { observer } from "mobx-react-lite";
import { Button, Menu, Dropdown } from 'antd';
import { API, Queries, Pages } from '@steedos/builder-store';

import { Dashboard } from './dashboard';


export const Page = observer((props: any) => {
    const { id } = props;
    const recordCache = Pages.getPage(id);
    if (recordCache.isLoading) return (<div>Loading record ...</div>)
    let page: any = null;
    if(recordCache.data){
        page = recordCache.data;
    }
    if(!page){
        return (<div>Loading record ...</div>)
    }

    return (
        <Dashboard {...page} />
    );
})
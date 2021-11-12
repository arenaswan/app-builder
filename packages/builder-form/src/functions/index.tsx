import React from "react"
import { Link } from '../components/index'
import { Apps } from '@steedos-ui/builder-store';

export const getNameFieldColumnRender = (objectApiName: string, linkTarget?: string, nameFieldKey?: string) => {
    return (dom: any, record: any) => {
        let props: any = {};
        if(linkTarget){
            props.target = linkTarget;
        }
        return (<Link title={record[nameFieldKey || 'name']}  to={getObjectRecordUrl(objectApiName, record._id)} {...props} className="text-blue-600 hover:text-blue-500 hover:underline">{dom}</Link>);
    }
}

export function getObjectRecordUrl(objectApiName: string, redordId: any) {
    const hrefPrefix = `/app/${Apps.currentAppId || "-"}/${objectApiName}/view/`;
    return `${hrefPrefix}${redordId}`;
}
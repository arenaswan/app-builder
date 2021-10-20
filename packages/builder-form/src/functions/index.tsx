import React from "react"
import { Link } from '../components/index'
import { Apps } from '@steedos-ui/builder-store';

export const getNameFieldColumnRender = (objectApiName: string, linkTarget?: string, nameFieldKey?: string) => {
    return (dom: any, record: any) => {
        return (<Link title={record[nameFieldKey || 'name']} target={linkTarget} to={getObjectRecordUrl(objectApiName, record._id)} className="text-blue-600 hover:text-blue-500 hover:underline">{dom}</Link>);
    }
}

export function getObjectRecordUrl(objectApiName: string, redordId: any) {
    const hrefPrefix = `/app/${Apps.currentAppId || "-"}/${objectApiName}/view/`;
    return `${hrefPrefix}${redordId}`;
}
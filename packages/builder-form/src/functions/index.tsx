import React from "react"
import { Link } from '../components/index'
import { Apps } from '@steedos-ui/builder-store';
import moment from 'moment';

export const getNameFieldColumnRender = (objectApiName: string, linkTarget?: string, nameFieldKey?: string) => {
    return (dom: any, record: any, fieldType?:any) => {
        let props: any = {};
        if(linkTarget){
            props.target = linkTarget;
        }
        let domValue = dom;
        if (fieldType === 'datetime') {
            domValue = dom !== undefined ? moment(dom).format('YYYY-MM-DD HH:mm') : null;
        }
        if (fieldType === 'date') {
            domValue = dom !== undefined ? moment(dom).format('YYYY-MM-DD') : null;
        }
        const title = ['datetime','date'].indexOf(fieldType)>-1 ? domValue : record[nameFieldKey || 'name'];
        return (<Link title={title}  to={getObjectRecordUrl(objectApiName, record._id)} {...props} className="text-blue-600 hover:text-blue-500 hover:underline">{domValue}</Link>);
    }
}

export function getObjectRecordUrl(objectApiName: string, redordId: any) {
    const Creator = (window as any).Creator;
    if(Creator && Creator.getObjectUrl){
        return Creator.getObjectUrl(objectApiName, redordId, "-")
    }else{
        const hrefPrefix = `/app/${Apps.currentAppId || "-"}/${objectApiName}/view/`;
        return `${hrefPrefix}${redordId}`;
    }
}
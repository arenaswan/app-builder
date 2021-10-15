import * as React from "react"
import { QuerySource } from '@steedos/builder-page';
export default {
  title: "Queries",
}

export const QueriesSimple = () => {
  return (
    //   <Dashboard {...dashboard} layoutEditing={true}/>
    <QuerySource queryId="616944df87a4e77bcc5eaf51" onError={(err)=>{console.log(`QuerySource error`, err)}}/>
  )
}
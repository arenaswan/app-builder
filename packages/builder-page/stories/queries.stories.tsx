import * as React from "react"
import { QuerySource } from '@steedos-ui/builder-page';
export default {
  title: "Queries",
}

export const QueriesSimple = () => {
  return (
    //   <Dashboard {...dashboard} layoutEditing={true}/>
    <div style={{ height: '770px' }}>
      <QuerySource queryId="test4" onError={(err)=>{console.log(`QuerySource error`, err)}}/>
    </div>
  )
}
import { QuerySource } from '@steedos/builder-page';
export default function QuerySourcePage({match}){
    const { queryId } = match.params
    return (
          <QuerySource queryId={queryId} onError={(err: any)=>{console.log(`QuerySource error`, err)}}/>
    )
}
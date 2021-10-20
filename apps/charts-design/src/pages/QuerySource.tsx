import { QuerySource } from '@steedos-ui/builder-page';
export default function QuerySourcePage({match}){
    const { queryId } = match.params
    return (
          <QuerySource queryId={queryId} onError={(err: any)=>{console.log(`QuerySource error`, err)}}/>
    )
}
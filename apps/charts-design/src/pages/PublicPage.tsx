import { PublicPage } from '@steedos-ui/builder-page';
export default function PublicDashboardPage({ match, location }) {
    let hiddenTitle = false;
    try {
        if(location.search && location.search.indexOf('hidden_title') > 0){
            hiddenTitle = true;
        }
    } catch (error) {
        
    }
    const { pageId } = match.params
    return (
        <PublicPage token={pageId} hiddenTitle={hiddenTitle} onError={(err: any) => { console.log(`QuerySource error`, err) }} />
    )
}
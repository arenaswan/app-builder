import { ComponentRegistry } from '@steedos-ui/builder-store';
import { ObjectTable, ObjectProTable,
    ObjectForm, ObjectListView,
    SpaceUsers, SpaceUsersModal,
    Organizations, OrganizationsModal,
    ObjectTree, ObjectExpandTable, ObjectModal
} from '@steedos-ui/builder-object';
import { ChartDesignModal } from '@steedos-ui/builder-charts';
import { Page, PublicPage, QuerySource } from '@steedos-ui/builder-page';
import { isExpression, parseSingleExpression } from '@steedos-ui/builder-object';

Object.assign(ComponentRegistry.components,{ 
    ObjectTable, ObjectProTable,
    ObjectForm, ObjectListView,
    SpaceUsers, SpaceUsersModal,
    Organizations, OrganizationsModal,
    ObjectTree, ObjectExpandTable, ObjectModal,
    Page, PublicPage, QuerySource, ChartDesignModal
});

export { ObjectTable, ObjectForm, API, SteedosProvider, SteedosRouter, Forms, ObjectListView} from '@steedos-ui/builder-object';
export { ObjectGrid } from '@steedos-ui/builder-ag-grid';
export { ComponentRegistry }
export { Page, PublicPage, QuerySource } from '@steedos-ui/builder-page';

let Utils = {}
Object.assign(Utils,{
    isExpression, parseSingleExpression 
});
export { Utils }

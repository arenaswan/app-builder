import { ComponentRegistry } from '@steedos/builder-store';
import { ObjectTable, ObjectProTable,
    ObjectForm, ObjectListView,
    SpaceUsers, SpaceUsersModal,
    Organizations, OrganizationsModal,
    ObjectTree, ObjectExpandTable, ObjectModal
} from '@steedos/builder-object';
import { ChartDesignModal } from '@steedos/builder-charts';
import { Page, PublicPage, QuerySource } from '@steedos/builder-page';
import { isExpression, parseSingleExpression } from '@steedos/builder-object';

Object.assign(ComponentRegistry.components,{ 
    ObjectTable, ObjectProTable,
    ObjectForm, ObjectListView,
    SpaceUsers, SpaceUsersModal,
    Organizations, OrganizationsModal,
    ObjectTree, ObjectExpandTable, ObjectModal,
    Page, PublicPage, QuerySource, ChartDesignModal
});

export { ObjectTable, ObjectForm, API, SteedosProvider, SteedosRouter, Forms, ObjectListView} from '@steedos/builder-object';
export { ObjectGrid } from '@steedos/builder-ag-grid';
export { ComponentRegistry }
export { Page, PublicPage, QuerySource } from '@steedos/builder-page';

let Utils = {}
Object.assign(Utils,{
    isExpression, parseSingleExpression 
});
export { Utils }

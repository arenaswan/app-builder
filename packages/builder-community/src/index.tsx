import { ComponentRegistry } from '@steedos/builder-store';
import { ObjectTable, ObjectProTable,
    ObjectForm, ObjectListView,
    SpaceUsers, SpaceUsersModal,
    Organizations, OrganizationsModal,
    ObjectTree, ObjectExpandTable, ObjectModal
} from '@steedos/builder-object';
import { ChartDesignModal } from '@steedos/builder-charts';
import { Page, PublicPage } from '@steedos/builder-page';
import { isExpression, parseSingleExpression } from '@steedos/builder-object';


if(!document.body){
    var tempBody = document.createElement("body");
    document.body = tempBody;
    document.addEventListener('DOMContentLoaded', (event) => {
        tempBody.remove()
    });
}

Object.assign(ComponentRegistry.components,{ 
    ObjectTable, ObjectProTable,
    ObjectForm, ObjectListView,
    SpaceUsers, SpaceUsersModal,
    Organizations, OrganizationsModal,
    ObjectTree, ObjectExpandTable, ObjectModal,
    Page, PublicPage, ChartDesignModal
});

export { ObjectTable, ObjectForm, API, SteedosProvider, SteedosRouter, Forms, ObjectListView} from '@steedos/builder-object';
export { ObjectGrid } from '@steedos/builder-ag-grid';
export { ComponentRegistry }
export { Page, PublicPage } from '@steedos/builder-page';

let Utils = {}
Object.assign(Utils,{
    isExpression, parseSingleExpression 
});
export { Utils }

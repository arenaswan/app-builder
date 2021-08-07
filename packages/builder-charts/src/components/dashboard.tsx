import React, { useState } from "react";
import * as _ from 'lodash';
import { observer } from "mobx-react-lite";
import { Button, Menu, Dropdown } from 'antd';
import { API, Queries, Pages } from '@steedos/builder-store';
import { ObjectTable } from '@steedos/builder-object';
import { DashboardGrid } from './dashboardGrid';
import { FavoritesControl } from './FavoritesControl';
import { EditInPlace } from './EditInPlace';
import { TagsControl } from './tags-control/TagsControl';
import notification from './notification';
import dashboardGridOptions from '../config/dashboard-grid-options';
import { registeredVisualizations } from '../config/visualizations';
import AddWidgetDialog from './AddWidgetDialog';
import './dashboard.less';
import '../assets/less/main.less';

const ParameterMappingType = {
    DashboardLevel: 'dashboard-level',
    WidgetLevel: 'widget-level',
    StaticValue: 'static-value',
};

function getChangedPositions(widgets, nextPositions = {}) {
    return _.pickBy(nextPositions, (nextPos: any, widgetId) => {
        const widget = _.find(widgets, { _id: widgetId });
        const prevPos = widget.options.position;
        return !_.isMatch(prevPos, nextPos);
    });
}

function saveWidget(widget, key, value) {
    const data = _.pick(widget, 'options', 'text', 'id', 'width', 'dashboard_id', 'visualization_id');
    if (key && value) {
        data[key] = _.merge({}, data[key], value); // done like this so `this.options` doesn't get updated by side-effect
    }
    console.log(`updateRecord widgets`, widget._id, data)
    return API.updateRecord(`widgets`, widget._id, data);
}

function calculatePositionOptions(widget) {
    widget.width = 1; // Backward compatibility, user on back-end
  
    const visualizationOptions = {
      autoHeight: false,
      sizeX: Math.round(dashboardGridOptions.columns / 2),
      sizeY: dashboardGridOptions.defaultSizeY,
      minSizeX: dashboardGridOptions.minSizeX,
      maxSizeX: dashboardGridOptions.maxSizeX,
      minSizeY: dashboardGridOptions.minSizeY,
      maxSizeY: dashboardGridOptions.maxSizeY,
    };
  
    const config = widget.visualization ? registeredVisualizations[widget.visualization.type] : null;
    if (_.isObject(config)) {
      if (Object.prototype.hasOwnProperty.call(config, 'autoHeight')) {
        visualizationOptions.autoHeight = (config as any).autoHeight;
      }
  
      // Width constraints
      const minColumns = parseInt((config as any).minColumns, 10);
      if (isFinite(minColumns) && minColumns >= 0) {
        visualizationOptions.minSizeX = minColumns;
      }
      const maxColumns = parseInt((config as any).maxColumns, 10);
      if (isFinite(maxColumns) && maxColumns >= 0) {
        visualizationOptions.maxSizeX = Math.min(maxColumns, dashboardGridOptions.columns);
      }
  
      // Height constraints
      // `minRows` is preferred, but it should be kept for backward compatibility
      const height = parseInt((config as any).height, 10);
      if (isFinite(height)) {
        visualizationOptions.minSizeY = Math.ceil(height / dashboardGridOptions.rowHeight);
      }
      const minRows = parseInt((config as any).minRows, 10);
      if (isFinite(minRows)) {
        visualizationOptions.minSizeY = minRows;
      }
      const maxRows = parseInt((config as any).maxRows, 10);
      if (isFinite(maxRows) && maxRows >= 0) {
        visualizationOptions.maxSizeY = maxRows;
      }
  
      // Default dimensions
      const defaultWidth = parseInt((config as any).defaultColumns, 10);
      if (isFinite(defaultWidth) && defaultWidth > 0) {
        visualizationOptions.sizeX = defaultWidth;
      }
      const defaultHeight = parseInt((config as any).defaultRows, 10);
      if (isFinite(defaultHeight) && defaultHeight > 0) {
        visualizationOptions.sizeY = defaultHeight;
      }
    }
  
    return visualizationOptions;
  }

function calculateNewWidgetPosition(existingWidgets, newWidget) {
    const width = _.extend({ sizeX: dashboardGridOptions.defaultSizeX }, _.extend({}, newWidget.options).position).sizeX;
  
    // Find first free row for each column
    const bottomLine = _
      .chain(existingWidgets)
      .map((w) => {
        const options = _.extend({}, w.options);
        const position = _.extend({ row: 0, sizeY: 0 }, options.position);
        return {
          left: position.col,
          top: position.row,
          right: position.col + position.sizeX,
          bottom: position.row + position.sizeY,
          width: position.sizeX,
          height: position.sizeY,
        };
      })
      .reduce((result, item) => {
        const from = Math.max(item.left, 0);
        const to = Math.min(item.right, result.length + 1);
        for (let i = from; i < to; i += 1) {
          result[i] = Math.max(result[i], item.bottom);
        }
        return result;
      }, _.map(new Array(dashboardGridOptions.columns), _.constant(0)))
      .value();
  
    // Go through columns, pick them by count necessary to hold new block,
    // and calculate bottom-most free row per group.
    // Choose group with the top-most free row (comparing to other groups)
    return _
      .chain(_.range(0, dashboardGridOptions.columns - width + 1))
      .map(col => ({
        col,
        row: _
          .chain(bottomLine)
          .slice(col, col + width)
          .max()
          .value(),
      }))
      .sortBy('row')
      .first()
      .value();
}

function addWidget(widgets, pageId, type, textOrVisualization, options = {}){
    const props = {
        page: pageId,
        type: type,
        options: {
          ...options,
          isHidden: false,
          position: {},
        },
        text: '',
        visualization: null,
      };
  
      if (_.isString(textOrVisualization)) {
        props.text = textOrVisualization;
      } else if (_.isObject(textOrVisualization)) {
        props.visualization = (textOrVisualization as any)._id;
      } else {
        // TODO: Throw an error?
      }
      
      const visualizationOptions = calculatePositionOptions(props);
      const widget = Object.assign({}, props);
      widget.options = Object.assign({}, widget.options);
      widget.options.position = _.extend(
        {},
        visualizationOptions,
        _.pick(widget.options.position, ['col', 'row', 'sizeX', 'sizeY', 'autoHeight']),
      );

      if ((widget.options.position as any).sizeY < 0) {
        (widget.options.position as any).autoHeight = true;
      }

      const position = calculateNewWidgetPosition(widgets, widget);
      (widget.options.position as any).col = position.col;
      (widget.options.position as any).row = position.row;

    return API.insertRecord(`widgets`, widget);
}

function synchronizeWidgetTitles(sourceMappings, widgets) {
    const affectedWidgets = [];

    _.each(sourceMappings, (sourceMapping) => {
        if (sourceMapping.type === ParameterMappingType.DashboardLevel) {
            _.each(widgets, (widget) => {
                const widgetMappings = widget.options.parameterMappings;
                _.each(widgetMappings, (widgetMapping) => {
                    // check if mapped to the same dashboard-level parameter
                    if (
                        (widgetMapping.type === ParameterMappingType.DashboardLevel) &&
                        (widgetMapping.mapTo === sourceMapping.mapTo)
                    ) {
                        // dirty check - update only when needed
                        if (widgetMapping.title !== sourceMapping.title) {
                            widgetMapping.title = sourceMapping.title;
                            affectedWidgets.push(widget);
                        }
                    }
                });
            });
        }
    });

    return affectedWidgets;
}

export const Dashboard = observer((props: any) => {
    // const { id } = props;
    // const recordCache = Pages.getPage(id);
    // if (recordCache.isLoading) return (<div>Loading record ...</div>)
    // let page: any = null;
    // if(recordCache.data){
    //     page = recordCache.data;
    // }
    // if(!page){
    //     return (<div>Loading record ...</div>)
    // }

    // TODO layoutEditing
    const { widgets, name, tags, is_draft, user, is_archived, _id: pageId } = props;

    console.log(`props`, props)

    const canEdit = () => {
        return true;
    }

    let recentPositions = [];
    // grid vars
    const [saveDelay, setSaveDelay] = useState(false);
    const [saveInProgress, setSaveInProgress] = useState(false);
    const recentLayoutPositions = {};
    const [editBtnClickedWhileSaving, setEditBtnClickedWhileSaving] = useState(false);
    const [layoutEditing, setLayoutEditing] = useState(false);
    const [isLayoutDirty, setIsLayoutDirty] = useState(false);
    const [isGridDisabled, setIsGridDisabled] = useState(false);

    let clientConfig = {
        showPermissionsControl: true //TODO权限
    }

    // dashboard vars
    let isFullscreen = false;
    let refreshRate = null;
    let showPermissionsControl = clientConfig.showPermissionsControl;
    let globalParameters = [];
    let isDashboardOwner = false;
    let filters = [];

    const saveDashboardLayout = (changedPositions) => {
        if (!canEdit()) {
            return;
        }

        setSaveInProgress(true);

        const saveChangedWidgets = _.map(changedPositions, (position, id) => {
            // find widget
            const widget = _.find(widgets, { _id: id });
            // skip already deleted widget
            if (!widget) {
                return Promise.resolve();
            }
            return saveWidget(widget, 'options', { position });
        });

        return Promise
            .all(saveChangedWidgets)
            .then(() => {
                setIsLayoutDirty(false);
                if (editBtnClickedWhileSaving) {
                    setLayoutEditing(false)
                }
            })
            .catch(() => {
                notification.error(('Error saving changes.' as any));
            })
            .finally(() => {
                setSaveInProgress(false);
                setEditBtnClickedWhileSaving(false);
                // $scope.$applyAsync();
            });
    };

    const saveDashboardLayoutDebounced = (args) => {
        setSaveDelay(true);
        return _.debounce(() => {
            setSaveDelay(false);
            saveDashboardLayout(args);
        }, 2000)();
    };

    const onLayoutChange = (positions) => {
        recentPositions = positions; // required for retry if subsequent save fails
        console.log(`positions`, positions)
        // determine position changes
        const changedPositions = getChangedPositions(widgets, positions);
        console.log(`changedPositions`, changedPositions)
        if (_.isEmpty(changedPositions)) {
            setIsLayoutDirty(false);
            //   $scope.$applyAsync();
            return;
        }

        setIsLayoutDirty(true);
        // $scope.$applyAsync();

        // debounce in edit mode, immediate in preview
        if (layoutEditing) {
            saveDashboardLayoutDebounced(changedPositions);
        } else {
            saveDashboardLayout(changedPositions);
        }
    };

    const onWidgetAdded = () => {
        // this.extractGlobalParameters();
        // collectFilters(this.dashboard, false);
        // Save position of newly added widget (but not entire layout)
        const widget = _.last(widgets);
        if (_.isObject(widget)) {
            return saveWidget(widget, null, null);
        }
    };

    const showAddWidgetDialog = () => {
        (window as any).SteedosUI.showModal(ObjectTable, {
            title: `Add Widget`,
            objectApiName: 'charts',
            rowSelection: 'single',
            onFinish: async (values, rows) => {
                if(values && values.length > 0){
                    return addWidget(widgets, pageId, 'charts', rows[0])
                }
            }
        })

        // AddWidgetDialog.showModal({
        //   dashboard: props,
        //   onConfirm: (visualization, parameterMappings) => props.addWidget(visualization, {
        //     parameterMappings: function(parameterMappings){},
        //   }).then((widget) => {
        //     const widgetsToSave = [
        //       widget,
        //       ...synchronizeWidgetTitles(widget.options.parameterMappings, props.widgets),
        //     ];
        //     return Promise.all(widgetsToSave.map(w => w.save())).then(onWidgetAdded);
        //   }),
        // });
    };

    function handleMenuClick(e) {
        if (e.key === 'edit') {
            setLayoutEditing(true)
        }
    }
    const menu = (
        <Menu onClick={handleMenuClick}>
            <Menu.Item key="edit">Edit</Menu.Item>
            {/* <Menu.Item key="2">Manage Permissions</Menu.Item> */}
            <Menu.Item key="unpublish">Unpublish</Menu.Item>
            {/* <Menu.Item key="4">Archive</Menu.Item> */}
        </Menu>
    );

    return (
        <div className="dashboard-page">
            <div className="container">

                <div className="row p-l-15 p-r-15 m-b-10 m-l-0 m-r-0 dashboard-header page-header--new">
                    <div className="page-title col-xs-8 col-sm-7 col-lg-7 p-l-0">
                        <FavoritesControl item={{ is_favorite: false }}></FavoritesControl>
                        <h3 className="h3">
                            <EditInPlace is-editable={layoutEditing} on-done="$ctrl.saveName" ignore-blanks="true" value={name} editor="'input'"></EditInPlace>
                        </h3>
                        {/* TODO alt={user.name} */}
                        <img src={user.profile_image_url} className="profile__image_thumb--dashboard" />

                        <TagsControl className="hidden-xs" tags={tags} is-draft={is_draft}></TagsControl>
                        {/* dashboard-tags-control */}
                        {/* <dashboard-tags-control class="hidden-xs"
                tags="$ctrl.dashboard.tags" is-draft="$ctrl.dashboard.is_draft" is-archived="$ctrl.dashboard.is_archived"
                can-edit="$ctrl.isDashboardOwner" get-available-tags="$ctrl.loadTags" on-edit="$ctrl.saveTags"></dashboard-tags-control> */}

                    </div>
                    <div className="col-xs-4 col-sm-5 col-lg-5 text-right dashboard__control p-r-0">
                        {!is_archived &&
                            <span ng-if="!$ctrl.dashboard.is_archived && !public" className="hidden-print">
                                {layoutEditing && <div>
                                    {isLayoutDirty && <div>
                                        {(saveInProgress || saveDelay) && <span>
                                            <span className="save-status" data-saving>Saving</span>
                                            <button className="btn btn-primary btn-sm" ng-disabled="$ctrl.editBtnClickedWhileSaving" onClick={() => { setLayoutEditing(false) }}>
                                                <i className="fa fa-check" ng-class="{'fa-spinner fa-pulse': $ctrl.editBtnClickedWhileSaving}"></i> Done Editing
                                            </button>
                                        </span>}
                                        {!(saveInProgress || saveDelay) && <span>
                                            <span className="save-status" data-error>Saving Failed</span>
                                            <button className="btn btn-primary btn-sm" ng-click="$ctrl.retrySaveDashboardLayout()">
                                                Retry
                                            </button>
                                        </span>}
                                    </div>}
                                    {!isLayoutDirty && <span>
                                        <span className="save-status">Saved</span>
                                        <button className="btn btn-primary btn-sm"
                                            ng-disabled="$ctrl.isGridDisabled"
                                            onClick={() => { setLayoutEditing(false) }}>
                                            <i className="fa fa-check"></i> Done Editing
                                        </button>
                                    </span>}
                                </div>

                                }

                                {!layoutEditing && is_draft &&
                                    <button type="button" className="btn btn-default btn-sm" ng-click="$ctrl.togglePublished()" title="Publish Dashboard" ng-if="$ctrl.dashboard.is_draft && !$ctrl.layoutEditing">
                                        <span className="fa fa-paper-plane"></span> Publish
                                    </button>
                                }

                                {!layoutEditing &&
                                    <div className="btn-group" ng-if="!$ctrl.layoutEditing">
                                        <button id="split-button" type="button"
                                            ng-class="{'btn-default btn-sm': $ctrl.refreshRate === null,'btn-primary btn-sm':$ctrl.refreshRate !== null}"
                                            className="btn btn-sm btn-default btn-sm" ng-click="$ctrl.refreshDashboard()">
                                            <i className="zmdi zmdi-refresh" ng-class="{'zmdi-hc-spin': $ctrl.refreshInProgress}"></i> Refresh
                                            {/* {{$ctrl.refreshRate === null ? 'Refresh' : $ctrl.refreshRate.name}} */}
                                        </button>
                                        <button type="button" className="btn hidden-xs btn-default btn-sm"
                                            ng-class="{'btn-default btn-sm': $ctrl.refreshRate === null,'btn-primary btn-sm':$ctrl.refreshRate !== null}">
                                            <span className="caret"></span>
                                            <span className="sr-only">Split button!</span>
                                        </button>
                                        <ul className="dropdown-menu pull-right" ng-model="$ctrl.refreshRate" role="menu" aria-labelledby="split-button">
                                            <li role="menuitem" ng-repeat="refreshRate in $ctrl.refreshRates" ng-class="{disabled: !refreshRate.enabled}">
                                                <a ng-click="$ctrl.setRefreshRate(refreshRate)">refreshRate.name</a>
                                            </li>
                                            <li role="menuitem" ng-if="$ctrl.refreshRate !== null">
                                                <a href="#" ng-click="$ctrl.setRefreshRate(null)">Stop auto refresh</a>
                                            </li>
                                        </ul>
                                    </div>
                                }
                                {/* {!is_draft && !layoutEditing &&
                                    <button type="button" className="btn btn-sm hidden-xs" ng-class="{'btn-default': !$ctrl.isFullscreen, 'btn-primary': $ctrl.isFullscreen}" title="Enable/Disable Fullscreen display" ng-click="$ctrl.toggleFullscreen()" ng-if="!$ctrl.dashboard.is_draft && !$ctrl.layoutEditing">
                                        <span className="zmdi zmdi-fullscreen"></span>
                                    </button>
                                } */}
                                {/* 分享 */}
                                {/* <button type="button" className="btn btn-sm hidden-xs" ng-class="{'btn-default': !$ctrl.dashboard.publicAccessEnabled, 'btn-primary': $ctrl.dashboard.publicAccessEnabled}" title="Enable/Disable Share URL" ng-click="$ctrl.openShareForm()" ng-if="($ctrl.dashboard.canEdit() || $ctrl.dashboard.publicAccessEnabled) && !$ctrl.dashboard.is_draft && !$ctrl.layoutEditing" data-test="OpenShareForm">
                        <span className="zmdi zmdi-share"></span>
                    </button> */}
                            </span>
                        }

                        {!is_archived && !layoutEditing &&
                            <div className="btn-group hidden-print hidden-xs" style={{ marginLeft: '3px' }}>
                                <Dropdown overlay={menu}>
                                    <button className="btn btn-default btn-sm dropdown-toggle">
                                        <span className="zmdi zmdi-more"></span>
                                    </button>
                                </Dropdown>
                            </div>
                        }

                    </div>
                </div>
                {!layoutEditing &&
                    <div className="m-b-10 p-15 bg-white tiled" ng-if="$ctrl.layoutEditing">
                        <label>
                            <input name="input" type="checkbox" ng-model="$ctrl.dashboard.dashboard_filters_enabled" ng-change="$ctrl.updateDashboardFiltersState()" />
                            Use Dashboard Level Filters
                        </label>
                    </div>
                }

                {globalParameters.length > 0 &&
                    <div className="m-b-10 p-15 bg-white tiled" ng-if="$ctrl.globalParameters.length > 0">
                        {/* <parameters parameters="$ctrl.globalParameters" on-values-change="$ctrl.refreshDashboard"></parameters> */}
                        globalParameters
                    </div>
                }

                {filters &&
                    <div className="m-b-10 p-15 bg-white tiled" ng-if="$ctrl.filters | notEmpty">
                        {/* <filters filters="$ctrl.filters" on-change="$ctrl.filtersOnChange"></filters> */}
                        filters
                    </div>
                }

                <div id="dashboard-container">
                    <DashboardGrid widgets={widgets} isEditing={layoutEditing} onLayoutChange={onLayoutChange} />
                </div>

                {layoutEditing &&
                    <div className="add-widget-container" ng-if="$ctrl.layoutEditing">
                        <h2>
                            <i className="zmdi zmdi-widgets"></i>
                            <span className="hidden-xs hidden-sm">Widgets are individual query visualizations or text boxes you can place on your dashboard in various arrangements.</span>
                        </h2>
                        <div>
                            <a className="btn btn-default" ng-click="$ctrl.showAddTextboxDialog()">Add Textbox</a>
                            <a className="btn btn-primary m-l-10" onClick={showAddWidgetDialog}>Add Widget</a>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
})
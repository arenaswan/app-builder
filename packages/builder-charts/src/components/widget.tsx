import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Chart } from './chart';
import { VisualizationName } from './visualizationName';

import './widget.less';
import './widget-dialog.less';
import '../assets/less/main.less';
export const Widget = observer((props: any) => {
    const { widget } = props;
    const { visualization } = widget;
    const a = false;
    return (
        <div className="widget-wrapper">
            <div className="tile body-container widget-visualization" ng-if="$ctrl.type=='visualization'" ng-class="$ctrl.type"
                ng-switch="$ctrl.widget.getQueryResult().getStatus()" ng-attr-data-refreshing="{{ $ctrl.widget.loading && !!$ctrl.widget.getQueryResult().getStatus() }}">
                <div className="body-row widget-header">
                    <div className="t-header widget clearfix">
                        <div className="dropdown pull-right widget-menu-remove" ng-if="!$ctrl.public && $ctrl.dashboard.canEdit()">
                            <div className="actions">
                                <a ng-click="$ctrl.deleteWidget()" title="Remove From Dashboard"><i className="zmdi zmdi-close"></i></a>
                            </div>
                        </div>
                        <div className="dropdown pull-right widget-menu-regular" ng-if="!$ctrl.public"
                            uib-dropdown-append-to-body="true"
                        >
                            <div className="actions">
                                <a data-toggle="dropdown" className="p-l-15 p-r-15"><i className="zmdi zmdi-more-vert"></i></a>
                            </div>

                            <ul className="dropdown-menu dropdown-menu-right">
                                <li ng-class="{'disabled': $ctrl.widget.getQueryResult().isEmpty()}"><a ng-href="{{$ctrl.widget.getQueryResult().getLink($ctrl.widget.getQuery().id, 'csv')}}" download="{{$ctrl.widget.getQueryResult().getName($ctrl.widget.getQuery().name, 'csv')}}" target="_self">Download as CSV File</a></li>
                                <li ng-class="{'disabled': $ctrl.widget.getQueryResult().isEmpty()}"><a ng-href="{{$ctrl.widget.getQueryResult().getLink($ctrl.widget.getQuery().id, 'xlsx')}}" download="{{$ctrl.widget.getQueryResult().getName($ctrl.widget.getQuery().name, 'xlsx')}}" target="_self">Download as Excel File</a></li>

                                <li ng-if="$ctrl.canViewQuery || ($ctrl.dashboard.canEdit() && $ctrl.hasParameters())" className="divider"></li>
                                <li ng-if="$ctrl.canViewQuery"><a ng-href="{{$ctrl.widget.getQuery().getUrl(true, $ctrl.widget.visualization.id)}}">View Query</a></li>
                                <li ng-if="$ctrl.dashboard.canEdit() && $ctrl.hasParameters()">
                                    <li ng-if="$ctrl.dashboard.canEdit() && $ctrl.hasParameters()"><a ng-click="$ctrl.editParameterMappings()">Edit Parameters</a></li>
                                </li>

                                <li ng-if="$ctrl.dashboard.canEdit()" className="divider"></li>
                                <li ng-if="$ctrl.dashboard.canEdit()"><a ng-click="$ctrl.deleteWidget()">Remove from Dashboard</a></li>
                            </ul>
                        </div>
                        <div className="refresh-indicator" ng-if="$ctrl.widget.loading" style={{display:'none'}}>
                            <div className="refresh-icon">
                                <i className="zmdi zmdi-refresh zmdi-hc-spin"></i>
                            </div>rd-timer
                            {/* <rd-timer from="$ctrl.widget.refreshStartedAt"></rd-timer> */}
                        </div>
                        <div className="th-title">
                            <a className="query-link">
                                <VisualizationName visualization={visualization}></VisualizationName>
                                <span>{visualization.query.name}</span>
                            </a>
                            <div className="text-muted query--description" ng-bind-html="$ctrl.widget.getQuery().description | markdown"></div>
                        </div>
                    </div>
                    <div className="m-b-10" ng-if="$ctrl.localParametersDefs().length > 0" style={{display:'none'}}>
                        {/* <parameters parameters="$ctrl.localParametersDefs()" on-values-change="$ctrl.forceRefresh"></parameters> */}
                        parameters
                    </div>
                </div>

                <div ng-switch-when="failed" className="body-row-auto scrollbox" style={{display:'none'}}>
                    <div className="alert alert-danger m-5" ng-show="$ctrl.widget.getQueryResult().getError()">Error running query: <strong>getError</strong></div>
                </div>
                <div ng-switch-when="done" className="body-row-auto scrollbox">
                    <div className="t-body">
                        <Chart chartId="610a4aef57bf2463c0af445b"></Chart>
                    </div>
                </div>
                <div className="body-row-auto spinner-container" style={{display:'none'}}>
                    <div className="spinner">
                        <i className="zmdi zmdi-refresh zmdi-hc-spin zmdi-hc-5x"></i>
                    </div>
                </div>

                <div className="body-row tile__bottom-control">
                    <span>
                        <a className="refresh-button hidden-print btn btn-sm btn-default btn-transparent" ng-click="$ctrl.refresh(1)" ng-if="!$ctrl.public && !!$ctrl.widget.getQueryResult()" data-test="RefreshButton">
                            <i className="zmdi zmdi-refresh" ng-class="{ 'zmdi-hc-spin': $ctrl.refreshClickButtonId === 1}"></i>
                            <span am-time-ago="$ctrl.widget.getQueryResult().getUpdatedAt()"></span>
                        </a>
                        <span className="small hidden-print" ng-if="$ctrl.public">
                            <i className="zmdi zmdi-time-restore"></i> <span am-time-ago="$ctrl.widget.getQueryResult().getUpdatedAt()"></span>
                        </span>
                        <span className="visible-print">
                            <i className="zmdi zmdi-time-restore"></i>dateTime 
                             {/* {{ $ctrl.widget.getQueryResult().getUpdatedAt() | dateTime }} */}
                        </span>
                    </span>

                    <span>
                        <button className="btn btn-sm btn-default hidden-print btn-transparent btn__refresh" ng-click="$ctrl.expandVisualization()"><i className="zmdi zmdi-fullscreen"></i></button>
                        <button className="btn btn-sm btn-default hidden-print btn-transparent btn__refresh" ng-click="$ctrl.refresh(2)" ng-if="!$ctrl.public">
                            <i className="zmdi zmdi-refresh" ng-class="{ 'zmdi-hc-spin': $ctrl.refreshClickButtonId === 2}"></i>
                        </button>
                    </span>
                </div>
            </div>
            { a != false && (<div>
            <div className="tile body-container d-flex justify-content-center align-items-center widget-restricted" ng-if="$ctrl.type=='restricted'" ng-class="$ctrl.type">
                <div className="t-body scrollbox">
                    <div className="text-center">
                        <h1><span className="zmdi zmdi-lock"></span></h1>
                        <p className="text-muted">
                            This widget requires access to a data source you don't have access to.
                        </p>
                    </div>
                </div>
            </div>

            <div className="tile body-container widget-text" ng-hide="$ctrl.widget.width === 0" ng-if="$ctrl.type=='textbox'" ng-class="$ctrl.type">
                <div className="body-row clearfix t-body">
                    <div className="dropdown pull-right widget-menu-remove" ng-if="!$ctrl.public && $ctrl.dashboard.canEdit()">
                        <div className="dropdown-header">
                            <a className="actions" ng-click="$ctrl.deleteWidget()" title="Remove From Dashboard"><i className="zmdi zmdi-close"></i></a>
                        </div>
                    </div>
                    <div className="dropdown pull-right widget-menu-regular" ng-if="!$ctrl.public && $ctrl.dashboard.canEdit()"
                        dropdown-append-to-body="true">
                        <div className="dropdown-header">
                            <a data-toggle="dropdown" className="actions p-l-15 p-r-15"><i className="zmdi zmdi-more-vert"></i></a>
                        </div>

                        <ul className="dropdown-menu dropdown-menu-right" style={{zIndex: 1000000}}>
                            <li><a ng-show="$ctrl.dashboard.canEdit()" ng-click="$ctrl.editTextBox()">Edit</a></li>
                            <li><a ng-show="$ctrl.dashboard.canEdit()" ng-click="$ctrl.deleteWidget()">Remove From Dashboard</a></li>
                        </ul>
                    </div>
                </div>
                <div className="body-row-auto scrollbox tiled t-body p-15 markdown" ng-bind-html="$ctrl.widget.text | markdown"></div>
            </div>
            </div>)}
        </div>

    );
})
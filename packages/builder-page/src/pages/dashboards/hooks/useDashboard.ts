import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { isEmpty, includes, compact, map, has, pick, keys, extend, every, get } from "lodash";
import notification from "../../../components/notification";
// import location from "@/services/location";
import url from "../../../services/url";
import { Dashboard, collectDashboardFilters } from "../../../services/dashboard";
// import { currentUser } from "@/services/auth";
import recordEvent from "../../../services/recordEvent";
import { QueryResultError } from "../../../services/query";
import AddWidgetDialog from "../../../components/dashboards/AddWidgetDialog";
import TextboxDialog from "../../../components/dashboards/TextboxDialog";
import PermissionsEditorDialog from "../../../components/PermissionsEditorDialog";
import { editableMappingsToParameterMappings, synchronizeWidgetTitles } from "../../../components/ParameterMappingInput";
import ShareDashboardDialog from "../components/ShareDashboardDialog";
import useFullscreenHandler from "../../../lib/hooks/useFullscreenHandler";
import useRefreshRateHandler from "./useRefreshRateHandler";
import useEditModeHandler from "./useEditModeHandler";
import { policy } from "../../../services/policy";
import { ObjectTable } from '@steedos-ui/builder-object';

export { DashboardStatusEnum } from "./useEditModeHandler";
//TODO 处理当前用户信息
const currentUser: any = {};

function getAffectedWidgets(widgets, updatedParameters = []) {
  return !isEmpty(updatedParameters)
    ? widgets.filter(widget =>
        Object.values(widget.getParameterMappings())
          .filter(({ type }) => type === "dashboard-level")
          .some(({ mapTo }) =>
            includes(
              updatedParameters.map(p => p.name),
              mapTo
            )
          )
      )
    : widgets;
}

function useDashboard(dashboardData) {
  const [dashboard, setDashboard] = useState(dashboardData);
  const [filters, setFilters] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [gridDisabled, setGridDisabled] = useState(false);
  const globalParameters = useMemo(() => dashboard.getParametersDefs(), [dashboard]);
  const canEditDashboard = !dashboard.is_archived && policy.canEdit(dashboard);
  const isDashboardOwnerOrAdmin = useMemo(
    () =>
      !dashboard.is_archived &&
      has(dashboard, "user.id") &&
      (currentUser.id === dashboard.user.id || currentUser.isAdmin),
    [dashboard]
  );
  const hasOnlySafeQueries = useMemo(
    () => every(dashboard.widgets, w => (w.getQuery() ? w.getQuery().is_safe : true)),
    [dashboard]
  );

  const managePermissions = useCallback(() => {
    const aclUrl = `api/dashboards/${dashboard.id}/acl`;
    PermissionsEditorDialog.showModal({
      aclUrl,
      context: "dashboard",
      author: dashboard.user,
    });
  }, [dashboard]);

  const updateDashboard = useCallback(
    (data, includeVersion = true) => {
      setDashboard(currentDashboard => extend({}, currentDashboard, data));
      data = { ...data, _id: dashboard._id };
      if (includeVersion) {
        data = { ...data, version: dashboard.version };
      }
      return (Dashboard as any).save(data)
        .then(updatedDashboard => {
          setDashboard(currentDashboard => extend({}, currentDashboard, pick(updatedDashboard, keys(data))));
          // if (has(data, "name")) {
          //   location.setPath(url.parse(updatedDashboard.url).pathname, true);
          // }
          console.log(`location.setPath`, url.parse(updatedDashboard.url).pathname)
        })
        .catch(error => {
          const status = get(error, "response.status");
          if (status === 403) {
            notification.error.call({},"Dashboard update failed", "Permission Denied.");
          } else if (status === 409) {
            notification.error.call({},
              "It seems like the dashboard has been modified by another user. ",
              "Please copy/backup your changes and reload this page.",
              { duration: null }
            );
          }
        });
    },
    [dashboard]
  );

  const togglePublished = useCallback(() => {
    recordEvent("toggle_published", "dashboard", dashboard.id);
    updateDashboard({ is_draft: !dashboard.is_draft }, false);
  }, [dashboard, updateDashboard]);

  const loadWidget = useCallback((widget, forceRefresh = false) => {
    widget.getParametersDefs(); // Force widget to read parameters values from URL
    setDashboard(currentDashboard => extend({}, currentDashboard));
    return widget
      .load(forceRefresh)
      .catch(error => {
        // QueryResultErrors are expected
        if (error instanceof QueryResultError) {
          return;
        }
        return Promise.reject(error);
      })
      .finally(() => setDashboard(currentDashboard => extend({}, currentDashboard)));
  }, []);

  const refreshWidget = useCallback(widget => loadWidget(widget, true), [loadWidget]);

  const removeWidget = useCallback(widgetId => {
    setDashboard(currentDashboard =>
      extend({}, currentDashboard, {
        widgets: currentDashboard.widgets.filter(widget => widget._id !== undefined && widget._id !== widgetId),
      })
    );
  }, []);

  const dashboardRef = useRef();
  dashboardRef.current = dashboard;

  const loadDashboard = useCallback(
    (forceRefresh = false, updatedParameters = []) => {
      const affectedWidgets = getAffectedWidgets((dashboardRef.current as any).widgets, updatedParameters);
      const loadWidgetPromises = compact(
        affectedWidgets.map(widget => loadWidget(widget, forceRefresh).catch(error => error))
      );

      return Promise.all(loadWidgetPromises).then(() => {
        const queryResults = compact(map((dashboardRef.current as any).widgets, widget => widget.getQueryResult()));
        const updatedFilters = collectDashboardFilters(dashboardRef.current, queryResults, location.search);
        setFilters(updatedFilters);
      });
    },
    [loadWidget]
  );

  const refreshDashboard = useCallback(
    updatedParameters => {
      if (!refreshing) {
        setRefreshing(true);
        loadDashboard(true, updatedParameters).finally(() => setRefreshing(false));
      }
    },
    [refreshing, loadDashboard]
  );

  const archiveDashboard = useCallback(() => {
    recordEvent("archive", "dashboard", dashboard.id);
    (Dashboard as any).delete(dashboard).then(updatedDashboard =>
      setDashboard(currentDashboard => extend({}, currentDashboard, pick(updatedDashboard, ["is_archived"])))
    );
  }, [dashboard]); // eslint-disable-line react-hooks/exhaustive-deps

  const showShareDashboardDialog = useCallback(() => {
    const handleDialogClose = () => setDashboard(currentDashboard => extend({}, currentDashboard));

    ShareDashboardDialog.showModal({
      dashboard,
      hasOnlySafeQueries,
    })
      .onClose(handleDialogClose)
      .onDismiss(handleDialogClose);
  }, [dashboard, hasOnlySafeQueries]);

  const showAddTextboxDialog = useCallback(() => {
    TextboxDialog.showModal({
      isNew: true,
    }).onClose(text =>
      dashboard.addWidget(text).then(() => setDashboard(currentDashboard => extend({}, currentDashboard)))
    );
  }, [dashboard]);

  const showAddWidgetDialog = useCallback(() => {
    (window as any).SteedosUI.showModal(ObjectTable, {
      title: `Add Charts`,
      objectApiName: 'charts',
      rowSelection: 'single',
      onFinish: async (values, rows) => {
          if(values && values.length > 0){
              // return addWidget(widgets, pageId, 'charts', rows[0])
            const parameterMappings = {};
            dashboard.addWidget(rows[0], {
              parameterMappings: editableMappingsToParameterMappings(parameterMappings),
            })
              .then(widget => {
                const widgetsToSave = [
                  widget,
                  ...synchronizeWidgetTitles(widget.options.parameterMappings, dashboard.widgets),
                ];
                return Promise.all(widgetsToSave.map(w => w.save())).then(() =>
                  setDashboard(currentDashboard => extend({}, currentDashboard))
                );
              })
          }
      }
  })
    // AddWidgetDialog.showModal({
    //   dashboard,
    // }).onClose(({ visualization, parameterMappings }) =>
    //   dashboard
    //     .addWidget(visualization, {
    //       parameterMappings: editableMappingsToParameterMappings(parameterMappings),
    //     })
    //     .then(widget => {
    //       const widgetsToSave = [
    //         widget,
    //         ...synchronizeWidgetTitles(widget.options.parameterMappings, dashboard.widgets),
    //       ];
    //       return Promise.all(widgetsToSave.map(w => w.save())).then(() =>
    //         setDashboard(currentDashboard => extend({}, currentDashboard))
    //       );
    //     })
    // );
  }, [dashboard]);

  const [refreshRate, setRefreshRate, disableRefreshRate] = useRefreshRateHandler(refreshDashboard);
  const [fullscreen, toggleFullscreen] = useFullscreenHandler();
  const editModeHandler = useEditModeHandler(!gridDisabled && canEditDashboard, dashboard.widgets);

  useEffect(() => {
    setDashboard(dashboardData);
    loadDashboard();
  }, [dashboardData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (dashboard.label) {
      document.title = dashboard.label;
    }
  }, [dashboard.label]);

  // reload dashboard when filter option changes
  useEffect(() => {
    loadDashboard();
  }, [dashboard.dashboard_filters_enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    dashboard,
    globalParameters,
    refreshing,
    filters,
    setFilters,
    loadDashboard,
    refreshDashboard,
    updateDashboard,
    togglePublished,
    archiveDashboard,
    loadWidget,
    refreshWidget,
    removeWidget,
    canEditDashboard,
    isDashboardOwnerOrAdmin,
    refreshRate,
    setRefreshRate,
    disableRefreshRate,
    ...editModeHandler,
    gridDisabled,
    setGridDisabled,
    fullscreen,
    toggleFullscreen,
    showShareDashboardDialog,
    showAddTextboxDialog,
    showAddWidgetDialog,
    managePermissions,
  };
}

export default useDashboard;

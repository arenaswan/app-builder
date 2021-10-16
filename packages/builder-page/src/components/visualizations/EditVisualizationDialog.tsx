import { isEqual, extend, map, sortBy, findIndex, filter, pick, omit } from "lodash";
import React, { useState, useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Select, Input } from 'antd';
import { wrap as wrapDialog, DialogPropType } from "../DialogWrapper";
import Filters, { filterData } from "../Filters";
import notification from "../notification";
import Visualization from "../../services/visualization";
import recordEvent from "../../services/recordEvent";
import useQueryResultData from "../../lib/useQueryResultData";
import { useUniqueId } from "../../lib/hooks/useUniqueId";
// import {
//   registeredVisualizations,
//   getDefaultVisualization,
//   newVisualization,
//   VisualizationType,
// } from "@redash/viz/lib";
import {
  registeredVisualizations,
  getDefaultVisualization,
  newVisualization,
  VisualizationType,
} from "@steedos/builder-viz-lib/lib";
import { Renderer, Editor } from "../visualizations/visualizationComponents";

import "./EditVisualizationDialog.less";

function updateQueryVisualizations(query: any, visualization: any) {
  const index = findIndex(query.visualizations, v => (v as any)._id === (visualization as any)._id);
  if (index > -1) {
    query.visualizations[index] = visualization;
  } else {
    // new visualization
    query.visualizations.push(visualization);
  }
  query.visualizations = [...query.visualizations]; // clone array
}

function saveVisualization(visualization) {
  if (visualization.id) {
    recordEvent("update", "visualization", visualization.id, { type: visualization.type });
  } else {
    recordEvent("create", "visualization", null, { type: visualization.type });
  }

  return Visualization.save(visualization)
    .then(result => {
      notification.success("Visualization saved" as any);
      result[0].id = result[0]._id;
      return result[0];
    })
    .catch(error => {
      notification.error(error.message as any);
      return Promise.reject(error);
    });
}

function confirmDialogClose(isDirty) {
  return new Promise<void>((resolve, reject) => {
    if (isDirty) {
      Modal.confirm({
        title: "Visualization Editor",
        content: "Are you sure you want to close the editor without saving?",
        okText: "Yes",
        cancelText: "No",
        onOk: () => resolve(),
        onCancel: () => reject(),
      });
    } else {
      resolve();
    }
  });
}

function EditVisualizationDialog({ dialog, visualization, query, queryResult }) {
  const errorHandlerRef = useRef();

  const isNew = !visualization;

  const data = useQueryResultData(queryResult);
  const [filters, setFilters] = useState(data.filters);

  const filteredData = useMemo(
    () => ({
      columns: data.columns,
      rows: filterData(data.rows, filters),
    }),
    [data, filters]
  );

  const defaultState = useMemo(() => {
    const config = visualization ? registeredVisualizations[visualization.type] : getDefaultVisualization();
    const options = config.getOptions(isNew ? {} : visualization.options, data);
    return {
      type: config.type,
      name: isNew ? config.name : visualization.name,
      label: isNew ? config.name : visualization.label,
      options,
      originalOptions: options,
    };
  }, [data, isNew, visualization]);

  const [type, setType] = useState(defaultState.type);
  const [name, setName] = useState(defaultState.name);
  const [label, setLabel] = useState(defaultState.label);
  const [labelChanged, setLabelChanged] = useState(false);
  const [options, setOptions] = useState(defaultState.options);

  const [saveInProgress, setSaveInProgress] = useState(false);

  useEffect(() => {
    if (errorHandlerRef.current) {
      (errorHandlerRef.current as any).reset();
    }
  }, [data, options]);

  function onTypeChanged(newType) {
    setType(newType);

    const config = registeredVisualizations[newType];
    if (!labelChanged) {
      setLabel(config.name);
    }

    setOptions(config.getOptions(isNew ? {} : visualization.options, data));
  }

  function onLabelChanged(newLabel) {
    setLabel(newLabel);
    setLabelChanged(newLabel !== label);
  }

  function onOptionsChanged(newOptions) {
    const config = registeredVisualizations[type];
    setOptions(config.getOptions(newOptions, data));
  }

  function save() {
    setSaveInProgress(true);
    let visualizationOptions = options;
    if (type === "TABLE") {
      visualizationOptions = omit(visualizationOptions, ["paginationSize"]);
    }

    const visualizationData = extend(newVisualization(type), visualization, {
      name,
      label,
      options: visualizationOptions,
      query_id: query.id,
    });
    saveVisualization(visualizationData).then(savedVisualization => {
      updateQueryVisualizations(query, savedVisualization);
      dialog.close(savedVisualization);
    }).catch(error=>{
      setSaveInProgress(false);
    });
  }

  function dismiss() {
    const optionsChanged = !isEqual(options, defaultState.originalOptions);
    confirmDialogClose(labelChanged || optionsChanged).then(dialog.dismiss);
  }

  // When editing existing visualization chart type selector is disabled, so add only existing visualization's
  // descriptor there (to properly render the component). For new visualizations show all types except of deprecated
  const availableVisualizations = isNew
    ? filter(sortBy(registeredVisualizations, ["name"]), vis => !vis.isDeprecated)
    : pick(registeredVisualizations, [type]);

  const vizTypeId = useUniqueId("visualization-type");
  const vizNameId = useUniqueId("visualization-name");
  const vizLabelId = useUniqueId("visualization-label");
  return (
    <Modal
      {...dialog.props}
      wrapClassName="ant-modal-fullscreen"
      title="Visualization Editor"
      okText="Save"
      okButtonProps={{
        loading: saveInProgress,
        disabled: saveInProgress,
      }}
      onOk={save}
      onCancel={dismiss}
      wrapProps={{ "data-test": "EditVisualizationDialog" }}>
      <div className="edit-visualization-dialog">
        <div className="visualization-settings">
          <div className="m-b-15">
            <label htmlFor={vizTypeId}>Visualization Type</label>
            <Select
              data-test="VisualizationType"
              id={vizTypeId}
              className="w-100"
              disabled={!isNew}
              value={type}
              onChange={onTypeChanged}>
              {map(availableVisualizations, vis => (
                <Select.Option key={vis.type} value={vis.type} data-test={"VisualizationType." + vis.type}>
                  {vis.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="m-b-15">
            <label htmlFor={vizNameId}>Visualization Api Name</label>
            <Input
              data-test="VisualizationName"
              id={vizNameId}
              className="w-100"
              value={name}
              onChange={event => setName(event.target.value)}
            />
          </div>
          <div className="m-b-15">
            <label htmlFor={vizLabelId}>Visualization Label</label>
            <Input
              data-test="VisualizationLabel"
              id={vizLabelId}
              className="w-100"
              value={label}
              onChange={event => onLabelChanged(event.target.value)}
            />
          </div>
          <div data-test="VisualizationEditor">
            <Editor
              type={type}
              data={data}
              options={options}
              visualizationName={name}
              onOptionsChange={onOptionsChanged}
            />
          </div>
        </div>
        <div className="visualization-preview">
          <label htmlFor="visualization-preview" className="invisible hidden-xs">
            Preview
          </label>
          <Filters filters={filters} onChange={setFilters} />
          <div className="scrollbox" data-test="VisualizationPreview">
            <Renderer
              type={type}
              data={filteredData}
              options={options}
              visualizationName={name}
              onOptionsChange={onOptionsChanged}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

EditVisualizationDialog.propTypes = {
  dialog: DialogPropType.isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  visualization: VisualizationType,
  queryResult: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

EditVisualizationDialog.defaultProps = {
  visualization: null,
};

export default wrapDialog(EditVisualizationDialog);

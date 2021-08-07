import { isMatch, map, find, sortBy } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import Modal from "antd/lib/modal";
import { wrap as wrapDialog, DialogPropType } from "../DialogWrapper";
import {
  MappingType,
  ParameterMappingListInput,
  parameterMappingsToEditableMappings,
  editableMappingsToParameterMappings,
  synchronizeWidgetTitles,
} from "../ParameterMappingInput";
import notification from "../notification";

export function getParamValuesSnapshot(mappings, dashboardParameters) {
  return map(
    sortBy(mappings, m => m.name),
    m => {
      let param;
      switch (m.type) {
        case MappingType.StaticValue:
          return [m.name, m.value];
        case MappingType.WidgetLevel:
          return [m.name, m.param.value];
        case MappingType.DashboardAddNew:
        case MappingType.DashboardMapToExisting:
          param = find(dashboardParameters, p => p.name === m.mapTo);
          return [m.name, param ? param.value : null];
        // no default
      }
    }
  );
}

class EditParameterMappingsDialog extends React.Component {
  static propTypes = {
    dashboard: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    widget: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    dialog: DialogPropType.isRequired,
  };

  originalParamValuesSnapshot = null;

  constructor(props) {
    super(props);

    const parameterMappings = parameterMappingsToEditableMappings(
      props.widget.options.parameterMappings,
      props.widget.query.getParametersDefs(),
      map((this.props as any).dashboard.getParametersDefs(), p => p.name)
    );

    this.originalParamValuesSnapshot = getParamValuesSnapshot(
      parameterMappings,
      (this.props as any).dashboard.getParametersDefs()
    );

    this.state = {
      saveInProgress: false,
      parameterMappings,
    };
  }

  saveWidget() {
    const widget = (this.props as any).widget;

    this.setState({ saveInProgress: true });

    const newMappings = editableMappingsToParameterMappings((this.state as any).parameterMappings);
    widget.options.parameterMappings = newMappings;

    const valuesChanged = !isMatch(
      this.originalParamValuesSnapshot,
      getParamValuesSnapshot((this.state as any).parameterMappings, (this.props as any).dashboard.getParametersDefs())
    );

    const widgetsToSave = [
      widget,
      ...synchronizeWidgetTitles(widget.options.parameterMappings, (this.props as any).dashboard.widgets),
    ];

    Promise.all(map(widgetsToSave, w => w.save()))
      .then(() => {
        (this.props as any).dialog.close(valuesChanged);
      })
      .catch(() => {
        notification.error(("Widget cannot be updated" as any));
      })
      .finally(() => {
        this.setState({ saveInProgress: false });
      });
  }

  updateParamMappings(parameterMappings) {
    this.setState({ parameterMappings });
  }

  render() {
    const { dialog } = this.props as any;
    return (
      <Modal
        {...dialog.props}
        title="Parameters"
        onOk={() => this.saveWidget()}
        okButtonProps={{ loading: (this.state as any).saveInProgress }}
        width={700}>
        {(this.state as any).parameterMappings.length > 0 && (
          <ParameterMappingListInput
            mappings={(this.state as any).parameterMappings}
            existingParams={(this.props as any).dashboard.getParametersDefs()}
            onChange={mappings => this.updateParamMappings(mappings)}
          />
        )}
      </Modal>
    );
  }
}

export default wrapDialog(EditParameterMappingsDialog);

import React from 'react';
import PropTypes from 'prop-types';
import { registeredVisualizations } from '../config/visualizations';
export class VisualizationName extends React.Component {
static propTypes = {
    visualization: PropTypes.object,
};
  render() {
    const { visualization } = (this.props as any);
    const config = registeredVisualizations[visualization.type];
    if (config) {
        if (visualization.name !== config.name) {
          return (
                <span className="visualization-name">{visualization.name}</span>
          );
        }
    }
    return (<></>);
  }
}

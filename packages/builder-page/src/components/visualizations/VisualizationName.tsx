import React from "react";
import { VisualizationType, registeredVisualizations } from "@redash/viz/lib";

import "./VisualizationName.less";

function VisualizationName({ visualization }) {
  const config = registeredVisualizations[visualization.type];
  return (
    <span className="visualization-name">
      {config && visualization.label !== config.name ? visualization.label : null}
    </span>
  );
}

VisualizationName.propTypes = {
  visualization: VisualizationType.isRequired,
};

export default VisualizationName;

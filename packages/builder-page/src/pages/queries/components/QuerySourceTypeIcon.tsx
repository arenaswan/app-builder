import PropTypes from "prop-types";
import React from "react";

export function QuerySourceTypeIcon(props) {
  const logo = require(`../../../assets/images/db-logos/${props.type}.png`);
  return <img src={String(logo)} width="20" alt={props.alt} style={{display: 'inline'}}/>;
}

QuerySourceTypeIcon.propTypes = {
  type: PropTypes.string,
  alt: PropTypes.string,
  title: PropTypes.string,
};

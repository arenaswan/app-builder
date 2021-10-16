import PropTypes from "prop-types";
import React from "react";
import mongodb from '../../../assets/images/db-logos/mongodb.png';
import json from '../../../assets/images/db-logos/json.png';
export function QuerySourceTypeIcon(props) {
  let logo = null;
  if(props.type === 'mongodb'){
    logo = mongodb
  }else if(props.type === 'json'){
    logo = json
  }
  return <img src={String(logo)} width="20" alt={props.alt} style={{display: 'inline'}}/>;
}

QuerySourceTypeIcon.propTypes = {
  type: PropTypes.string,
  alt: PropTypes.string,
  title: PropTypes.string,
};

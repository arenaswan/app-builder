import PropTypes from "prop-types";
import React from "react";
import mongodb from '../../../assets/images/db-logos/mongodb.png';
import json from '../../../assets/images/db-logos/json.png';
import mysql from '../../../assets/images/db-logos/mysql.png';
import mssql from '../../../assets/images/db-logos/mssql.png';
import oracle from '../../../assets/images/db-logos/oracle.png';
import pg from '../../../assets/images/db-logos/pg.png';
import sqlite from '../../../assets/images/db-logos/sqlite.png';
export function QuerySourceTypeIcon(props) {
  let logo = null;
  if(props.type === 'mongodb'){
    logo = mongodb
  }else if(props.type === 'json'){
    logo = json
  } else if (props.type === 'mysql') {
    logo = mysql
  } else if (props.type === 'mssql') {
    logo = mssql
  } else if (props.type === 'oracle') {
    logo = oracle
  } else if (props.type === 'pg') {
    logo = pg
  } else if (props.type === 'sqlite') {
    logo = sqlite
  }
  return <img src={String(logo)} width="20" alt={props.alt} style={{display: 'inline'}}/>;
}

QuerySourceTypeIcon.propTypes = {
  type: PropTypes.string,
  alt: PropTypes.string,
  title: PropTypes.string,
};

import React from "react";
import PropTypes from "prop-types";
import Link from "../Link";
import { API } from '@steedos-ui/builder-store';

export default function QueryResultsLink(props) {
  let href = "";

  const { query, queryResult, fileType } = props;
  const resultId = queryResult.getId && queryResult.getId();
  const resultData = queryResult.getData && queryResult.getData();

  if (resultId && resultData && query.name) {
    if (query.id) {
      const query_hash = queryResult.query_result?.query_hash
      href = `${API.client.getUrl()}/service/api/~packages-@steedos/service-charts/queries/${query.id}/results/${query_hash}.${fileType}${props.embed ? `?api_key=${props.apiKey}` : ""}`;
    } else {
      href = `api/query_results/${resultId}.${fileType}`;
    }
  }

  return (
    <Link target="_blank" rel="noopener noreferrer" disabled={props.disabled} href={href} download>
      {props.children}
    </Link>
  );
}

QueryResultsLink.propTypes = {
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  queryResult: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  fileType: PropTypes.string,
  disabled: PropTypes.bool.isRequired,
  embed: PropTypes.bool,
  apiKey: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

QueryResultsLink.defaultProps = {
  queryResult: {},
  fileType: "csv",
  embed: false,
  apiKey: "",
};

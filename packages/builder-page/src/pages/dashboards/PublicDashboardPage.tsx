import { isEmpty } from "lodash";
import React from "react";
import PropTypes from "prop-types";

import BigMessage from "../../components/BigMessage";
import PageHeader from "../../components/PageHeader";
import Parameters from "../../components/Parameters";
import DashboardGrid from "../../components/dashboards/DashboardGrid";
import Filters from "../../components/Filters";

import { Dashboard } from "../../services/dashboard";

import useDashboard from "./hooks/useDashboard";


import '../../assets/less/global.less';
import "./PublicDashboardPage.less";

function PublicDashboard({ dashboard, hiddenTitle }) {
  const { globalParameters, filters, setFilters, refreshDashboard, loadWidget, refreshWidget } = useDashboard(
    dashboard
  );

  return (
      <div className="container p-t-10 p-b-20">
      {!hiddenTitle && <PageHeader title={dashboard.label} />}
      {!isEmpty(globalParameters) && (
        <div className="m-b-10 p-15 bg-white tiled">
          <Parameters parameters={globalParameters} onValuesChange={refreshDashboard} />
        </div>
      )}
      {!isEmpty(filters) && (
        <div className="m-b-10 p-15 bg-white tiled">
          <Filters filters={filters} onChange={setFilters} />
        </div>
      )}
      <div id="dashboard-container">
        <DashboardGrid
          dashboard={dashboard}
          widgets={dashboard.widgets}
          filters={filters}
          isEditing={false}
          isPublic
          onLoadWidget={loadWidget}
          onRefreshWidget={refreshWidget}
        />
      </div>
    </div>
  );
}

PublicDashboard.propTypes = {
  dashboard: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  hiddenTitle: PropTypes.bool,
};

class PublicDashboardPage extends React.Component {
  static propTypes = {
    token: PropTypes.string.isRequired,
    hiddenTitle: PropTypes.bool,
    onError: PropTypes.func,
  };

  static defaultProps = {
    onError: () => {},
  };

  state = {
    loading: true,
    dashboard: null,
  };

  componentDidMount() {
    (Dashboard as any).getByToken({ token: (this.props as any).token })
      .then(dashboard => this.setState({ dashboard, loading: false }))
      .catch(error => (this.props as any).onError(error));
  }

  render() {
    const { loading, dashboard } = this.state;
    const { hiddenTitle = false } = (this.props as any)
    return (
    <div className="steedos-page">
      
      <div className="public-dashboard-page">
        {loading ? (
          <div className="container loading-message">
            <BigMessage className="" icon="fa-spinner fa-2x fa-pulse" message="Loading..." />
          </div>
        ) : (
          <PublicDashboard dashboard={dashboard} hiddenTitle={hiddenTitle}/>
        )}
      </div>
      </div>
    );
  }
}

export default PublicDashboardPage;
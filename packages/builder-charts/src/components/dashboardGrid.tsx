import React from 'react';
import * as PropTypes from 'prop-types';
import { chain, cloneDeep, find } from 'lodash';
import cx from 'classnames';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Widget } from './widget';
// import { FiltersType } from './Filters';
import cfg from '../config/dashboard-grid-options';
import AutoHeightController from './AutoHeightController';
import TextboxWidget from './TextboxWidget'

import 'react-grid-layout/css/styles.css';
import './dashboard-grid.less';

const ResponsiveGridLayout = WidthProvider(Responsive);

const WidgetType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  options: PropTypes.shape({
    position: PropTypes.shape({
      col: PropTypes.number.isRequired,
      row: PropTypes.number.isRequired,
      sizeY: PropTypes.number.isRequired,
      minSizeY: PropTypes.number.isRequired,
      maxSizeY: PropTypes.number.isRequired,
      sizeX: PropTypes.number.isRequired,
      minSizeX: PropTypes.number.isRequired,
      maxSizeX: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
});

export type DashboardGridProps = {
  isEditing: any,
  isPublic: any,
  dashboard: any,
  widgets: any,
  // filters: FiltersType,
  onBreakpointChange: any,
  onRemoveWidget: any,
  onLayoutChange: any,
};

const SINGLE = 'single-column';
const MULTI = 'multi-column';

export class DashboardGrid extends React.Component {
  static propTypes = {
    isEditing: PropTypes.bool.isRequired,
    isPublic: PropTypes.bool,
    // dashboard: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.arrayOf(WidgetType).isRequired,
    onBreakpointChange: PropTypes.func,
    onRemoveWidget: PropTypes.func,
    onLayoutChange: PropTypes.func,
  };

  static defaultProps = {
    isPublic: false,
    filters: [],
    onRemoveWidget: () => {},
    onLayoutChange: () => {},
    onBreakpointChange: () => {},
  };

  static normalizeFrom(widget) {
    const { _id: id, options: { position: pos } } = widget;

    return {
      i: id,
      x: pos.col,
      y: pos.row,
      w: pos.sizeX,
      h: pos.sizeY,
      minW: pos.minSizeX,
      maxW: pos.maxSizeX,
      minH: pos.minSizeY,
      maxH: pos.maxSizeY,
    };
  }

  mode = null;

  autoHeightCtrl = null;

  constructor(props: any) {
    super(props);

    this.state = {
      layouts: {},
      disableAnimations: true,
    };

    // init AutoHeightController
    this.autoHeightCtrl = new AutoHeightController(this.onWidgetHeightUpdated);
    this.autoHeightCtrl.update((this.props as any).widgets);
  }

  componentDidMount() {
    this.onBreakpointChange(document.body.offsetWidth <= cfg.mobileBreakPoint ? SINGLE : MULTI);
    // Work-around to disable initial animation on widgets; `measureBeforeMount` doesn't work properly:
    // it disables animation, but it cannot detect scrollbars.
    setTimeout(() => {
      this.setState({ disableAnimations: false });
    }, 50);
  }

  componentDidUpdate() {
    // update, in case widgets added or removed
    this.autoHeightCtrl.update((this.props as any).widgets);
  }

  componentWillUnmount() {
    this.autoHeightCtrl.destroy();
  }

  onLayoutChange = (_, layouts) => {
    console.log(`onLayoutChange layouts`, layouts)
    // workaround for when dashboard starts at single mode and then multi is empty or carries single col data
    // fixes test dashboard_spec['shows widgets with full width']
    // TODO: open react-grid-layout issue
    if (layouts[MULTI]) {
      this.setState({ layouts });
    }

    // workaround for https://github.com/STRML/react-grid-layout/issues/889
    // remove next line when fix lands
    this.mode = document.body.offsetWidth <= cfg.mobileBreakPoint ? SINGLE : MULTI;
    // end workaround

    // don't save single column mode layout
    if (this.mode === SINGLE) {
      return;
    }

    const normalized = chain(layouts[MULTI])
      .keyBy('i')
      .mapValues(this.normalizeTo)
      .value();

      (this.props as any).onLayoutChange(normalized);
  };

  onBreakpointChange = (mode) => {
    this.mode = mode;
    (this.props as any).onBreakpointChange(mode === SINGLE);
  };

  // height updated by auto-height
  onWidgetHeightUpdated = (widgetId, newHeight) => {
    this.setState((sitem: any) => {
      const layout = cloneDeep(sitem.layouts[MULTI]); // must clone to allow react-grid-layout to compare prev/next state
      const item = find(layout, { i: widgetId.toString() });
      if (item) {
        // update widget height
        item.h = Math.ceil((newHeight + cfg.margins) / cfg.rowHeight);
      }

      return { layouts: { [MULTI]: layout } };
    });
  };

  // height updated by manual resize
  onWidgetResize = (layout, oldItem, newItem) => {
    if (oldItem.h !== newItem.h) {
      this.autoHeightCtrl.remove(Number(newItem.i));
    }

    this.autoHeightCtrl.resume();
  };

  normalizeTo = layout => ({
    col: layout.x,
    row: layout.y,
    sizeX: layout.w,
    sizeY: layout.h,
    autoHeight: this.autoHeightCtrl.exists(layout.i),
  });

  render() {
    const className = cx('dashboard-wrapper', (this.props as any).isEditing ? 'editing-mode' : 'preview-mode');
    const { onRemoveWidget, dashboard, widgets } = (this.props as any);

    return (
      <div className={className}>
        <ResponsiveGridLayout
          className={cx('layout', { 'disable-animations': (this.state as any).disableAnimations })}
          cols={{ [MULTI]: cfg.columns, [SINGLE]: 1 }}
          rowHeight={cfg.rowHeight - cfg.margins}
          margin={[cfg.margins, cfg.margins]}
          isDraggable={(this.props as any).isEditing}
          isResizable={(this.props as any).isEditing}
          onResizeStart={this.autoHeightCtrl.stop}
          onResizeStop={this.onWidgetResize}
          layouts={(this.state as any).layouts}
          onLayoutChange={this.onLayoutChange}
          onBreakpointChange={this.onBreakpointChange}
          breakpoints={{ [MULTI]: cfg.mobileBreakPoint, [SINGLE]: 0 }}
        >
          {widgets.map(widget => (
            <div
              key={widget._id}
              data-grid={DashboardGrid.normalizeFrom(widget)}
              data-widgetid={widget._id}
              data-test={`WidgetId${widget._id}`}
              className={cx('dashboard-widget-wrapper', { 'widget-auto-height-enabled': this.autoHeightCtrl.exists(widget._id) })}
            >
              {widget.visualization && <Widget
                widget={widget}
                // dashboard={dashboard}
                filters={(this.props as any).filters}
                deleted={() => onRemoveWidget(widget._id)}
                public={(this.props as any).isPublic}
              />
              }

              {!widget.visualization && 
              <TextboxWidget widget={widget} canEdit={true} />
              }
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    );
  }
}

import React, { useState } from "react";
import { Renderer, updateVisualizationsSettings } from "@steedos-ui/builder-viz-lib";
import { observer } from "mobx-react-lite";
import { Queries, Objects } from "@steedos-ui/builder-store";
import './chart.less'

const CHART_OBJECT_APINAME = 'charts';

export type ChartProps = {
    chartId: string
}

function wrapComponentWithSettings(WrappedComponent) {
    return function VisualizationComponent(props) {
      updateVisualizationsSettings({
        dateFormat: "YYYY/MM/DD",
        booleanValues: ["False", "True"],
        displayModeBar: 'hover',
      });
  
      return <WrappedComponent {...props} />;
    };
  }
export const ConfiguredRenderer = wrapComponentWithSettings(Renderer);
export const Chart = observer((props: ChartProps) => {
    const { chartId } = props;
    const object: any = Objects.getObject(CHART_OBJECT_APINAME);
    if (object.isLoading) return (<div>Loading object ...</div>);
    const recordCache = object.getRecord(chartId, [])
    if (recordCache.isLoading) return (<div>Loading record ...</div>)
    let record: any = null;
    if(recordCache.data){
        record = recordCache.data;
    }
    if(!record){
        return (<div>Loading record ...</div>)
    }
    const query: any = Queries.getData(record.query);
    if (query.isLoading) return (<div>Loading Query Results...</div>)
    const data = query.data;
    const defOptions = {
        stepCol: {},
        valueCol: {},
        sortKeyCol: {},
        mapType: 'countries',
        controls: {
            enabled: true
        },
        rendererOptions:{
            table: {
                rowTotals: true
            }
        },
        wordCountLimit:{

        },
        wordLengthLimit: {
            
        }
    }
    return (
        <ConfiguredRenderer type={record.type} options={Object.assign({}, defOptions, record.options)} data={data} />
    );
})
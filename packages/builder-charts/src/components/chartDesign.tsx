import React, { useState, useEffect } from "react";
import { Renderer, Editor } from "@steedos/builder-viz-lib";
import { Select } from 'antd';
import { observer } from "mobx-react-lite";
import { Queries } from "@steedos/builder-store";
import { Row, Col, Form, Input } from 'antd';
import { Objects } from '@steedos/builder-store';

const { Option } = Select;
export const CHART_OBJECT_APINAME = 'charts';

export type ChartDesignProps = {
    chartId: string,
    onEditOptionsChange?: Function,
    form?: any
}

export const ChartDesign = observer((props: ChartDesignProps) => {
    const { chartId, form, onEditOptionsChange } = props;
    const object: any = Objects.getObject(CHART_OBJECT_APINAME);
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
    let record: any = null;
    const recordCache = object.getRecord(chartId, [])
    if(recordCache.data){
        record = recordCache.data;
    }
    const [options, setOptions] = useState(Object.assign({}, defOptions, record?.options));
    const [type, setType] = useState(record?.type);
    useEffect(() => {
        setOptions(Object.assign({}, defOptions, record?.options))
        setType(record?.type)
    }, [JSON.stringify(record)]);

    if (object.isLoading) return (<div>Loading object ...</div>);
    if (recordCache.isLoading) return (<div>Loading record ...</div>)
    if(!record){
        return (<div>Loading record ...</div>)
    }

    const query: any = Queries.getData(record.query);
    if (query.isLoading) return (<div>Loading Query Results...</div>)

    const data = query.data?.query_result?.data
    const onOptionsChange = function (data) {
        setOptions(data)
        if(onEditOptionsChange){
            onEditOptionsChange(data);
        }
    }

    const onChange = function (a, b, c, d) {
        console.log(`onChange`, a, b, c, d)
    }

    const handleChange = function (value) {
        setType(value);
    }
    
    const onValuesChange = function (values) {
        console.log(`onFormLayoutChange3333`, values)
        console.log(`options`, options)
    }
    return (
        <Row gutter={[24, 24]}>
            <Col span={9}>
                <Form
                    form={form}
                    layout="vertical"
                    onValuesChange={onValuesChange}
                    initialValues={{
                        type: type,
                        label: record.label,
                    }}
                >
                    <Form.Item label="Visualization Type" name="type" rules={[{ required: true }]}>
                        <Select style={{ width: "100%" }} onChange={handleChange}>
                            <Option value="CHART">Chart</Option>
                            <Option value="COHORT">Cohort</Option>
                            <Option value="COUNTER">Counter</Option>
                            <Option value="DETAILS">Details View</Option>
                            <Option value="FUNNEL">Funnel</Option>
                            {/* <Option value="CHOROPLETH">Map (Choropleth)</Option>
                            <Option value="Map (Markers)">MAP</Option> */}
                            <Option value="PIVOT">Pivot Table</Option>
                            <Option value="SANKEY">Sankey</Option>
                            <Option value="SUNBURST_SEQUENCE">Sunburst Sequence</Option>
                            <Option value="TABLE">Table</Option>
                            <Option value="WORD_CLOUD">Word Cloud</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Visualization Name" name="label" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Form>
                <Editor
                    type={type}
                    visualizationName="Example Visualization"
                    options={options}
                    data={data}
                    onChange={onChange}
                    onOptionsChange={onOptionsChange}
                />
            </Col>
            <Col span={14}>
                <Renderer type={type} options={options} data={data} />
            </Col>
        </Row>
    );
})
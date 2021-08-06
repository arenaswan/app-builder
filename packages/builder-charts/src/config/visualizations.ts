export const registeredVisualizations = {
    BOXPLOT: {
        name: 'Boxplot (Deprecated)',
        defaultRows: 8,
        minRows: 5,
    },
    CHART: {
        name: 'Chart',
        defaultColumns: 3,
        defaultRows: 8,
        minColumns: 1,
        minRows: 5,
    },
    CHOROPLETH: {
        name: 'Map (Choropleth)',
        defaultColumns: 3,
        defaultRows: 8,
        minColumns: 2,
    },
    COHORT: {
        name: 'Cohort',
        autoHeight: true,
        defaultRows: 8,
    },
    COUNTER: {
        name: 'Counter',
        defaultColumns: 2,
        defaultRows: 5,
    },
    DETAILS: {
        name: 'Details View',
        defaultColumns: 2,
        defaultRows: 2,
    },
    FUNNEL: {
        name: 'Funnel',
        defaultRows: 10,
    },
    MAP: {
        name: 'Map (Markers)',
        defaultColumns: 3,
        defaultRows: 8,
        minColumns: 2,
    },
    PIVOT: {
        name: 'Pivot Table',
        defaultRows: 10,
        defaultColumns: 3,
        minColumns: 2,
    },
    SANKEY: {
        name: 'Sankey',
        defaultRows: 7,
    },
    SUNBURST_SEQUENCE: {
        name: 'Sunburst Sequence',
        defaultRows: 7,
    },
    TABLE: {
        name: 'Table',
        autoHeight: true,
        defaultRows: 14,
        defaultColumns: 3,
        minColumns: 2,
    },
    WORD_CLOUD: {
        name: 'Word Cloud',
        defaultRows: 8,
    }
}

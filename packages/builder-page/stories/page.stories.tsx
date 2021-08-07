import * as React from "react"
import { Page } from '@steedos/builder-page';
export default {
  title: "Page",
}


const widgets = [
  {
      "visualization": {
          "description": "",
          "created_at": "2021-07-28T08:24:53.476Z",
          "updated_at": "2021-07-28T08:29:14.896Z",
          "id": 11,
          "query": {
              "user": {
                  "auth_type": "password",
                  "is_disabled": false,
                  "updated_at": "2021-08-05T02:23:28.410Z",
                  "profile_image_url": "https://www.gravatar.com/avatar/4825c2a52fd0164dfff5785cec514823?s=40&d=identicon",
                  "is_invitation_pending": false,
                  "groups": [
                      1,
                      2
                  ],
                  "id": 1,
                  "name": "admin",
                  "created_at": "2021-07-27T06:50:26.282Z",
                  "disabled_at": null,
                  "is_email_verified": true,
                  "active_at": "2021-08-05T02:22:33Z",
                  "email": "chenzhipei@hotoa.com"
              },
              "created_at": "2021-07-28T08:24:53.476Z",
              "latest_query_data_id": null,
              "schedule": null,
              "description": null,
              "tags": [],
              "updated_at": "2021-07-28T08:26:46.375Z",
              "last_modified_by": {
                  "auth_type": "password",
                  "is_disabled": false,
                  "updated_at": "2021-08-05T02:23:28.410Z",
                  "profile_image_url": "https://www.gravatar.com/avatar/4825c2a52fd0164dfff5785cec514823?s=40&d=identicon",
                  "is_invitation_pending": false,
                  "groups": [
                      1,
                      2
                  ],
                  "id": 1,
                  "name": "admin",
                  "created_at": "2021-07-27T06:50:26.282Z",
                  "disabled_at": null,
                  "is_email_verified": true,
                  "active_at": "2021-08-05T02:22:33Z",
                  "email": "chenzhipei@hotoa.com"
              },
              "options": {
                  "parameters": [
                      {
                          "name": "\u6240\u5c5e\u516c\u53f8",
                          "title": "\u6240\u5c5e\u516c\u53f8",
                          "global": false,
                          "value": "KtM4v3LMuYykgAjL7",
                          "queryId": 1,
                          "parentQueryId": 5,
                          "type": "query",
                          "locals": []
                      },
                      {
                          "name": "\u65f6\u95f4\u8303\u56f4",
                          "title": "\u65f6\u95f4\u8303\u56f4",
                          "global": false,
                          "value": "d_this_month",
                          "locals": [],
                          "type": "datetime-range",
                          "parentQueryId": 5
                      }
                  ]
              },
              "is_safe": true,
              "version": 1,
              "query_hash": "89baf5045f79e0317ad55380342a2686",
              "is_archived": false,
              "query": "{\n    \"collection\": \"pcmes_component_detail__c\",\n    \"aggregate\": [\n        {\n            \"$project\": {\n                \"company_id\": \"$company_id\",\n                \"team__c\": \"$team__c\",\n                \"unit_volume__c\": \"$unit_volume__c\",\n                \"datetime_pound__c\": {\n                    \"$dateToString\": {\n                        \"format\": \"%Y-%m-%d %H:%M\",\n                        \"date\": \"$datetime_pound__c\"\n                    }\n                }\n            }\n        },\n        {\n            \"$match\": {\n                \"company_id\": \"{{ \u6240\u5c5e\u516c\u53f8 }}\",\n                \"$and\": [\n                    {\n                        \"datetime_pound__c\": {\n                            \"$gte\": \"{{ \u65f6\u95f4\u8303\u56f4.start }}\"\n                        }\n                    },\n                    {\n                        \"datetime_pound__c\": {\n                            \"$lte\": \"{{ \u65f6\u95f4\u8303\u56f4.end }}\"\n                        }\n                    }\n                ]\n            }\n        },\n        {\n            \"$lookup\": {\n                \"from\": \"pcmes_team__c\",\n                \"localField\": \"team__c\",\n                \"foreignField\": \"_id\",\n                \"as\": \"team__c\"\n            }\n        },\n        {\n            \"$unwind\": \"$team__c\"\n        },\n        {\n            \"$group\": {\n                \"_id\": \"$team__c.name\",\n                \"total_volume\": {\n                    \"$sum\": \"$unit_volume__c\"\n                },\n                \"count\": {\n                    \"$sum\": 1\n                }\n            }\n        }\n    ]\n}",
              "api_key": "AkEC3weRiwIL6Kq4eN0yOKqgMs04lSFOMhELj9ex",
              "is_draft": false,
              "id": 5,
              "data_source_id": 1,
              "name": "\u6d47\u6363\u7edf\u8ba1-\u6309\u73ed\u7ec4\u7edf\u8ba1"
          },
          "type": "CHART",
          "options": {
              "showDataLabels": true,
              "direction": {
                  "type": "counterclockwise"
              },
              "missingValuesAsZero": true,
              "error_y": {
                  "visible": true,
                  "type": "data"
              },
              "numberFormat": "0,0[.]00000",
              "yAxis": [
                  {
                      "type": "linear",
                      "title": {
                          "text": ""
                      }
                  },
                  {
                      "opposite": true,
                      "type": "linear",
                      "rangeMin": null,
                      "title": {
                          "text": ""
                      }
                  }
              ],
              "series": {
                  "stacking": null,
                  "error_y": {
                      "visible": true,
                      "type": "data"
                  }
              },
              "globalSeriesType": "column",
              "percentFormat": "0[.]00%",
              "sortX": false,
              "seriesOptions": {
                  "count": {
                      "index": 0,
                      "name": "\u5757",
                      "yAxis": 0,
                      "color": "#00B6EB",
                      "zIndex": 1,
                      "type": "column"
                  },
                  "total_volume": {
                      "index": 0,
                      "name": "\u65b9\u91cf(m\u00b3)",
                      "yAxis": 0,
                      "color": "#FB8D3D",
                      "zIndex": 0,
                      "type": "column"
                  }
              },
              "valuesOptions": {},
              "xAxis": {
                  "labels": {
                      "enabled": true
                  },
                  "type": "-",
                  "title": {
                      "text": ""
                  }
              },
              "reverseY": false,
              "dateTimeFormat": "DD/MM/YY HH:mm",
              "columnMapping": {
                  "count": "y",
                  "_id": "x",
                  "total_volume": "y"
              },
              "textFormat": "",
              "customCode": "// Available variables are x, ys, element, and Plotly\n// Type console.log(x, ys); for more info about x and ys\n// To plot your graph call Plotly.plot(element, ...)\n// Plotly examples and docs: https://plot.ly/javascript/",
              "legend": {
                  "enabled": true
              }
          },
          "name": "Chart"
      },
      "text": "",
      "created_at": "2021-07-28T08:29:14.896Z",
      "updated_at": "2021-07-28T09:17:39.466Z",
      "options": {
          "parameterMappings": {
              "\u65f6\u95f4\u8303\u56f4": {
                  "type": "dashboard-level",
                  "mapTo": "\u65f6\u95f4\u8303\u56f4",
                  "name": "\u65f6\u95f4\u8303\u56f4",
                  "value": null,
                  "title": ""
              },
              "\u6240\u5c5e\u516c\u53f8": {
                  "type": "dashboard-level",
                  "mapTo": "\u6240\u5c5e\u516c\u53f8",
                  "name": "\u6240\u5c5e\u516c\u53f8",
                  "value": null,
                  "title": ""
              }
          },
          "isHidden": false,
          "position": {
              "autoHeight": false,
              "sizeX": 6,
              "sizeY": 9,
              "maxSizeY": 1000,
              "maxSizeX": 6,
              "minSizeY": 5,
              "minSizeX": 1,
              "col": 0,
              "row": 23
          }
      },
      "dashboard_id": 1,
      "width": 1,
      "id": 11
  },
  {
      "visualization": {
          "description": "",
          "created_at": "2021-07-28T03:15:24.749Z",
          "updated_at": "2021-07-28T09:23:26.275Z",
          "id": 7,
          "query": {
              "user": {
                  "auth_type": "password",
                  "is_disabled": false,
                  "updated_at": "2021-08-05T02:23:28.410Z",
                  "profile_image_url": "https://www.gravatar.com/avatar/4825c2a52fd0164dfff5785cec514823?s=40&d=identicon",
                  "is_invitation_pending": false,
                  "groups": [
                      1,
                      2
                  ],
                  "id": 1,
                  "name": "admin",
                  "created_at": "2021-07-27T06:50:26.282Z",
                  "disabled_at": null,
                  "is_email_verified": true,
                  "active_at": "2021-08-05T02:22:33Z",
                  "email": "chenzhipei@hotoa.com"
              },
              "created_at": "2021-07-28T02:55:22.882Z",
              "latest_query_data_id": null,
              "schedule": null,
              "description": null,
              "tags": [],
              "updated_at": "2021-07-30T07:39:57.660Z",
              "last_modified_by": {
                  "auth_type": "password",
                  "is_disabled": false,
                  "updated_at": "2021-08-05T02:23:28.410Z",
                  "profile_image_url": "https://www.gravatar.com/avatar/4825c2a52fd0164dfff5785cec514823?s=40&d=identicon",
                  "is_invitation_pending": false,
                  "groups": [
                      1,
                      2
                  ],
                  "id": 1,
                  "name": "admin",
                  "created_at": "2021-07-27T06:50:26.282Z",
                  "disabled_at": null,
                  "is_email_verified": true,
                  "active_at": "2021-08-05T02:22:33Z",
                  "email": "chenzhipei@hotoa.com"
              },
              "options": {
                  "parameters": [
                      {
                          "name": "\u6240\u5c5e\u516c\u53f8",
                          "title": "\u6240\u5c5e\u516c\u53f8",
                          "global": false,
                          "value": "WXaqHhk5FamuM9SGT",
                          "queryId": 1,
                          "parentQueryId": 3,
                          "type": "query",
                          "locals": []
                      },
                      {
                          "name": "\u65f6\u95f4\u8303\u56f4",
                          "title": "\u65f6\u95f4\u8303\u56f4",
                          "global": false,
                          "value": "d_this_month",
                          "locals": [],
                          "type": "datetime-range",
                          "parentQueryId": 3
                      }
                  ]
              },
              "is_safe": true,
              "version": 1,
              "query_hash": "96a54c8a62165e231b83188ce2c812ea",
              "is_archived": false,
              "query": "{\n    \"collection\": \"pcmes_component_detail__c\",\n    \"aggregate\": [\n        {\n            \"$project\": {\n                \"company_id\": \"$company_id\",\n                \"workshop__c\": \"$workshop__c\",\n                \"unit_volume__c\": \"$unit_volume__c\",\n                \"datetime_pound__c\": {\n                    \"$dateToString\": {\n                        \"format\": \"%Y-%m-%d %H:%M\",\n                        \"date\": \"$datetime_pound__c\"\n                    }\n                }\n            }\n        },\n        {\n            \"$match\": {\n                \"company_id\": \"{{ \u6240\u5c5e\u516c\u53f8 }}\",\n                \"$and\": [\n                    {\n                        \"datetime_pound__c\": {\n                            \"$gte\": \"{{ \u65f6\u95f4\u8303\u56f4.start }}\"\n                        }\n                    },\n                    {\n                        \"datetime_pound__c\": {\n                            \"$lte\": \"{{ \u65f6\u95f4\u8303\u56f4.end }}\"\n                        }\n                    }\n                ]\n            }\n        },\n        {\n            \"$group\": {\n                \"_id\": \"\",\n                \"total_volume\": {\n                    \"$sum\": \"$unit_volume__c\"\n                },\n                \"count\": {\n                    \"$sum\": 1\n                }\n            }\n        }\n    ]\n}",
              "api_key": "2c8zcOIyrpvKcTwIJpXtfDJJcopFEITAtaeo4eAe",
              "is_draft": false,
              "id": 3,
              "data_source_id": 1,
              "name": "\u6d47\u6363\u7edf\u8ba1"
          },
          "type": "COUNTER",
          "options": {
              "tooltipFormat": "0,0.000",
              "targetColName": "",
              "formatTargetValue": false,
              "rowNumber": 0,
              "stringDecChar": ".",
              "stringDecimal": 0,
              "countRow": false,
              "counterColName": "count",
              "counterLabel": "(\u5757)",
              "stringThouSep": ",",
              "targetRowNumber": 0
          },
          "name": "\u6570\u91cf"
      },
      "text": "",
      "created_at": "2021-07-28T09:17:26.778Z",
      "updated_at": "2021-07-28T09:17:39.516Z",
      "options": {
          "parameterMappings": {
              "\u65f6\u95f4\u8303\u56f4": {
                  "type": "dashboard-level",
                  "mapTo": "\u65f6\u95f4\u8303\u56f4",
                  "name": "\u65f6\u95f4\u8303\u56f4",
                  "value": null,
                  "title": ""
              },
              "\u6240\u5c5e\u516c\u53f8": {
                  "type": "dashboard-level",
                  "mapTo": "\u6240\u5c5e\u516c\u53f8",
                  "name": "\u6240\u5c5e\u516c\u53f8",
                  "value": null,
                  "title": ""
              }
          },
          "isHidden": false,
          "position": {
              "autoHeight": false,
              "sizeX": 2,
              "sizeY": 5,
              "maxSizeY": 1000,
              "maxSizeX": 6,
              "minSizeY": 1,
              "minSizeX": 1,
              "col": 2,
              "row": 0
          }
      },
      "dashboard_id": 1,
      "width": 1,
      "id": 15
  },
  {
      "visualization": {
          "description": "",
          "created_at": "2021-07-28T07:58:06.952Z",
          "updated_at": "2021-07-30T06:17:22.273Z",
          "id": 9,
          "query": {
              "user": {
                  "auth_type": "password",
                  "is_disabled": false,
                  "updated_at": "2021-08-05T02:23:28.410Z",
                  "profile_image_url": "https://www.gravatar.com/avatar/4825c2a52fd0164dfff5785cec514823?s=40&d=identicon",
                  "is_invitation_pending": false,
                  "groups": [
                      1,
                      2
                  ],
                  "id": 1,
                  "name": "admin",
                  "created_at": "2021-07-27T06:50:26.282Z",
                  "disabled_at": null,
                  "is_email_verified": true,
                  "active_at": "2021-08-05T02:22:33Z",
                  "email": "chenzhipei@hotoa.com"
              },
              "created_at": "2021-07-28T07:58:06.952Z",
              "latest_query_data_id": null,
              "schedule": null,
              "description": null,
              "tags": [],
              "updated_at": "2021-07-29T00:55:53.638Z",
              "last_modified_by": {
                  "auth_type": "password",
                  "is_disabled": false,
                  "updated_at": "2021-08-05T02:23:28.410Z",
                  "profile_image_url": "https://www.gravatar.com/avatar/4825c2a52fd0164dfff5785cec514823?s=40&d=identicon",
                  "is_invitation_pending": false,
                  "groups": [
                      1,
                      2
                  ],
                  "id": 1,
                  "name": "admin",
                  "created_at": "2021-07-27T06:50:26.282Z",
                  "disabled_at": null,
                  "is_email_verified": true,
                  "active_at": "2021-08-05T02:22:33Z",
                  "email": "chenzhipei@hotoa.com"
              },
              "options": {
                  "parameters": [
                      {
                          "name": "\u6240\u5c5e\u516c\u53f8",
                          "title": "\u6240\u5c5e\u516c\u53f8",
                          "global": false,
                          "value": "WXaqHhk5FamuM9SGT",
                          "queryId": 1,
                          "parentQueryId": 4,
                          "type": "query",
                          "locals": []
                      },
                      {
                          "name": "\u65f6\u95f4\u8303\u56f4",
                          "title": "\u65f6\u95f4\u8303\u56f4",
                          "global": false,
                          "value": "d_this_month",
                          "locals": [],
                          "type": "datetime-range",
                          "parentQueryId": 4
                      }
                  ]
              },
              "is_safe": true,
              "version": 1,
              "query_hash": "962f6c55f7d414aed5dc8ff02d6ce35e",
              "is_archived": false,
              "query": "{\n    \"collection\": \"pcmes_component_detail__c\",\n    \"aggregate\": [\n        {\n            \"$project\": {\n                \"company_id\": \"$company_id\",\n                \"workshop__c\": \"$workshop__c\",\n                \"unit_volume__c\": \"$unit_volume__c\",\n                \"datetime_pound__c\": {\n                    \"$dateToString\": {\n                        \"format\": \"%Y-%m-%d\",\n                        \"date\": \"$datetime_pound__c\"\n                    }\n                }\n            }\n        },\n        {\n            \"$match\": {\n                \"company_id\": \"{{ \u6240\u5c5e\u516c\u53f8 }}\",\n                \"$and\": [\n                    {\n                        \"datetime_pound__c\": {\n                            \"$gte\": \"{{ \u65f6\u95f4\u8303\u56f4.start }}\"\n                        }\n                    },\n                    {\n                        \"datetime_pound__c\": {\n                            \"$lte\": \"{{ \u65f6\u95f4\u8303\u56f4.end }}\"\n                        }\n                    }\n                ]\n            }\n        },\n        {\n            \"$group\": {\n                \"_id\": \"$datetime_pound__c\",\n                \"total_volume\": {\n                    \"$sum\": \"$unit_volume__c\"\n                },\n                \"count\": {\n                    \"$sum\": 1\n                }\n            }\n        },\n        {\n            \"$sort\": [\n                {\n                    \"name\": \"_id\",\n                    \"direction\": 1\n                }\n            ]\n        }\n    ]\n}",
              "api_key": "CtLqAeykjsLjStf2fkM5zY1lSHSYlwOs0byAY40U",
              "is_draft": false,
              "id": 4,
              "data_source_id": 1,
              "name": "\u6d47\u6363\u7edf\u8ba1-\u6309\u65e5\u7edf\u8ba1"
          },
          "type": "CHART",
          "options": {
              "showDataLabels": true,
              "direction": {
                  "type": "counterclockwise"
              },
              "missingValuesAsZero": true,
              "xAxis": {
                  "labels": {
                      "enabled": true
                  },
                  "type": "category",
                  "title": {
                      "text": ""
                  }
              },
              "error_y": {
                  "visible": true,
                  "type": "data"
              },
              "numberFormat": "0,0[.]000",
              "yAxis": [
                  {
                      "type": "linear",
                      "rangeMin": null,
                      "title": {
                          "text": ""
                      }
                  },
                  {
                      "opposite": true,
                      "type": "linear",
                      "rangeMin": 0,
                      "title": {
                          "text": ""
                      }
                  }
              ],
              "series": {
                  "stacking": null,
                  "percentValues": false,
                  "error_y": {
                      "visible": true,
                      "type": "data"
                  }
              },
              "globalSeriesType": "line",
              "percentFormat": "0[.]00%",
              "sortX": false,
              "seriesOptions": {
                  "total_volume": {
                      "zIndex": 0,
                      "index": 0,
                      "type": "line",
                      "name": "\u65b9\u91cf(m\u00b3)",
                      "yAxis": 0
                  }
              },
              "valuesOptions": {},
              "reverseX": false,
              "reverseY": false,
              "dateTimeFormat": "MM-DD",
              "columnMapping": {
                  "count": "unused",
                  "_id": "x",
                  "total_volume": "y"
              },
              "textFormat": "",
              "customCode": "// Available variables are x, ys, element, and Plotly\n// Type console.log(x, ys); for more info about x and ys\n// To plot your graph call Plotly.plot(element, ...)\n// Plotly examples and docs: https://plot.ly/javascript/",
              "legend": {
                  "enabled": true
              }
          },
          "name": "Chart"
      },
      "text": "",
      "created_at": "2021-07-28T08:21:29.151Z",
      "updated_at": "2021-07-28T09:17:39.463Z",
      "options": {
          "parameterMappings": {
              "\u65f6\u95f4\u8303\u56f4": {
                  "type": "dashboard-level",
                  "mapTo": "\u65f6\u95f4\u8303\u56f4",
                  "name": "\u65f6\u95f4\u8303\u56f4",
                  "value": null,
                  "title": ""
              },
              "\u6240\u5c5e\u516c\u53f8": {
                  "type": "dashboard-level",
                  "mapTo": "\u6240\u5c5e\u516c\u53f8",
                  "name": "\u6240\u5c5e\u516c\u53f8",
                  "value": null,
                  "title": ""
              }
          },
          "isHidden": false,
          "position": {
              "autoHeight": false,
              "sizeX": 6,
              "sizeY": 9,
              "maxSizeY": 1000,
              "maxSizeX": 6,
              "minSizeY": 5,
              "minSizeX": 1,
              "col": 0,
              "row": 5
          }
      },
      "dashboard_id": 1,
      "width": 1,
      "id": 9
  },
  {
      "visualization": {
          "description": "",
          "created_at": "2021-07-28T09:05:10.470Z",
          "updated_at": "2021-07-28T09:14:37.829Z",
          "id": 15,
          "query": {
              "user": {
                  "auth_type": "password",
                  "is_disabled": false,
                  "updated_at": "2021-08-05T02:23:28.410Z",
                  "profile_image_url": "https://www.gravatar.com/avatar/4825c2a52fd0164dfff5785cec514823?s=40&d=identicon",
                  "is_invitation_pending": false,
                  "groups": [
                      1,
                      2
                  ],
                  "id": 1,
                  "name": "admin",
                  "created_at": "2021-07-27T06:50:26.282Z",
                  "disabled_at": null,
                  "is_email_verified": true,
                  "active_at": "2021-08-05T02:22:33Z",
                  "email": "chenzhipei@hotoa.com"
              },
              "created_at": "2021-07-28T09:05:10.470Z",
              "latest_query_data_id": null,
              "schedule": null,
              "description": null,
              "tags": [],
              "updated_at": "2021-07-28T09:13:53.603Z",
              "last_modified_by": {
                  "auth_type": "password",
                  "is_disabled": false,
                  "updated_at": "2021-08-05T02:23:28.410Z",
                  "profile_image_url": "https://www.gravatar.com/avatar/4825c2a52fd0164dfff5785cec514823?s=40&d=identicon",
                  "is_invitation_pending": false,
                  "groups": [
                      1,
                      2
                  ],
                  "id": 1,
                  "name": "admin",
                  "created_at": "2021-07-27T06:50:26.282Z",
                  "disabled_at": null,
                  "is_email_verified": true,
                  "active_at": "2021-08-05T02:22:33Z",
                  "email": "chenzhipei@hotoa.com"
              },
              "options": {
                  "parameters": [
                      {
                          "name": "\u6240\u5c5e\u516c\u53f8",
                          "title": "\u6240\u5c5e\u516c\u53f8",
                          "global": false,
                          "value": "KtM4v3LMuYykgAjL7",
                          "queryId": 1,
                          "parentQueryId": 7,
                          "type": "query",
                          "locals": []
                      },
                      {
                          "name": "\u65f6\u95f4\u8303\u56f4",
                          "title": "\u65f6\u95f4\u8303\u56f4",
                          "global": false,
                          "value": "d_this_month",
                          "locals": [],
                          "type": "datetime-range",
                          "parentQueryId": 7
                      }
                  ]
              },
              "is_safe": true,
              "version": 1,
              "query_hash": "d2875fe7121ddca51f337b175ef1c78c",
              "is_archived": false,
              "query": "{\n    \"collection\": \"pcmes_component_detail__c\",\n    \"aggregate\": [\n        {\n            \"$project\": {\n                \"company_id\": \"$company_id\",\n                \"component_type__c\": \"$component_type__c\",\n                \"unit_volume__c\": \"$unit_volume__c\",\n                \"datetime_pound__c\": {\n                    \"$dateToString\": {\n                        \"format\": \"%Y-%m-%d %H:%M\",\n                        \"date\": \"$datetime_pound__c\"\n                    }\n                }\n            }\n        },\n        {\n            \"$match\": {\n                \"company_id\": \"{{ \u6240\u5c5e\u516c\u53f8 }}\",\n                \"$and\": [\n                    {\n                        \"datetime_pound__c\": {\n                            \"$gte\": \"{{ \u65f6\u95f4\u8303\u56f4.start }}\"\n                        }\n                    },\n                    {\n                        \"datetime_pound__c\": {\n                            \"$lte\": \"{{ \u65f6\u95f4\u8303\u56f4.end }}\"\n                        }\n                    }\n                ]\n            }\n        },\n        {\n            \"$lookup\": {\n                \"from\": \"pcmes_component_type__c\",\n                \"localField\": \"component_type__c\",\n                \"foreignField\": \"_id\",\n                \"as\": \"component_type__c\"\n            }\n        },\n        {\n            \"$unwind\": \"$component_type__c\"\n        },\n        {\n            \"$group\": {\n                \"_id\": \"$component_type__c.name\",\n                \"\u65b9\u91cf\": {\n                    \"$sum\": \"$unit_volume__c\"\n                },\n                \"\u6570\u91cf\": {\n                    \"$sum\": 1\n                }\n            }\n        }\n    ]\n}",
              "api_key": "4AQGOP5udyt0Dbsp5g8CNZu9LCFCMCx8r0hLTemo",
              "is_draft": false,
              "id": 7,
              "data_source_id": 1,
              "name": "\u6d47\u6363\u7edf\u8ba1-\u6309\u6784\u4ef6\u7c7b\u578b\u5360\u6bd4\u7edf\u8ba1"
          },
          "type": "CHART",
          "options": {
              "showDataLabels": true,
              "direction": {
                  "type": "counterclockwise"
              },
              "missingValuesAsZero": true,
              "xAxis": {
                  "labels": {
                      "enabled": true
                  },
                  "type": "-",
                  "title": {
                      "text": ""
                  }
              },
              "error_y": {
                  "visible": true,
                  "type": "data"
              },
              "numberFormat": "0,0[.]00000",
              "yAxis": [
                  {
                      "type": "linear",
                      "title": {
                          "text": ""
                      }
                  },
                  {
                      "opposite": true,
                      "type": "linear",
                      "rangeMin": null,
                      "title": {
                          "text": ""
                      }
                  }
              ],
              "series": {
                  "stacking": null,
                  "error_y": {
                      "visible": true,
                      "type": "data"
                  }
              },
              "globalSeriesType": "pie",
              "percentFormat": "0[.]00%",
              "sortX": false,
              "seriesOptions": {
                  "\u6570\u91cf": {
                      "zIndex": 1,
                      "index": 0,
                      "type": "pie",
                      "name": "",
                      "yAxis": 0
                  },
                  "\u65b9\u91cf": {
                      "zIndex": 0,
                      "index": 0,
                      "type": "pie",
                      "name": "",
                      "yAxis": 0
                  }
              },
              "valuesOptions": {
                  "\u53e0\u5408\u677f": {
                      "color": "#799CFF"
                  }
              },
              "reverseX": false,
              "reverseY": false,
              "dateTimeFormat": "DD/MM/YY HH:mm",
              "columnMapping": {
                  "_id": "x",
                  "\u6570\u91cf": "y",
                  "\u65b9\u91cf": "y"
              },
              "textFormat": "",
              "customCode": "// Available variables are x, ys, element, and Plotly\n// Type console.log(x, ys); for more info about x and ys\n// To plot your graph call Plotly.plot(element, ...)\n// Plotly examples and docs: https://plot.ly/javascript/",
              "legend": {
                  "enabled": true
              }
          },
          "name": "Chart"
      },
      "text": "",
      "created_at": "2021-07-28T09:14:37.829Z",
      "updated_at": "2021-07-28T09:24:46.584Z",
      "options": {
          "parameterMappings": {
              "\u65f6\u95f4\u8303\u56f4": {
                  "type": "dashboard-level",
                  "mapTo": "\u65f6\u95f4\u8303\u56f4",
                  "name": "\u65f6\u95f4\u8303\u56f4",
                  "value": null,
                  "title": ""
              },
              "\u6240\u5c5e\u516c\u53f8": {
                  "type": "dashboard-level",
                  "mapTo": "\u6240\u5c5e\u516c\u53f8",
                  "name": "\u6240\u5c5e\u516c\u53f8",
                  "value": null,
                  "title": ""
              }
          },
          "isHidden": false,
          "position": {
              "autoHeight": false,
              "sizeX": 6,
              "sizeY": 10,
              "maxSizeY": 1000,
              "maxSizeX": 6,
              "minSizeY": 5,
              "minSizeX": 1,
              "col": 0,
              "row": 41
          }
      },
      "dashboard_id": 1,
      "width": 1,
      "id": 13
  },
  {
      "visualization": {
          "description": "",
          "created_at": "2021-07-27T14:03:58.318Z",
          "updated_at": "2021-07-28T07:50:05.479Z",
          "id": 3,
          "query": {
              "user": {
                  "auth_type": "password",
                  "is_disabled": false,
                  "updated_at": "2021-08-05T02:23:28.410Z",
                  "profile_image_url": "https://www.gravatar.com/avatar/4825c2a52fd0164dfff5785cec514823?s=40&d=identicon",
                  "is_invitation_pending": false,
                  "groups": [
                      1,
                      2
                  ],
                  "id": 1,
                  "name": "admin",
                  "created_at": "2021-07-27T06:50:26.282Z",
                  "disabled_at": null,
                  "is_email_verified": true,
                  "active_at": "2021-08-05T02:22:33Z",
                  "email": "chenzhipei@hotoa.com"
              },
              "created_at": "2021-07-27T13:58:47.559Z",
              "latest_query_data_id": null,
              "schedule": null,
              "description": null,
              "tags": [],
              "updated_at": "2021-07-28T07:50:07.752Z",
              "last_modified_by": {
                  "auth_type": "password",
                  "is_disabled": false,
                  "updated_at": "2021-08-05T02:23:28.410Z",
                  "profile_image_url": "https://www.gravatar.com/avatar/4825c2a52fd0164dfff5785cec514823?s=40&d=identicon",
                  "is_invitation_pending": false,
                  "groups": [
                      1,
                      2
                  ],
                  "id": 1,
                  "name": "admin",
                  "created_at": "2021-07-27T06:50:26.282Z",
                  "disabled_at": null,
                  "is_email_verified": true,
                  "active_at": "2021-08-05T02:22:33Z",
                  "email": "chenzhipei@hotoa.com"
              },
              "options": {
                  "parameters": [
                      {
                          "name": "\u6240\u5c5e\u516c\u53f8",
                          "title": "\u6240\u5c5e\u516c\u53f8",
                          "global": false,
                          "value": "KtM4v3LMuYykgAjL7",
                          "queryId": 1,
                          "parentQueryId": 2,
                          "type": "query",
                          "locals": []
                      },
                      {
                          "name": "\u65f6\u95f4\u8303\u56f4",
                          "title": "\u65f6\u95f4\u8303\u56f4",
                          "global": false,
                          "value": "d_this_month",
                          "locals": [],
                          "type": "datetime-range",
                          "parentQueryId": 2
                      }
                  ]
              },
              "is_safe": true,
              "version": 1,
              "query_hash": "99e6242bee007012cdaef13dcef18cc8",
              "is_archived": false,
              "query": "{\n    \"collection\": \"pcmes_component_detail__c\",\n    \"aggregate\": [\n        {\n            \"$project\": {\n                \"company_id\": \"$company_id\",\n                \"workshop__c\": \"$workshop__c\",\n                \"unit_volume__c\": \"$unit_volume__c\",\n                \"datetime_pound__c\": {\n                    \"$dateToString\": {\n                        \"format\": \"%Y-%m-%d %H:%M\",\n                        \"date\": \"$datetime_pound__c\"\n                    }\n                }\n            }\n        },\n        {\n            \"$match\": {\n                \"company_id\": \"{{ \u6240\u5c5e\u516c\u53f8 }}\",\n                \"$and\": [\n                    {\n                        \"datetime_pound__c\": {\n                            \"$gte\": \"{{ \u65f6\u95f4\u8303\u56f4.start }}\"\n                        }\n                    },\n                    {\n                        \"datetime_pound__c\": {\n                            \"$lte\": \"{{ \u65f6\u95f4\u8303\u56f4.end }}\"\n                        }\n                    }\n                ]\n            }\n        },\n        {\n            \"$lookup\": {\n                \"from\": \"pcmes_workshop__c\",\n                \"localField\": \"workshop__c\",\n                \"foreignField\": \"_id\",\n                \"as\": \"workshop__c\"\n            }\n        },\n        {\n            \"$unwind\": \"$workshop__c\"\n        },\n        {\n            \"$group\": {\n                \"_id\": \"$workshop__c.name\",\n                \"total_volume\": {\n                    \"$sum\": \"$unit_volume__c\"\n                },\n                \"count\": {\n                    \"$sum\": 1\n                }\n            }\n        }\n    ]\n}",
              "api_key": "n14unQU7YQqT4GgvRmpqXGzzePKwtUHtQeqOCnUK",
              "is_draft": false,
              "id": 2,
              "data_source_id": 1,
              "name": "\u6d47\u6363\u7edf\u8ba1-\u6309\u4ea7\u7ebf\u7edf\u8ba1"
          },
          "type": "CHART",
          "options": {
              "showDataLabels": true,
              "direction": {
                  "type": "counterclockwise"
              },
              "missingValuesAsZero": true,
              "error_y": {
                  "visible": true,
                  "type": "data"
              },
              "numberFormat": "0,0[.]00000",
              "yAxis": [
                  {
                      "type": "linear",
                      "title": {
                          "text": ""
                      }
                  },
                  {
                      "opposite": true,
                      "type": "linear",
                      "rangeMin": null,
                      "title": {
                          "text": ""
                      }
                  }
              ],
              "series": {
                  "stacking": null,
                  "error_y": {
                      "visible": true,
                      "type": "data"
                  }
              },
              "globalSeriesType": "column",
              "percentFormat": "0[.]00%",
              "sortX": false,
              "seriesOptions": {
                  "count": {
                      "index": 0,
                      "name": "\u5757",
                      "yAxis": 0,
                      "color": "#00B6EB",
                      "zIndex": 1,
                      "type": "column"
                  },
                  "total_volume": {
                      "index": 0,
                      "name": "\u65b9\u91cf(m\u00b3)",
                      "yAxis": 0,
                      "color": "#FB8D3D",
                      "zIndex": 0,
                      "type": "column"
                  }
              },
              "valuesOptions": {},
              "xAxis": {
                  "labels": {
                      "enabled": true
                  },
                  "type": "-",
                  "title": {
                      "text": ""
                  }
              },
              "reverseY": false,
              "dateTimeFormat": "DD/MM/YY HH:mm",
              "columnMapping": {
                  "count": "y",
                  "_id": "x",
                  "total_volume": "y"
              },
              "textFormat": "",
              "customCode": "// Available variables are x, ys, element, and Plotly\n// Type console.log(x, ys); for more info about x and ys\n// To plot your graph call Plotly.plot(element, ...)\n// Plotly examples and docs: https://plot.ly/javascript/",
              "legend": {
                  "enabled": true
              }
          },
          "name": "Chart"
      },
      "text": "",
      "created_at": "2021-07-27T14:19:50.118Z",
      "updated_at": "2021-07-28T09:17:39.463Z",
      "options": {
          "parameterMappings": {
              "\u65f6\u95f4\u8303\u56f4": {
                  "type": "dashboard-level",
                  "mapTo": "\u65f6\u95f4\u8303\u56f4",
                  "name": "\u65f6\u95f4\u8303\u56f4",
                  "value": null,
                  "title": ""
              },
              "\u6240\u5c5e\u516c\u53f8": {
                  "type": "dashboard-level",
                  "mapTo": "\u6240\u5c5e\u516c\u53f8",
                  "name": "\u6240\u5c5e\u516c\u53f8",
                  "value": null,
                  "title": ""
              }
          },
          "isHidden": false,
          "position": {
              "autoHeight": false,
              "sizeX": 6,
              "sizeY": 9,
              "maxSizeY": 1000,
              "maxSizeX": 6,
              "minSizeY": 5,
              "minSizeX": 1,
              "col": 0,
              "row": 14
          }
      },
      "dashboard_id": 1,
      "width": 1,
      "id": 3
  },
  {
      "visualization": {
          "description": "",
          "created_at": "2021-07-28T08:31:56.867Z",
          "updated_at": "2021-07-29T01:52:57.795Z",
          "id": 13,
          "query": {
              "user": {
                  "auth_type": "password",
                  "is_disabled": false,
                  "updated_at": "2021-08-05T02:23:28.410Z",
                  "profile_image_url": "https://www.gravatar.com/avatar/4825c2a52fd0164dfff5785cec514823?s=40&d=identicon",
                  "is_invitation_pending": false,
                  "groups": [
                      1,
                      2
                  ],
                  "id": 1,
                  "name": "admin",
                  "created_at": "2021-07-27T06:50:26.282Z",
                  "disabled_at": null,
                  "is_email_verified": true,
                  "active_at": "2021-08-05T02:22:33Z",
                  "email": "chenzhipei@hotoa.com"
              },
              "created_at": "2021-07-28T08:31:56.867Z",
              "latest_query_data_id": null,
              "schedule": null,
              "description": null,
              "tags": [],
              "updated_at": "2021-07-28T08:32:43.068Z",
              "last_modified_by": {
                  "auth_type": "password",
                  "is_disabled": false,
                  "updated_at": "2021-08-05T02:23:28.410Z",
                  "profile_image_url": "https://www.gravatar.com/avatar/4825c2a52fd0164dfff5785cec514823?s=40&d=identicon",
                  "is_invitation_pending": false,
                  "groups": [
                      1,
                      2
                  ],
                  "id": 1,
                  "name": "admin",
                  "created_at": "2021-07-27T06:50:26.282Z",
                  "disabled_at": null,
                  "is_email_verified": true,
                  "active_at": "2021-08-05T02:22:33Z",
                  "email": "chenzhipei@hotoa.com"
              },
              "options": {
                  "parameters": [
                      {
                          "name": "\u6240\u5c5e\u516c\u53f8",
                          "title": "\u6240\u5c5e\u516c\u53f8",
                          "global": false,
                          "value": "KtM4v3LMuYykgAjL7",
                          "queryId": 1,
                          "parentQueryId": 6,
                          "type": "query",
                          "locals": []
                      },
                      {
                          "name": "\u65f6\u95f4\u8303\u56f4",
                          "title": "\u65f6\u95f4\u8303\u56f4",
                          "global": false,
                          "value": "d_this_month",
                          "locals": [],
                          "type": "datetime-range",
                          "parentQueryId": 6
                      }
                  ]
              },
              "is_safe": true,
              "version": 1,
              "query_hash": "e328f9013ccd567dc13d6e43e6563ace",
              "is_archived": false,
              "query": "{\n    \"collection\": \"pcmes_component_detail__c\",\n    \"aggregate\": [\n        {\n            \"$project\": {\n                \"company_id\": \"$company_id\",\n                \"project__c\": \"$project__c\",\n                \"unit_volume__c\": \"$unit_volume__c\",\n                \"datetime_pound__c\": {\n                    \"$dateToString\": {\n                        \"format\": \"%Y-%m-%d %H:%M\",\n                        \"date\": \"$datetime_pound__c\"\n                    }\n                }\n            }\n        },\n        {\n            \"$match\": {\n                \"company_id\": \"{{ \u6240\u5c5e\u516c\u53f8 }}\",\n                \"$and\": [\n                    {\n                        \"datetime_pound__c\": {\n                            \"$gte\": \"{{ \u65f6\u95f4\u8303\u56f4.start }}\"\n                        }\n                    },\n                    {\n                        \"datetime_pound__c\": {\n                            \"$lte\": \"{{ \u65f6\u95f4\u8303\u56f4.end }}\"\n                        }\n                    }\n                ]\n            }\n        },\n        {\n            \"$lookup\": {\n                \"from\": \"pcmes_project__c\",\n                \"localField\": \"project__c\",\n                \"foreignField\": \"_id\",\n                \"as\": \"project__c\"\n            }\n        },\n        {\n            \"$unwind\": \"$project__c\"\n        },\n        {\n            \"$group\": {\n                \"_id\": \"$project__c.name\",\n                \"total_volume\": {\n                    \"$sum\": \"$unit_volume__c\"\n                },\n                \"count\": {\n                    \"$sum\": 1\n                }\n            }\n        }\n    ]\n}",
              "api_key": "VnNA3Lgx61NLqFqJXDAbV4FQ1caEFW2L7HuawnDn",
              "is_draft": false,
              "id": 6,
              "data_source_id": 1,
              "name": "\u6d47\u6363\u7edf\u8ba1-\u6309\u9879\u76ee\u7edf\u8ba1"
          },
          "type": "CHART",
          "options": {
              "showDataLabels": true,
              "direction": {
                  "type": "counterclockwise"
              },
              "missingValuesAsZero": true,
              "xAxis": {
                  "labels": {
                      "enabled": true
                  },
                  "type": "-",
                  "title": {
                      "text": ""
                  }
              },
              "error_y": {
                  "visible": true,
                  "type": "data"
              },
              "numberFormat": "0,0[.]000",
              "yAxis": [
                  {
                      "type": "linear",
                      "title": {
                          "text": ""
                      }
                  },
                  {
                      "opposite": true,
                      "type": "linear",
                      "rangeMin": null,
                      "title": {
                          "text": ""
                      }
                  }
              ],
              "series": {
                  "stacking": null,
                  "error_y": {
                      "visible": true,
                      "type": "data"
                  }
              },
              "globalSeriesType": "column",
              "percentFormat": "0[.]00%",
              "sortX": false,
              "seriesOptions": {
                  "count": {
                      "index": 0,
                      "name": "\u5757",
                      "yAxis": 0,
                      "color": "#00B6EB",
                      "zIndex": 1,
                      "type": "column"
                  },
                  "total_volume": {
                      "index": 0,
                      "name": "\u65b9\u91cf(m\u00b3)",
                      "yAxis": 0,
                      "color": "#FB8D3D",
                      "zIndex": 0,
                      "type": "column"
                  }
              },
              "valuesOptions": {},
              "reverseX": false,
              "reverseY": false,
              "dateTimeFormat": "DD/MM/YY HH:mm",
              "columnMapping": {
                  "count": "y",
                  "_id": "x",
                  "total_volume": "y"
              },
              "textFormat": "",
              "customCode": "// Available variables are x, ys, element, and Plotly\n// Type console.log(x, ys); for more info about x and ys\n// To plot your graph call Plotly.plot(element, ...)\n// Plotly examples and docs: https://plot.ly/javascript/",
              "legend": {
                  "enabled": true
              }
          },
          "name": "Chart"
      },
      "text": "",
      "created_at": "2021-07-28T09:04:12.527Z",
      "updated_at": "2021-07-28T09:17:39.466Z",
      "options": {
          "parameterMappings": {
              "\u65f6\u95f4\u8303\u56f4": {
                  "type": "dashboard-level",
                  "mapTo": "\u65f6\u95f4\u8303\u56f4",
                  "name": "\u65f6\u95f4\u8303\u56f4",
                  "value": null,
                  "title": ""
              },
              "\u6240\u5c5e\u516c\u53f8": {
                  "type": "dashboard-level",
                  "mapTo": "\u6240\u5c5e\u516c\u53f8",
                  "name": "\u6240\u5c5e\u516c\u53f8",
                  "value": null,
                  "title": ""
              }
          },
          "isHidden": false,
          "position": {
              "autoHeight": false,
              "sizeX": 6,
              "sizeY": 9,
              "maxSizeY": 1000,
              "maxSizeX": 6,
              "minSizeY": 5,
              "minSizeX": 1,
              "col": 0,
              "row": 32
          }
      },
      "dashboard_id": 1,
      "width": 1,
      "id": 12
  },
  {
      "visualization": {
          "description": "",
          "created_at": "2021-07-28T03:07:37.670Z",
          "updated_at": "2021-07-29T01:38:15.065Z",
          "id": 6,
          "query": {
              "user": {
                  "auth_type": "password",
                  "is_disabled": false,
                  "updated_at": "2021-08-05T02:23:28.410Z",
                  "profile_image_url": "https://www.gravatar.com/avatar/4825c2a52fd0164dfff5785cec514823?s=40&d=identicon",
                  "is_invitation_pending": false,
                  "groups": [
                      1,
                      2
                  ],
                  "id": 1,
                  "name": "admin",
                  "created_at": "2021-07-27T06:50:26.282Z",
                  "disabled_at": null,
                  "is_email_verified": true,
                  "active_at": "2021-08-05T02:22:33Z",
                  "email": "chenzhipei@hotoa.com"
              },
              "created_at": "2021-07-28T02:55:22.882Z",
              "latest_query_data_id": null,
              "schedule": null,
              "description": null,
              "tags": [],
              "updated_at": "2021-07-30T07:39:57.660Z",
              "last_modified_by": {
                  "auth_type": "password",
                  "is_disabled": false,
                  "updated_at": "2021-08-05T02:23:28.410Z",
                  "profile_image_url": "https://www.gravatar.com/avatar/4825c2a52fd0164dfff5785cec514823?s=40&d=identicon",
                  "is_invitation_pending": false,
                  "groups": [
                      1,
                      2
                  ],
                  "id": 1,
                  "name": "admin",
                  "created_at": "2021-07-27T06:50:26.282Z",
                  "disabled_at": null,
                  "is_email_verified": true,
                  "active_at": "2021-08-05T02:22:33Z",
                  "email": "chenzhipei@hotoa.com"
              },
              "options": {
                  "parameters": [
                      {
                          "name": "\u6240\u5c5e\u516c\u53f8",
                          "title": "\u6240\u5c5e\u516c\u53f8",
                          "global": false,
                          "value": "WXaqHhk5FamuM9SGT",
                          "queryId": 1,
                          "parentQueryId": 3,
                          "type": "query",
                          "locals": []
                      },
                      {
                          "name": "\u65f6\u95f4\u8303\u56f4",
                          "title": "\u65f6\u95f4\u8303\u56f4",
                          "global": false,
                          "value": "d_this_month",
                          "locals": [],
                          "type": "datetime-range",
                          "parentQueryId": 3
                      }
                  ]
              },
              "is_safe": true,
              "version": 1,
              "query_hash": "96a54c8a62165e231b83188ce2c812ea",
              "is_archived": false,
              "query": "{\n    \"collection\": \"pcmes_component_detail__c\",\n    \"aggregate\": [\n        {\n            \"$project\": {\n                \"company_id\": \"$company_id\",\n                \"workshop__c\": \"$workshop__c\",\n                \"unit_volume__c\": \"$unit_volume__c\",\n                \"datetime_pound__c\": {\n                    \"$dateToString\": {\n                        \"format\": \"%Y-%m-%d %H:%M\",\n                        \"date\": \"$datetime_pound__c\"\n                    }\n                }\n            }\n        },\n        {\n            \"$match\": {\n                \"company_id\": \"{{ \u6240\u5c5e\u516c\u53f8 }}\",\n                \"$and\": [\n                    {\n                        \"datetime_pound__c\": {\n                            \"$gte\": \"{{ \u65f6\u95f4\u8303\u56f4.start }}\"\n                        }\n                    },\n                    {\n                        \"datetime_pound__c\": {\n                            \"$lte\": \"{{ \u65f6\u95f4\u8303\u56f4.end }}\"\n                        }\n                    }\n                ]\n            }\n        },\n        {\n            \"$group\": {\n                \"_id\": \"\",\n                \"total_volume\": {\n                    \"$sum\": \"$unit_volume__c\"\n                },\n                \"count\": {\n                    \"$sum\": 1\n                }\n            }\n        }\n    ]\n}",
              "api_key": "2c8zcOIyrpvKcTwIJpXtfDJJcopFEITAtaeo4eAe",
              "is_draft": false,
              "id": 3,
              "data_source_id": 1,
              "name": "\u6d47\u6363\u7edf\u8ba1"
          },
          "type": "COUNTER",
          "options": {
              "tooltipFormat": "0,0.000",
              "targetColName": "",
              "rowNumber": 0,
              "stringDecChar": ".",
              "stringPrefix": "",
              "stringSuffix": "",
              "stringDecimal": 3,
              "countRow": false,
              "counterColName": "total_volume",
              "counterLabel": "(m\u00b3)",
              "stringThouSep": ",",
              "targetRowNumber": 0
          },
          "name": "\u65b9\u91cf"
      },
      "text": "",
      "created_at": "2021-07-28T09:17:08.990Z",
      "updated_at": "2021-07-30T07:38:52.523Z",
      "options": {
          "parameterMappings": {
              "\u65f6\u95f4\u8303\u56f4": {
                  "type": "dashboard-level",
                  "mapTo": "\u65f6\u95f4\u8303\u56f4",
                  "name": "\u65f6\u95f4\u8303\u56f4",
                  "value": null,
                  "title": ""
              },
              "\u6240\u5c5e\u516c\u53f8": {
                  "type": "dashboard-level",
                  "mapTo": "\u6240\u5c5e\u516c\u53f8",
                  "name": "\u6240\u5c5e\u516c\u53f8",
                  "value": null,
                  "title": ""
              }
          },
          "isHidden": false,
          "position": {
              "autoHeight": false,
              "sizeX": 2,
              "sizeY": 5,
              "maxSizeY": 1000,
              "maxSizeX": 6,
              "minSizeY": 1,
              "minSizeX": 1,
              "col": 0,
              "row": 0
          }
      },
      "dashboard_id": 1,
      "width": 1,
      "id": 14
  }
]

const dashboard = {
    api_key: "sGScT5f3UpPuRSvilRNGQ2Gtx7lJGv5mxyNkvOyN", // 为啥传出了此属性
    can_edit: true,
    created_at: "2021-07-27T14:05:33.877Z",
    dashboard_filters_enabled: true,
    user: {name: 'try'},
    id: 1,
    is_archived: false,
    is_draft: false,
    is_favorite: false,
    layout: [],
    name: "日常统计",
    public_url: "https://redash-pcmes-test.jianhuabm.com/public/dashboards/sGScT5f3UpPuRSvilRNGQ2Gtx7lJGv5mxyNkvOyN?org_slug=default",
    slug: "-",  //别名？唯一？
    tags: [],
    updated_at: "2021-08-05T07:34:02.131Z",
    user_id: 1,
    version: 5,
    widgets: widgets,
}
export const PageSimple = () => {
  return (
    //   <Dashboard {...dashboard} layoutEditing={true}/>
    <Page pageId="610cdddedb5d0c2aacf390fb"/>
  )
}

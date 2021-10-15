import SchemaBrowser from "../../queries/SchemaBrowser";
import QueryEditor from "../../queries/QueryEditor";
import DatabricksSchemaBrowser from "./databricks/DatabricksSchemaBrowser";

import { registerEditorComponent, getEditorComponents, QueryEditorComponents } from "./editorComponents";

// default
(registerEditorComponent as any)(QueryEditorComponents.SCHEMA_BROWSER, SchemaBrowser);
(registerEditorComponent as any)(QueryEditorComponents.QUERY_EDITOR, QueryEditor);

// databricks
registerEditorComponent(QueryEditorComponents.SCHEMA_BROWSER, DatabricksSchemaBrowser, [
  "databricks",
  "databricks_internal",
]);

export { getEditorComponents };

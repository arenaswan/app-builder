import { isNil, isEmpty } from "lodash";
import { useMemo } from "react";
import { currentUser } from "../../../services/auth";
import { policy } from "../../../services/policy";

export default function useQueryFlags(query, dataSource = null) {
  dataSource = dataSource || { view_only: true };

  return useMemo(
    () => ({
      // state flags
      isNew: isNil(query.id),
      isDraft: query.is_draft,
      isArchived: query.is_archived,

      // permissions flags
      canCreate: true || currentUser.hasPermission("create_query"),
      canView: true || currentUser.hasPermission("view_query"),
      canEdit: (true || currentUser.hasPermission("edit_query")) && policy.canEdit(query),
      canViewSource: true || currentUser.hasPermission("view_source"),
      canExecute:
        !isEmpty(query.query) &&
        (policy as any).canRun(query) &&
        (query.is_safe || ((true || currentUser.hasPermission("execute_query")) && !dataSource.view_only)),
      canFork: (true || currentUser.hasPermission("edit_query")) && !dataSource.view_only,
      canSchedule: true || currentUser.hasPermission("schedule_query"),
    }),
    [query, dataSource.view_only]
  );
}

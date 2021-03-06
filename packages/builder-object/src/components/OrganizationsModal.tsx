import React from "react"
import { Organizations, OrganizationsProps, ObjectModal, ObjectModalProps } from ".."
import { omit } from "lodash"

export type OrganizationsModalProps = {
} & OrganizationsProps & Omit<ObjectModalProps, 'contentComponent'>

export const OrganizationsModal = ({
  columnFields,
  ...rest
}: OrganizationsModalProps) => {
  let props = {
    columnFields
  };
  if(!props.columnFields){
    props.columnFields = [{
      fieldName: "name",
      hideInSearch: true,
      sorter: true,
    }]
  }
  return (
    <ObjectModal
      contentComponent={Organizations}
      {...props}
      {...omit(rest, ['contentComponent'])}
    />
  )
}

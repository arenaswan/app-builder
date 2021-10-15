import * as React from "react"
import { Page, PublicPage } from '@steedos/builder-page';
export default {
  title: "Page",
}

export const PageSimple = () => {
  return (
    //   <Dashboard {...dashboard} layoutEditing={true}/>
    <Page pageId="remove_test" pageSlug="" pageIdSlug=""/>
  )
}

export const PublicPageSimple = () => {
    return (
      //   <Dashboard {...dashboard} layoutEditing={true}/>
      <PublicPage token="remove_test"/>
    )
  }
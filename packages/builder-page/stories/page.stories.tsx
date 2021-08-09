import * as React from "react"
import { Page, PublicPage } from '@steedos/builder-page';
export default {
  title: "Page",
}

export const PageSimple = () => {
  return (
    //   <Dashboard {...dashboard} layoutEditing={true}/>
    <Page pageId="610cdddedb5d0c2aacf390fb"/>
  )
}

export const PublicPageSimple = () => {
    return (
      //   <Dashboard {...dashboard} layoutEditing={true}/>
      <PublicPage token="610cdddedb5d0c2aacf390fb"/>
    )
  }
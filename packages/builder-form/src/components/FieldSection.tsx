import React, { useContext } from 'react';
import { Grid, GridItem, Flex, Box } from '@chakra-ui/layout'
import { observer } from "mobx-react-lite"
import useAntdMediaQuery from 'use-media-antd-query';

import ExpandableSection from '@salesforce/design-system-react/components/expandable-section';
import { forEach } from 'lodash';

export const FieldSection = observer((props: any) => {

  const colSize = useAntdMediaQuery();

  const { 
    attributes, // Builder.io 传过来的参数。
    title, 
    titleHidden = false,
    columns = (colSize === 'sm' || colSize === 'xs')? 1: 2, //(colSize === 'xl')? 3: (colSize === 'xxl')? 4: 2, 
    children 
  } = props
  
  const boxOptions = {
    templateColumns: [`repeat(1, 1fr)`, `repeat(${columns}, 1fr)`],
    gap: '0rem 2rem',
  }
  
  const renderChildren = (children:any) => {
    const result: any[] = []
    forEach(children, (child:any) => {
      result.push(child)
      return child
    })
    return (result)
  }

  if (titleHidden) 
    return (
      <Grid {...boxOptions}>
        {children}
      </Grid>
    )
  else
    return (
      <ExpandableSection
        id="default-expandable-section"
        title={title}
        className={props?.className}
      >
        <Grid {...boxOptions}>
          {children}
        </Grid>
      </ExpandableSection>
  )
})
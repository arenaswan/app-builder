import { Divider } from "antd"
import * as React from "react"
import { 
  RecordEditForm, 
  RecordViewForm, 
  FormSection, 
  InputField, 
  OutputField, 
  InputLookup, 
} from "../src"

export default {
  title: "Form",
}

export const EditForm = () => (
    <RecordEditForm>
      <FormSection title="Section 1">
        <InputField fieldName="name" required label="Name" isWide placeholder="Please enter name." fieldLevelHelp="Please input name"/>
        <InputField fieldName="email" readOnly label="Email" value="user@company.com"/>
        <InputField fieldName="number" type="number" label="Number"/>
        <InputField fieldName="lookup" type="lookup" label="Lookup"/>
        <InputLookup />
      </FormSection>
      <FormSection title="Section 2">
        <InputField fieldName="name" label="Name"/>
      </FormSection>
    </RecordEditForm>
  )
  
export const ReadonlyForm = () => (
  <RecordViewForm>
    <FormSection title="Section 1">
      <OutputField fieldName="name" required label="Name" isWide placeholder="Please enter name." fieldLevelHelp="Please input name" value="123"/>
      <OutputField fieldName="email" readOnly label="Email" value="user@company.com"/>
      <OutputField fieldName="number" type="number" label="Number" value="111222"/>
      <OutputField fieldName="lookup" type="lookup" label="Lookup"/>
    </FormSection>
    <FormSection title="Section 2">
      <OutputField fieldName="name" label="Name" value="Jack Zhuang"/>
    </FormSection>
  </RecordViewForm>
)

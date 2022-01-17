export const configProFormUploadDragger = {
  name: '@steedos-ui/builder-form:UploadDragger',
  inputs: [
    { name: 'name', type: 'text', defaultValue: 'dragger', required: true},
    { name: 'label', type: 'text', defaultValue: 'Dragger', required: true},
    { name: 'readonly', type: 'boolean', defaultValue: false },
    { name: 'width', type: 'string', defaultValue: 'md', enum: ['xs', 'sm', 'md', 'lg', 'xl']},
    { name: 'disabled', type: 'boolean', defaultValue:false, helperText: '是否禁用' },
    { name: 'rules',  type: 'list', subFields: [
      { name: 'required', type: 'boolean', defaultValue: false },
      { name: 'message', type: 'string', defaultValue: 'Please select file' }
    ], helperText: '控制组件是否必填和校验信息'},
  ],
  defaultStyles: {
    display: 'block',
    marginTop: '0',
  },
  canHaveChildren: false,
  requiresParent: {
    message: 'This block must be inside a "Form" or "FormSection" or "FormList" or "Table" block',
    query: {
      'component.name': { $in: ['@steedos-ui/builder-form:Form', '@steedos-ui/builder-form:FormSection', '@steedos-ui/builder-form:FormList', '@steedos-ui/builder-form:Table'] }
    }
  }
};

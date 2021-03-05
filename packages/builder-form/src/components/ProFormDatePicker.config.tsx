export const configProFormDatePicker = {
  name: 'Steedos:FormDatePicker',
  inputs: [
    { name: 'name', type: 'text', defaultValue: 'date'},
    { name: 'readonly', type: 'boolean', defaultValue: false, enum:[true, false]},
    { name: 'width', type: 'string', defaultValue: 'md', enum: ['xs', 'sm', 'md', 'lg', 'xl']},
    { name: 'label', type: 'text', defaultValue: 'Date Picker'},
    { name: 'fieldProps', type: 'object', subFields: [
      { name: 'allowClear', type: 'boolean', defaultValue: true},
      { name: 'size', type: 'string', defaultValue:'middle', enum: ['large', 'middle', 'small']},
      { name: 'autoFocus', type: 'boolean', defaultValue: false},
      { name: 'bordered', type: 'boolean', defaultValue: true},
      { name: 'inputReadOnly', type: 'boolean', defaultValue: false}
    ]}
   
  ],
  canHaveChildren: false
};

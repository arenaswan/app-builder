
import React, {FC, forwardRef, Ref} from "react";
import _ from 'lodash'
import { useTable, useSortBy, Column, Cell, Row, ColumnInstance, useResizeColumns, useFlexLayout, useRowSelect } from 'react-table'
import onClickOutside from 'react-onclickoutside';

import Button from '@salesforce/design-system-react/components/button'; 
import Checkbox from '@salesforce/design-system-react/components/checkbox'; 

import { InputField } from '..'

type TableProps = any;
type SteedosColumnOptions = {
  fieldName?: string,
  label?: string,
  editable?: boolean,
}
export type SteedosColumn = Column & SteedosColumnOptions

export type SteedosColumnInstance<D extends object = {}> = ColumnInstance & SteedosColumnOptions


const CustomRowProps = (row:any) => {
  return {
      class: "slds-hint-parent"
  }
}

const CustomCellProps = (cell:any) => {
  return {
    class: cell.column["editable"]?"slds-cell-edit":"slds-cell-readonly"
  }
}

// Create an editable cell renderer
export class CustomCell extends React.Component<any, any> {
  inputFieldRef: React.RefObject<HTMLInputElement>;

  static defaultProps = {
  }

  static state = {
    editing: false,
    editable: false,
    value: null,
  }

  constructor(props:any) {
    super(props);
    this.state = {
      value: this.props.value,
      isEdited: false,
      editable: !!this.props.column.editable
    };
    this.inputFieldRef = React.createRef();
    console.log(this.props)
  }

  onEdit = () => {
    this.setState({editing: true});
    setTimeout(() => {
      this.inputFieldRef && this.inputFieldRef.current && this.inputFieldRef.current.focus() 
    }, 100);
  }

  // We'll only update the external data when the input is blurred
  onBlur = () => {
    this.setState({editing: false})
    // updateMyData(this.props.row.index, this.props.column.id, this.state.value)
  }

  onChange = (e:any) => {
    this.setState({value: e.target.value})
    this.setState({isEdited: (this.props.value !== e.target.value)})
  }

  handleClickOutside = (evt:any) => {
    this.setState({editing: false})
    // ..handling code goes here...
  };

  render() {
    // return 
    if (this.state["editable"]) {
      const className = "slds-grid slds-grid_align-spread "  + (this.state['isEdited']?'slds-is-edited':'')
      return (
        <span className={className} onDoubleClick={this.onEdit}>
          <span className="slds-truncate" title={this.state["value"]}>{this.state["value"]}</span>
          
          {this.state["editing"] && (
         <section aria-describedby="dialog-body-id-225" className="slds-popover slds-popover slds-popover_edit" role="dialog" style={{position: "absolute", top: "0px", left: "0.0625rem"}}>
              <div id="popover-body-id" className="slds-popover__body">
                <InputField 
                  value={this.state["value"]} 
                  type={this.props.column.type} 
                  onChange={this.onChange} 
                  onBlur={this.onBlur} 
                  inputRef={this.inputFieldRef}/>
              </div>
          </section>
          )}

          <Button
            iconCategory="utility"
            iconName="edit"
            iconSize="small"
            variant="icon"
            className=" slds-cell-edit__button slds-m-left_x-small"
            iconClassName=" slds-button__icon_hint slds-button__icon_edit"
            onClick={this.onEdit}
          />
        </span>
      )
    }
    else 
      return (<span className="slds-truncate" title={this.state["value"]}>{this.state["value"]}</span>)
  }
}

const CustomCellEnhanced = onClickOutside(CustomCell)

// https://developer.salesforce.com/docs/component-library/bundle/lightning-input-field/documentation
export const DataTable: FC<TableProps> = forwardRef((props: TableProps, ref: Ref<HTMLDivElement>)  => {
  const {columns, data, ...rest} = props

  _.each(columns, (col: SteedosColumn) => {
      col.accessor = col.fieldName
      col.Header = col.label
  });
  
  const memoColumns:Array<SteedosColumn> = React.useMemo(() => columns, [])
  const memoData:Array<any> = React.useMemo(() => data, [])

  const defaultColumn = React.useMemo(
    () => ({
      // When using the useFlexLayout:
      minWidth: 50, // minWidth is only used as a limit for resizing
      width: 100, // width is used for both the flex-basis and flex-grow
      maxWidth: 200, // maxWidth is only used as a limit for resizing
      Cell: CustomCellEnhanced,
    }),
    []
  )

  const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }: any, ref) => {
      const defaultRef = React.useRef();
      const resolvedRef: any = ref || defaultRef;
  
      React.useEffect(() => {
        if (resolvedRef.current) {
          resolvedRef.current.indeterminate = indeterminate;
        }
      }, [resolvedRef, indeterminate]);
    
      return (
					<Checkbox ref={resolvedRef} {...rest}/>
      )
    }
  )

  const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
    } = useTable(
      {
        columns: memoColumns,
        data: memoData,
        defaultColumn: defaultColumn
      },
      useSortBy,
      useResizeColumns,
      useFlexLayout,
      useRowSelect,
      hooks => {
        hooks.allColumns.push(columns => [
          // Let's make a column for selection
          {
            id: 'selection',
            disableResizing: true,
            minWidth: 50,
            width: 50,
            maxWidth: 50,
            // The header can use the table's getToggleAllRowsSelectedProps method
            // to render a checkbox
            Header: ({ getToggleAllRowsSelectedProps }:any) => (
              <div>
                <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
              </div>
            ),
            // The cell can use the individual row's getToggleRowSelectedProps method
            // to the render a checkbox
            Cell: ({ row }:any) => (
              <div>
                <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
              </div>
            ),
          },
          ...columns,
        ])
        hooks.useInstanceBeforeDimensions.push(({ headerGroups }) => {
          // fix the parent group of the selection button to not be resizable
          const selectionGroupHeader = headerGroups[0].headers[0]
          // selectionGroupHeader.canResize = false
        })
      }
    )



  // We don't want to render all 2000 rows for this example, so cap
  // it at 20 for this use case
  const firstPageRows = rows.slice(0, 20)
  
  // Render the UI for your table
  return (
    <table {...getTableProps()} className="slds-table slds-table_cell-buffer slds-table_bordered">
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()} className="slds-line-height_reset">
            {headerGroup.headers.map((column: any) => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render('Header')}
                <span>
                  {column.isSorted
                    ? column.isSortedDesc
                      ? ' 🔽'
                      : ' 🔼'
                    : ''}
                </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row:any, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps(CustomRowProps(row))}>
              {row.cells.map((cell:any) => {
                const column:SteedosColumnInstance = cell.column;
                return (
                  <td {...cell.getCellProps(CustomCellProps(cell))}
                    >{cell.render('Cell')}</td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
})
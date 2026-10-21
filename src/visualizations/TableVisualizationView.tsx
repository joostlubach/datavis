import { Sheet, Table } from '@mui/joy'
import { memo } from 'react-util'
import { Dataset } from '../types/Dataset'
import { formatValue } from '../util/format'
import { sx$ } from '../util/sx'

export interface TableVisualizationViewProps {
  data: Dataset
}

/**
 * All rows and columns, as a table.
 */
export const TableVisualizationView = memo('TableVisualizationView', (props: TableVisualizationViewProps) => {

  const {data} = props

  return (
    <Sheet sx={$.TableVisualizationView}>
      <Table size='sm' stickyHeader hoverRow>
        <thead>
          <tr>
            {data.columns.map((column, index) => (
              <th key={index} style={{textAlign: column.type === 'number' ? 'right' : 'left'}}>
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {data.columns.map((column, index) => (
                <td key={index} style={{textAlign: column.type === 'number' ? 'right' : 'left'}}>
                  {formatValue(row[index], column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </Sheet>
  )

})

const $ = sx$({
  TableVisualizationView: {
    maxHeight: 360,
    overflow:  'auto',
    bgcolor:   'transparent',

    '& td, & th': {
      whiteSpace:         'nowrap',
      fontVariantNumeric: 'tabular-nums',
    },
  },
})

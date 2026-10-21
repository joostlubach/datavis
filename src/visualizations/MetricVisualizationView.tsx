import { memo } from 'react-util'
import { MetricValue } from '../components/MetricValue'
import { useDatavisMessages } from '../DatavisMessages'
import { Dataset } from '../types/Dataset'
import { MetricVisualization } from '../types/MetricVisualization'
import { formatValue } from '../util/format'
import { Message } from './Message'

export interface MetricVisualizationViewProps {
  visualization: MetricVisualization
  data:          Dataset
}

/**
 * A single value: a column of the first row.
 */
export const MetricVisualizationView = memo('MetricVisualizationView', (props: MetricVisualizationViewProps) => {

  const {visualization, data} = props
  const messages = useDatavisMessages()

  const index = visualization.column == null ? 0 : data.columns.findIndex(it => it.name === visualization.column)
  const column = data.columns[index]
  const row = data.rows[0]

  if (column == null) {
    return <Message kind='error'>{messages.unknownColumn(visualization.column ?? '')}</Message>
  }

  return (
    <MetricValue
      value={row == null ? '—' : formatValue(row[index], column)}
      unit={visualization.unit}
    />
  )

})

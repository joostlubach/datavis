import { memo } from 'react-util'
import { MetricValue } from '../components/MetricValue'
import { Delta } from '../components/DeltaIcon'
import { useDatavisTranslation } from '../hooks/useDatavisTranslation'
import { Dataset } from '../types/Dataset'
import { MetricVisualization } from '../types/MetricVisualization'
import { formatValue, toNumber } from '../util/format'
import { Message } from './Message'

export interface MetricVisualizationViewProps {
  visualization: MetricVisualization
  data:          Dataset
}

/**
 * A single value: a column of the first row. Compared with a baseline, it shows whether it went up or down, in green
 * when that is good news and in red when it is not.
 */
export const MetricVisualizationView = memo('MetricVisualizationView', (props: MetricVisualizationViewProps) => {

  const {visualization, data} = props
  const {t} = useDatavisTranslation()

  const index = visualization.column == null ? 0 : data.columns.findIndex(it => it.name === visualization.column)
  const column = data.columns[index]
  const baselineIndex = visualization.baseline == null ? null : data.columns.findIndex(it => it.name === visualization.baseline)
  const row = data.rows[0]

  if (column == null) {
    return <Message kind='error'>{t('unknown_column', {column: visualization.column ?? ''})}</Message>
  }
  if (baselineIndex === -1) {
    return <Message kind='error'>{t('unknown_column', {column: visualization.baseline ?? ''})}</Message>
  }

  const delta = row == null || baselineIndex == null ? null : deltaOf(toNumber(row[index]), toNumber(row[baselineIndex]))
  const good = delta == null || delta === 'equal' ? null : (delta === 'up') !== visualization.inverse
  const baseline = row == null || baselineIndex == null ? null : formatValue(row[baselineIndex], data.columns[baselineIndex])

  return (
    <MetricValue
      value={row == null ? '—' : formatValue(row[index], column)}
      unit={visualization.unit}
      color={good == null ? undefined : good ? 'success' : 'danger'}
      delta={delta ?? undefined}
      detail={baseline == null ? null : t('baseline', {value: baseline})}
    />
  )

})

function deltaOf(value: number | null, baseline: number | null): Delta | null {
  if (value == null || baseline == null) { return null }
  return value > baseline ? 'up' : value < baseline ? 'down' : 'equal'
}

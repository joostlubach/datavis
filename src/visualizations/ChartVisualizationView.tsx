import { useTheme } from '@mui/joy'
import { memo } from 'react-util'
import { useDatavisTranslation } from '../hooks/useDatavisTranslation'
import { ChartView, ChartViewSeries } from '../components/ChartView'
import { ChartSeriesAxis, ChartVisualization } from '../types/ChartVisualization'
import { Dataset } from '../types/Dataset'
import { chartColors } from '../util/colors'
import { formatTick, formatValue, toNumber } from '../util/format'
import { Message } from './Message'

export interface ChartVisualizationViewProps {
  visualization: ChartVisualization
  data:          Dataset
}

/**
 * A column or line chart of one or more columns (the series) against another (the x axis), one point per row.
 */
export const ChartVisualizationView = memo('ChartVisualizationView', (props: ChartVisualizationViewProps) => {

  const {visualization, data} = props
  const {t} = useDatavisTranslation()
  const colors = chartColors(useTheme())

  const column = (name: string) => data.columns.findIndex(it => it.name === name)
  const xIndex = column(visualization.x)

  const missing = [visualization.x, ...visualization.series.map(it => it.y)].filter(name => column(name) === -1)

  const series: Array<ChartViewSeries & {index: number}> = visualization.series.map((it, index) => ({
    key:            it.y,
    label:          it.y,
    axis:           it.axis,
    mark:           it.type,
    color:          colors[index % colors.length],
    rightAxisLabel: t('right_axis'),
    index:          column(it.y),
  }))

  const points = data.rows.map(row => ({
    label:  formatValue(row[xIndex], data.columns[xIndex]),
    tick:   formatTick(row[xIndex], data.columns[xIndex]),
    values: series.map(it => toNumber(row[it.index])),
  }))

  const axisColumn = (axis: ChartSeriesAxis) => data.columns[series.find(it => it.axis === axis)?.index ?? -1]

  function render() {
    if (missing.length > 0) {
      return (
        <Message kind='error'>
          {t('unknown_column', {column: missing.join(', ')})}
        </Message>
      )
    } else if (points.length === 0) {
      return (
        <Message kind='empty'>
          {t('no_rows')}
        </Message>
      )
    } else {
      return (
        <ChartView
          series={series}
          points={points}
          formatValue={(value, it) => formatValue(value, data.columns[(it as typeof series[number]).index])}
          formatTick={(value, axis) => formatTick(value, axisColumn(axis))}
        />
      )
    }
  }

  return render()

})

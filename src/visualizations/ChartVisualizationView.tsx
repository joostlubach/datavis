import { useTheme } from '@mui/joy'
import { useCallback } from 'react'
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

  const formatSeriesValue = useCallback((value: number, it: ChartViewSeries) => {
    return formatValue(value, data.columns.find(column => column.name === it.key))
  }, [data.columns])

  // A tick of an axis is formatted like the first series on it.
  const formatAxisTick = useCallback((value: number, axis: ChartSeriesAxis) => {
    const y = visualization.series.find(it => it.axis === axis)?.y
    return formatTick(value, data.columns.find(column => column.name === y))
  }, [data.columns, visualization.series])

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
          formatValue={formatSeriesValue}
          formatTick={formatAxisTick}
        />
      )
    }
  }

  return render()

})

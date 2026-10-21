export interface ChartVisualization {
  type: 'chart'

  x:      string
  series: ChartSeries[]
}

export interface ChartSeries {
  type: ChartSeriesType
  y:    string
  axis: ChartSeriesAxis
}

/** Columns of the same axis stand side by side; stacked columns of the same axis are put on top of each other. */
export enum ChartSeriesType {
  Column = 'column',
  StackedColumn = 'stacked-column',
  Line = 'line'
}

/** The secondary axis is on the right, for a measure of another scale or unit. */
export enum ChartSeriesAxis {
  Primary = 'primary',
  Secondary = 'secondary'
}
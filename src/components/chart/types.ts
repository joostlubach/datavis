
export interface ChartSeries {
  key:   string
  label: string
  color: string
  type:  ChartSeriesType
  axis:  ChartSeriesAxis

  /** Added to the label of a series on the right axis, to tell it apart. */
  rightAxisLabel?: string
  /** What the hatched part of a value is, like "already started". */
  hatchedLabel?: string
}

export interface ChartPoint {
  /** Shown in the tooltip. */
  label:    string
  /** Shown on the x axis, where there is room. */
  tick:     string
  /** Per series. */
  values:   Array<number | null>
  /** Per series, the part of the value that is hatched. */
  hatched?: Array<number | null>
}

export enum ChartSeriesType {
  Column = 'column',
  StackedColumn = 'stacked-column',
  Line = 'line'
}

export enum ChartSeriesAxis {
  Primary = 'primary',
  Secondary = 'secondary'
}

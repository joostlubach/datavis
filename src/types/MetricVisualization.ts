export interface MetricVisualization {
  type:   'metric'
  /** Of the first row. Defaults to the first column. */
  column: string | null
  unit:   string | null
}

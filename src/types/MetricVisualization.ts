export interface MetricVisualization {
  type:     'metric'
  /** Of the first row. Defaults to the first column. */
  column:   string | null
  unit:     string | null
  /** A column of the first row to compare with, like the value of the period before, to show whether it went up or down. */
  baseline: string | null
  /** Whether a lower value is the better one, like for rejections. */
  inverse:  boolean
}

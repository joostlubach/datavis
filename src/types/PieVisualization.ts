export interface PieVisualization {
  type:  'pie'
  label: string
  value: string
  /** With a hole that shows the total. */
  donut: boolean
}

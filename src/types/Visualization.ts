import { ChartVisualization } from './ChartVisualization'
import { MetricVisualization } from './MetricVisualization'
import { PieVisualization } from './PieVisualization'
import { TableVisualization } from './TableVisualization'

export type Visualization =
  | MetricVisualization
  | ChartVisualization
  | PieVisualization
  | TableVisualization

import { memo } from 'react-util'
import { Dataset } from '../types/Dataset'
import { Visualization } from '../types/Visualization'
import { ChartVisualizationView } from './ChartVisualizationView'
import { MetricVisualizationView } from './MetricVisualizationView'
import { PieVisualizationView } from './PieVisualizationView'
import { TableVisualizationView } from './TableVisualizationView'

export interface VisualizationViewProps {
  visualization: Visualization
  data:          Dataset
}

/**
 * Shows a dataset the way a visualization says.
 */
export const VisualizationView = memo('VisualizationView', (props: VisualizationViewProps) => {

  const {visualization, data} = props

  switch (visualization.type) {
  case 'metric': return <MetricVisualizationView visualization={visualization} data={data}/>
  case 'chart': return <ChartVisualizationView visualization={visualization} data={data}/>
  case 'pie': return <PieVisualizationView visualization={visualization} data={data}/>
  case 'table': return <TableVisualizationView data={data}/>
  }

})

import { z } from 'zod'
import { ChartSeriesAxis, ChartSeriesType } from '../types/ChartVisualization'
import { Visualization } from '../types/Visualization'

/**
 * Checks a visualization that comes from elsewhere, like a database, and fills in what was left out.
 */
export const visualizationSchema: z.ZodType<Visualization> = z.discriminatedUnion('type', [
  z.object({
    type:     z.literal('metric'),
    column:   z.string().nullable().default(null),
    unit:     z.string().nullable().default(null),
    baseline: z.string().nullable().default(null),
    inverse:  z.boolean().default(false),
  }),
  z.object({
    type:   z.literal('chart'),
    x:      z.string(),
    series: z.array(z.object({
      type: z.enum(ChartSeriesType),
      y:    z.string(),
      axis: z.enum(ChartSeriesAxis).default(ChartSeriesAxis.Primary),
    })).min(1),
  }),
  z.object({
    type:  z.literal('pie'),
    label: z.string(),
    value: z.string(),
    donut: z.boolean().default(false),
  }),
  z.object({
    type: z.literal('table'),
  }),
])

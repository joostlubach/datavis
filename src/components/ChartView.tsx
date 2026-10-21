import { Box, Divider, Stack, Typography, useTheme } from '@mui/joy'
import { ReactNode, useCallback, useId, useRef, useState } from 'react'
import { useSize } from 'react-measure'
import { memo } from 'react-util'
import { ChartSeriesAxis, ChartSeriesType } from '../types/ChartVisualization'
import { hatchColor } from '../util/colors'
import { sx$ } from '../util/sx'
import { ChartSwatch } from './ChartSwatch'

export interface ChartViewProps {
  series: ChartViewSeries[]
  points: ChartPoint[]

  formatValue: (value: number, series: ChartViewSeries) => string
  formatTick:  (value: number, axis: ChartSeriesAxis) => string

  /** Shown after the series in the legend. */
  legendExtra?: ReactNode
}

/**
 * A column or line chart, or both, with a point per value on the x axis. Columns of an axis stand side by side, or are
 * stacked into one. Series may have an axis of their own on the right, and part of a value can be hatched, drawn at
 * the top of its column.
 */
export const ChartView = memo('ChartView', (props: ChartViewProps) => {

  const {series, points, formatValue, formatTick, legendExtra} = props
  const theme = useTheme()
  const patternID = useId()

  const containerRef = useRef<HTMLDivElement>(null)
  const {width} = useSize(containerRef)
  const [hovered, setHovered] = useState<number | null>(null)
  const clearHovered = useCallback(() => setHovered(null), [])

  const hasRight = series.some(it => it.axis === ChartSeriesAxis.Secondary)

  const leftTicks = niceTicks(...domain(points, series, ChartSeriesAxis.Primary))
  const rightTicks = hasRight ? alignedTicks(...domain(points, series, ChartSeriesAxis.Secondary), leftTicks.length) : null

  const innerWidth = Math.max(0, width - margin.left - (hasRight ? margin.left : margin.right))
  const innerHeight = HEIGHT - margin.top - margin.bottom
  const band = points.length === 0 ? 0 : innerWidth / points.length

  const scale = (ticks: number[]) => (value: number) => {
    const min = ticks[0]
    const max = ticks[ticks.length - 1]
    return margin.top + innerHeight - (value - min) / (max - min || 1) * innerHeight
  }
  const yLeft = scale(leftTicks)
  const yRight = rightTicks == null ? yLeft : scale(rightTicks)
  const y = (it: ChartViewSeries) => it.axis === ChartSeriesAxis.Secondary ? yRight : yLeft
  const cx = (index: number) => margin.left + band * (index + 0.5)

  // Columns stand side by side, except for those stacked into a single one per axis.
  const stackAxes = [ChartSeriesAxis.Primary, ChartSeriesAxis.Secondary].filter(axis => series.some(it => isStacked(it) && it.axis === axis))
  const barSlots = series.filter(it => it.mark === ChartSeriesType.Column).length + stackAxes.length

  // #region Rendering

  function render() {
    return (
      <Stack gap={1}>
        {(series.length > 1 || legendExtra != null) && renderLegend()}
        <Box ref={containerRef} sx={$.plot} onMouseLeave={clearHovered}>
          {width > 0 && (
            <svg width={width} height={HEIGHT} style={{display: 'block'}}>
              {renderHatchPattern()}
              {renderGrid()}
              {renderBars()}
              {renderLines()}
              {renderXAxis()}
              {renderHitTargets()}
            </svg>
          )}
          {hovered != null && renderTooltip(hovered)}
        </Box>
      </Stack>
    )
  }

  function renderLegend() {
    return (
      <Stack direction='row' sx={$.legend}>
        {series.map(it => (
          <Stack key={it.key} direction='row' gap={0.5} alignItems='center'>
            <ChartSwatch color={it.color} line={it.mark === ChartSeriesType.Line}/>
            <Typography level='body-xs' textColor='text.secondary' noWrap>{seriesLabel(it)}</Typography>
          </Stack>
        ))}
        {legendExtra}
      </Stack>
    )
  }

  function seriesLabel(it: ChartViewSeries) {
    return it.axis === ChartSeriesAxis.Secondary && it.rightAxisLabel != null ? `${it.label} (${it.rightAxisLabel})` : it.label
  }

  function renderHatchPattern() {
    return (
      <defs>
        <pattern id={patternID} patternUnits='userSpaceOnUse' width={3.5} height={3.5} patternTransform='rotate(45)'>
          <rect width={1.5} height={3.5} style={{fill: hatchColor}}/>
        </pattern>
      </defs>
    )
  }

  function renderGrid() {
    return leftTicks.map((tick, index) => (
      <g key={index}>
        <line
          x1={margin.left}
          x2={margin.left + innerWidth}
          y1={yLeft(tick)}
          y2={yLeft(tick)}
          style={{stroke: theme.vars.palette.divider, strokeWidth: 1}}
        />
        {renderTick(margin.left - 6, yLeft(tick), 'end', formatTick(tick, ChartSeriesAxis.Primary))}
        {rightTicks != null && renderTick(margin.left + innerWidth + 6, yLeft(tick), 'start', formatTick(rightTicks[index], ChartSeriesAxis.Secondary))}
      </g>
    ))
  }

  function renderTick(x: number, y: number, anchor: 'start' | 'end', text: string) {
    return (
      <text x={x} y={y} textAnchor={anchor} dominantBaseline='middle' style={{fill: theme.vars.palette.text.tertiary, fontSize: 11}}>
        {text}
      </text>
    )
  }

  function renderXAxis() {
    const step = Math.max(1, Math.ceil(points.length / Math.max(1, Math.floor(innerWidth / 72))))
    return points.map((point, index) => index % step !== 0 ? null : (
      <text
        key={index}
        x={cx(index)}
        y={HEIGHT - 4}
        textAnchor='middle'
        style={{fill: theme.vars.palette.text.tertiary, fontSize: 11}}
      >
        {truncate(point.tick, 14)}
      </text>
    ))
  }

  function renderBars() {
    if (barSlots === 0) { return null }

    const gap = band < 8 ? 0.5 : GAP
    const groupWidth = Math.min(band * 0.7, barSlots * MAX_BAR + (barSlots - 1) * gap)
    const barWidth = Math.max(1, (groupWidth - (barSlots - 1) * gap) / barSlots)

    return points.map((point, index) => {
      const left = cx(index) - groupWidth / 2
      let slot = stackAxes.length
      const stacks = {
        [ChartSeriesAxis.Primary]:   {positive: 0, negative: 0},
        [ChartSeriesAxis.Secondary]: {positive: 0, negative: 0},
      }

      return (
        <g key={index} opacity={hovered == null || hovered === index ? 1 : 0.5}>
          {series.map((it, seriesIndex) => {
            if (!isBar(it)) { return null }

            const stacked = isStacked(it)
            const x = left + (stacked ? stackAxes.indexOf(it.axis) : slot++) * (barWidth + gap)
            const value = point.values[seriesIndex]
            if (value == null || value === 0) { return null }

            let from = 0
            if (stacked) {
              const stack = stacks[it.axis]
              from = value > 0 ? stack.positive : stack.negative
              if (value > 0) { stack.positive += value } else { stack.negative += value }
            }

            // In a stack, each segment leaves a gap to the one below it.
            const segmentGap = stacked && from !== 0 ? gap : 0
            const sign = value > 0 ? 1 : -1
            const base = y(it)(from) - sign * segmentGap
            const end = y(it)(from + value)
            const radius = !stacked || isLastOfStack(series, point.values, seriesIndex, value > 0) ? RADIUS : 0
            // The hatched part is at the end of the bar, over its color.
            const hatched = Math.min(Math.abs(point.hatched?.[seriesIndex] ?? 0), Math.abs(value))
            const hatchedBase = hatched === Math.abs(value) ? base : y(it)(from + value - sign * hatched)

            return (
              <g key={it.key}>
                <path d={barPath(x, base, end, barWidth, radius)} style={{fill: it.color}}/>
                {hatched > 0 && (
                  <path d={barPath(x, hatchedBase, end, barWidth, radius)} style={{fill: `url(#${patternID})`}}/>
                )}
              </g>
            )
          })}
        </g>
      )
    })
  }

  function renderLines() {
    const lines = series.map((it, seriesIndex) => ({it, seriesIndex})).filter(({it}) => it.mark === ChartSeriesType.Line)
    if (lines.length === 0) { return null }

    return (
      <>
        {lines.map(({it, seriesIndex}) => (
          <path
            key={it.key}
            d={linePath(points.map((point, index) => {
              const value = point.values[seriesIndex]
              return value == null ? null : [cx(index), y(it)(value)] as const
            }))}
            fill='none'
            style={{stroke: it.color, strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round'}}
          />
        ))}
        {hovered != null && (
          <>
            <line
              x1={cx(hovered)}
              x2={cx(hovered)}
              y1={margin.top}
              y2={margin.top + innerHeight}
              style={{stroke: theme.vars.palette.neutral.outlinedBorder, strokeWidth: 1}}
            />
            {lines.map(({it, seriesIndex}) => {
              const value = points[hovered].values[seriesIndex]
              if (value == null) { return null }
              return (
                <circle
                  key={it.key}
                  cx={cx(hovered)}
                  cy={y(it)(value)}
                  r={4}
                  style={{fill: it.color, stroke: theme.vars.palette.background.surface, strokeWidth: 2}}
                />
              )
            })}
          </>
        )}
      </>
    )
  }

  function renderHitTargets() {
    return points.map((_, index) => (
      <HitTarget
        key={index}
        index={index}
        x={margin.left + band * index}
        width={band}
        height={innerHeight}
        onHover={setHovered}
      />
    ))
  }

  function renderTooltip(index: number) {
    const point = points[index]
    const flip = cx(index) > width / 2

    return (
      <Box sx={[$.tooltip, flip ? {right: width - cx(index) + 12} : {left: cx(index) + 12}]}>
        <Stack gap={0.5}>
          <Typography level='title-sm' noWrap>{point.label}</Typography>
          <Divider/>
          {series.map((it, seriesIndex) => (
            <Stack key={it.key} direction='row' gap={1} alignItems='center'>
              <ChartSwatch color={it.color} line={it.mark === ChartSeriesType.Line}/>
              <Typography level='body-xs' textColor='text.secondary' noWrap>{seriesLabel(it)}</Typography>
              <Typography level='body-xs' noWrap sx={$.tooltipValue}>
                {tooltipValue(point, it, seriesIndex)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    )
  }

  function tooltipValue(point: ChartPoint, it: ChartViewSeries, seriesIndex: number) {
    const value = point.values[seriesIndex]
    if (value == null) { return '—' }

    const hatched = point.hatched?.[seriesIndex]
    if (hatched == null || hatched === 0 || it.hatchedLabel == null) {
      return formatValue(value, it)
    }
    return `${formatValue(value, it)} (${formatValue(hatched, it)} ${it.hatchedLabel})`
  }

  // #endregion

  return render()

})

export interface ChartViewSeries {
  key:   string
  label: string
  color: string
  mark:  ChartSeriesType
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

interface HitTargetProps {
  index:   number
  x:       number
  width:   number
  height:  number
  onHover: (index: number) => void
}

const HitTarget = memo('HitTarget', (props: HitTargetProps) => {

  const {index, x, width, height, onHover} = props

  const hover = useCallback(() => {
    onHover(index)
  }, [index, onHover])

  return <rect x={x} y={margin.top} width={width} height={height} fill='transparent' onMouseEnter={hover}/>

})

const HEIGHT = 200
const MAX_BAR = 24
const GAP = 2
const RADIUS = 4
const margin = {top: 8, right: 8, bottom: 22, left: 44}

function isBar(series: ChartViewSeries) {
  return series.mark === ChartSeriesType.Column || series.mark === ChartSeriesType.StackedColumn
}

function isStacked(series: ChartViewSeries) {
  return series.mark === ChartSeriesType.StackedColumn
}

function domain(points: ChartPoint[], series: ChartViewSeries[], axis: ChartSeriesAxis): [number, number] {
  const values: number[] = []
  for (const point of points) {
    let positive = 0
    let negative = 0
    series.forEach((it, index) => {
      const value = point.values[index]
      if (it.axis !== axis || value == null) { return }

      if (isStacked(it)) {
        if (value > 0) { positive += value } else { negative += value }
      } else {
        values.push(value)
      }
    })
    values.push(positive, negative)
  }
  return [Math.min(0, ...values), Math.max(0, ...values)]
}

// Rounded at the end of the value, square at the baseline.
function barPath(x: number, base: number, end: number, width: number, radius: number) {
  const height = Math.abs(base - end)
  if (height < 0.5) { return '' }

  const r = Math.min(radius, height, width / 2)
  const dir = end < base ? 1 : -1
  return [
    `M${x},${base}`,
    `V${end + dir * r}`,
    `Q${x},${end} ${x + r},${end}`,
    `H${x + width - r}`,
    `Q${x + width},${end} ${x + width},${end + dir * r}`,
    `V${base}`,
    'Z',
  ].join(' ')
}

// A missing value breaks the line.
function linePath(points: Array<readonly [number, number] | null>) {
  let path = ''
  let drawing = false
  for (const point of points) {
    if (point == null) {
      drawing = false
      continue
    }
    path += `${drawing ? 'L' : 'M'}${point[0]},${point[1]} `
    drawing = true
  }
  return path
}

function isLastOfStack(series: ChartViewSeries[], values: Array<number | null>, index: number, positive: boolean) {
  return !values.some((it, other) => (
    other > index && isStacked(series[other]) && series[other].axis === series[index].axis && it != null && (positive ? it > 0 : it < 0)
  ))
}

function niceTicks(min: number, max: number, count: number = 4) {
  if (min === max) { return [0, max === 0 ? 1 : max] }

  const step = niceStep((max - min) / count)
  const ticks: number[] = []
  for (let tick = Math.floor(min / step) * step; tick <= Math.ceil(max / step) * step + step / 2; tick += step) {
    ticks.push(Math.round(tick / step) * step)
  }
  return ticks
}

// As many ticks as the left axis, so that both share its gridlines.
function alignedTicks(min: number, max: number, count: number) {
  const segments = Math.max(1, count - 1)
  if (min === max) { max = min + 1 }

  let step = niceStep((max - min) / segments)
  let start = Math.floor(min / step) * step
  while (start + step * segments < max) {
    step = niceStep(step * 1.01)
    start = Math.floor(min / step) * step
  }
  return Array.from({length: segments + 1}, (_, index) => start + index * step)
}

function niceStep(rough: number) {
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)))
  return [1, 2, 2.5, 5, 10].map(it => it * magnitude).find(it => it >= rough) ?? rough
}

function truncate(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length - 1)}…` : text
}

const $ = sx$({
  plot: {
    position: 'relative',
    width:    '100%',
    minWidth: 0,
  },

  legend: {
    flexWrap:   'wrap',
    columnGap:  2,
    rowGap:     0.5,
    alignItems: 'center',
  },

  tooltip: {
    position:      'absolute',
    top:           0,
    minWidth:      140,
    px:            1.5,
    py:            1,
    bgcolor:       'background.popup',
    borderRadius:  'sm',
    boxShadow:     'md',
    pointerEvents: 'none',
    zIndex:        1,
  },

  tooltipValue: {
    ml:                 'auto',
    pl:                 2,
    fontVariantNumeric: 'tabular-nums',
  },
})

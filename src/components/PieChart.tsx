import { Box, Stack, Typography, useTheme } from '@mui/joy'
import { CSSProperties, ReactNode, useCallback, useState } from 'react'
import { memo } from 'react-util'
import { chartColors } from '../util/colors'
import { sx$ } from '../util/sx'

export interface PieChartProps {
  slices:      PieChartSlice[]
  /** With a hole that shows the total. */
  donut?:      boolean
  formatValue: (value: number) => string
  /** The slice with the rest, if there are more slices than colors. */
  otherLabel:  string
}

/**
 * A pie chart, with a legend that holds the values.
 */
export const PieChart = memo('PieChart', (props: PieChartProps) => {

  const {donut = false, formatValue, otherLabel} = props
  const theme = useTheme()
  const colors = chartColors(theme)
  const [hovered, setHovered] = useState<number | null>(null)
  const clearHovered = useCallback(() => setHovered(null), [])

  const slices = (() => {
    const all = props.slices.filter(it => it.value > 0)

    // A slice per color at most; the rest goes together.
    if (all.length <= colors.length) { return all }
    const rest = all.slice(colors.length - 1)
    return [
      ...all.slice(0, colors.length - 1),
      {label: otherLabel, value: rest.reduce((total, it) => total + it.value, 0)},
    ]
  })()
  const total = slices.reduce((sum, it) => sum + it.value, 0)

  // #region Rendering

  function render() {
    return (
      <Stack direction='row' sx={$.PieChart} onMouseLeave={clearHovered}>
        {renderPie()}
        {renderLegend()}
      </Stack>
    )
  }

  function renderPie() {
    const inner = donut ? RADIUS * DONUT_HOLE : 0
    let angle = -Math.PI / 2

    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{flex: 'none'}}>
        {slices.map((slice, index) => {
          const start = angle
          angle += slice.value / total * Math.PI * 2

          return (
            <PieSlicePath
              key={index}
              index={index}
              d={slicePath(start, angle, index === hovered ? RADIUS + 4 : RADIUS, inner)}
              style={{
                fill:        colors[index],
                stroke:      theme.vars.palette.background.surface,
                strokeWidth: slices.length > 1 ? 2 : 0,
                opacity:     hovered == null || hovered === index ? 1 : 0.5,
              }}
              onHover={setHovered}
            />
          )
        })}
        {donut && renderTotal()}
      </svg>
    )
  }

  function renderTotal() {
    const slice = hovered == null ? null : slices[hovered]
    return (
      <text
        x={SIZE / 2}
        y={SIZE / 2}
        textAnchor='middle'
        dominantBaseline='central'
        style={{fill: theme.vars.palette.text.primary, fontSize: 20, fontWeight: 600}}
      >
        {formatValue(slice?.value ?? total)}
      </text>
    )
  }

  function renderLegend() {
    return (
      <Stack gap={0.5} sx={$.legend}>
        {slices.map((slice, index) => (
          <PieLegendRow key={index} index={index} hovered={hovered === index} onHover={setHovered}>
            <Box sx={[$.swatch, {bgcolor: colors[index]}]}/>
            <Typography level='body-xs' textColor='text.secondary' noWrap sx={$.label}>{slice.label}</Typography>
            <Typography level='body-xs' noWrap sx={$.value}>
              {formatValue(slice.value)}
            </Typography>
            <Typography level='body-xs' textColor='text.tertiary' noWrap sx={$.percentage}>
              {formatPercentage(slice.value / total)}
            </Typography>
          </PieLegendRow>
        ))}
      </Stack>
    )
  }

  // #endregion

  return render()

})

export interface PieChartSlice {
  label: string
  value: number
}

interface PieSlicePathProps {
  index:   number
  d:       string
  style:   CSSProperties
  onHover: (index: number) => void
}

const PieSlicePath = memo('PieSlicePath', (props: PieSlicePathProps) => {

  const {index, d, style, onHover} = props

  const hover = useCallback(() => {
    onHover(index)
  }, [index, onHover])

  return <path d={d} fillRule='evenodd' style={style} onMouseEnter={hover}/>

})

interface PieLegendRowProps {
  index:    number
  hovered:  boolean
  onHover:  (index: number) => void
  children: ReactNode
}

const PieLegendRow = memo('PieLegendRow', (props: PieLegendRowProps) => {

  const {index, hovered, onHover, children} = props

  const hover = useCallback(() => {
    onHover(index)
  }, [index, onHover])

  return (
    <Stack direction='row' gap={1} alignItems='center' sx={[$.legendRow, hovered && $.hovered]} onMouseEnter={hover}>
      {children}
    </Stack>
  )

})

function formatPercentage(value: number) {
  return value.toLocaleString('nl-NL', {style: 'percent', maximumFractionDigits: 0})
}

const SIZE = 168
const RADIUS = SIZE / 2 - 6
const DONUT_HOLE = 0.6

// With an inner radius, a ring segment.
function slicePath(start: number, end: number, radius: number, inner: number) {
  const center = SIZE / 2
  const circle = (r: number) => `M${center - r},${center} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0`
  if (end - start >= Math.PI * 2 - 1e-6) {
    return inner > 0 ? `${circle(radius)} ${circle(inner)}` : circle(radius)
  }

  if (inner > 0) {
    const large = end - start > Math.PI ? 1 : 0
    const point = (r: number, angle: number) => `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`
    return `M${point(radius, start)} A${radius},${radius} 0 ${large},1 ${point(radius, end)} L${point(inner, end)} A${inner},${inner} 0 ${large},0 ${point(inner, start)} Z`
  }

  const x1 = center + radius * Math.cos(start)
  const y1 = center + radius * Math.sin(start)
  const x2 = center + radius * Math.cos(end)
  const y2 = center + radius * Math.sin(end)
  const large = end - start > Math.PI ? 1 : 0
  return `M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${large},1 ${x2},${y2} Z`
}

const $ = sx$({
  PieChart: {
    gap:        3,
    alignItems: 'center',
    flexWrap:   'wrap',
  },

  legend: {
    flex:     '1 1 160px',
    minWidth: 0,
  },

  legendRow: {
    px:           0.5,
    borderRadius: 'xs',
  },

  hovered: {
    bgcolor: 'background.level1',
  },

  swatch: {
    flex:         'none',
    width:        10,
    height:       10,
    borderRadius: 2,
  },

  label: {
    flex:     '1 1 0',
    minWidth: 0,
  },

  value: {
    fontVariantNumeric: 'tabular-nums',
  },

  percentage: {
    width:              36,
    textAlign:          'right',
    fontVariantNumeric: 'tabular-nums',
  },
})

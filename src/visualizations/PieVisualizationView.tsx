import { Box, Stack, Typography, useTheme } from '@mui/joy'
import { useState } from 'react'
import { memo } from 'react-util'
import { useDatavisMessages } from '../DatavisMessages'
import { Dataset } from '../types/Dataset'
import { PieVisualization } from '../types/PieVisualization'
import { chartColors } from '../util/colors'
import { formatPercentage, formatValue, toNumber } from '../util/format'
import { sx$ } from '../util/sx'
import { Message } from './Message'

export interface PieVisualizationViewProps {
  visualization: PieVisualization
  data:          Dataset
}

/**
 * A pie chart with a slice per row, with a legend that holds the values.
 */
export const PieVisualizationView = memo('PieVisualizationView', (props: PieVisualizationViewProps) => {

  const {visualization, data} = props
  const messages = useDatavisMessages()
  const theme = useTheme()
  const colors = chartColors(theme)
  const [hovered, setHovered] = useState<number | null>(null)

  const labelIndex = data.columns.findIndex(it => it.name === visualization.label)
  const valueIndex = data.columns.findIndex(it => it.name === visualization.value)
  const missing = [visualization.label, visualization.value].filter(name => !data.columns.some(it => it.name === name))

  const slices = (() => {
    const all = data.rows
      .map(row => ({label: formatValue(row[labelIndex], data.columns[labelIndex]), value: toNumber(row[valueIndex]) ?? 0}))
      .filter(it => it.value > 0)

    // A slice per color at most; the rest goes together.
    if (all.length <= colors.length) { return all }
    const rest = all.slice(colors.length - 1)
    return [
      ...all.slice(0, colors.length - 1),
      {label: messages.other, value: rest.reduce((total, it) => total + it.value, 0)},
    ]
  })()
  const total = slices.reduce((sum, it) => sum + it.value, 0)

  // #region Rendering

  function render() {
    if (missing.length > 0) {
      return <Message kind='error'>{messages.unknownColumn(missing.join(', '))}</Message>
    }
    if (total === 0) {
      return <Message kind='empty'>{messages.noRows}</Message>
    }

    return (
      <Stack direction='row' sx={$.PieVisualizationView} onMouseLeave={() => setHovered(null)}>
        {renderPie()}
        {renderLegend()}
      </Stack>
    )
  }

  function renderPie() {
    const inner = visualization.donut ? RADIUS * DONUT_HOLE : 0
    let angle = -Math.PI / 2

    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{flex: 'none'}}>
        {slices.map((slice, index) => {
          const start = angle
          angle += slice.value / total * Math.PI * 2

          return (
            <path
              key={index}
              d={slicePath(start, angle, index === hovered ? RADIUS + 4 : RADIUS, inner)}
              fillRule='evenodd'
              style={{
                fill:        colors[index],
                stroke:      theme.vars.palette.background.surface,
                strokeWidth: slices.length > 1 ? 2 : 0,
                opacity:     hovered == null || hovered === index ? 1 : 0.5,
              }}
              onMouseEnter={() => setHovered(index)}
            />
          )
        })}
        {visualization.donut && renderTotal()}
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
        {formatValue(slice?.value ?? total, data.columns[valueIndex])}
      </text>
    )
  }

  function renderLegend() {
    return (
      <Stack gap={0.5} sx={$.legend}>
        {slices.map((slice, index) => (
          <Stack
            key={index}
            direction='row'
            gap={1}
            alignItems='center'
            sx={[$.legendRow, hovered === index && $.hovered]}
            onMouseEnter={() => setHovered(index)}
          >
            <Box sx={[$.swatch, {bgcolor: colors[index]}]}/>
            <Typography level='body-xs' textColor='text.secondary' noWrap sx={$.label}>{slice.label}</Typography>
            <Typography level='body-xs' noWrap sx={$.value}>
              {formatValue(slice.value, data.columns[valueIndex])}
            </Typography>
            <Typography level='body-xs' textColor='text.tertiary' noWrap sx={$.percentage}>
              {formatPercentage(slice.value / total)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    )
  }

  // #endregion

  return render()

})

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
  PieVisualizationView: {
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

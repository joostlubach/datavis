import { ChartPoint, ChartSeries, ChartSeriesAxis, ChartSeriesType } from './types'

export function isBar(series: ChartSeries) {
  return series.type === ChartSeriesType.Column || series.type === ChartSeriesType.StackedColumn
}

export function isStacked(series: ChartSeries) {
  return series.type === ChartSeriesType.StackedColumn
}

export function domain(points: ChartPoint[], series: ChartSeries[], axis: ChartSeriesAxis): [number, number] {
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

export function barPath(x: number, base: number, end: number, width: number, radius: number) {
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

export function linePath(points: Array<readonly [number, number] | null>) {
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

export function isLastOfStack(series: ChartSeries[], values: Array<number | null>, index: number, positive: boolean) {
  return !values.some((it, other) => (
    other > index && isStacked(series[other]) && series[other].axis === series[index].axis && it != null && (positive ? it > 0 : it < 0)
  ))
}

export function niceTicks(min: number, max: number, count: number = 4) {
  if (min === max) { return [0, max === 0 ? 1 : max] }

  const step = niceStep((max - min) / count)
  const ticks: number[] = []
  for (let tick = Math.floor(min / step) * step; tick <= Math.ceil(max / step) * step + step / 2; tick += step) {
    ticks.push(Math.round(tick / step) * step)
  }
  return ticks
}

export function alignedTicks(min: number, max: number, count: number) {
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

export function niceStep(rough: number) {
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)))
  return [1, 2, 2.5, 5, 10].map(it => it * magnitude).find(it => it >= rough) ?? rough
}

export function truncate(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length - 1)}…` : text
}

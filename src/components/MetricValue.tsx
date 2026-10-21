import { ColorPaletteProp, Stack, Typography } from '@mui/joy'
import { memo } from 'react-util'
import { sx$ } from '../util/sx'

export interface MetricValueProps {
  value:  string
  unit?:  string | null
  color?: ColorPaletteProp
}

/**
 * A single number, large, with an optional unit.
 */
export const MetricValue = memo('MetricValue', (props: MetricValueProps) => {

  const {value, unit, color} = props

  return (
    <Stack direction='row' gap={0.5} alignItems='baseline'>
      <Typography level='h2' noWrap textColor={color != null ? `${color}.plainColor` : undefined} sx={$.value}>
        {value}
      </Typography>
      {unit != null && (
        <Typography level='title-md' noWrap textColor='text.secondary'>
          {unit}
        </Typography>
      )}
    </Stack>
  )

})

const $ = sx$({
  value: {
    fontWeight:         600,
    fontVariantNumeric: 'proportional-nums',
  },
})

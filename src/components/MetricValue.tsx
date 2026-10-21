import { ColorPaletteProp, Stack, Typography } from '@mui/joy'
import { memo } from 'react-util'
import { Delta, DeltaIcon } from './DeltaIcon'
import { sx$ } from '../util/sx'

export interface MetricValueProps {
  value:   string
  unit?:   string | null
  color?:  ColorPaletteProp
  delta?:  Delta
  detail?: string | null
}

/**
 * A single number, large, with an optional unit, icon and detail.
 */
export const MetricValue = memo('MetricValue', (props: MetricValueProps) => {

  const {value, unit, color, delta, detail} = props
  const textColor = color != null ? `${color}.plainColor` : undefined

  return (
    <Stack direction='row' gap={0.5} alignItems='baseline'>
      {delta != null && (
        <Typography level='h4' textColor={textColor ?? 'text.tertiary'} sx={$.icon}>
          <DeltaIcon delta={delta}/>
        </Typography>
      )}
      <Typography level='h2' noWrap textColor={textColor} sx={$.value}>
        {value}
      </Typography>
      {unit != null && (
        <Typography level='title-md' noWrap textColor='text.secondary'>
          {unit}
        </Typography>
      )}
      {detail != null && (
        <Typography level='body-sm' noWrap textColor='text.tertiary' sx={$.detail}>
          {detail}
        </Typography>
      )}
    </Stack>
  )

})

const $ = sx$({
  detail: {
    ml: 0.5,
  },

  icon: {
    display:   'flex',
    alignSelf: 'center',
  },

  value: {
    fontWeight:         600,
    fontVariantNumeric: 'proportional-nums',
  },
})

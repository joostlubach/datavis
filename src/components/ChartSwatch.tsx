import { Box } from '@mui/joy'
import { memo } from 'react-util'
import { hatchColor } from '../util/colors'
import { sx$ } from '../util/sx'

export interface ChartSwatchProps {
  color:    string
  line?:    boolean
  hatched?: boolean
}

/**
 * The color of a series, as it shows in a legend.
 */
export const ChartSwatch = memo('ChartSwatch', (props: ChartSwatchProps) => {
  const {color, line = false, hatched = false} = props
  return <Box sx={[$.ChartSwatch, line && $.line, {bgcolor: color}, hatched && $.hatched]}/>
})

const $ = sx$({
  ChartSwatch: {
    flex:         'none',
    width:        10,
    height:       10,
    borderRadius: 2,
  },

  line: {
    height:       2,
    borderRadius: 1,
  },

  hatched: {
    backgroundImage: `repeating-linear-gradient(-45deg, transparent 0 2px, ${hatchColor} 2px 3.5px)`,
  },
})

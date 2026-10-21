import { Typography } from '@mui/joy'
import { memo } from 'react-util'
import { sx$ } from '../util/sx'

export interface MessageProps {
  kind:     'empty' | 'error'
  children: string
}

/**
 * Shown instead of a visualization, when there is nothing to show.
 */
export const Message = memo('Message', (props: MessageProps) => {

  const {kind, children} = props

  return (
    <Typography
      level='body-sm'
      textColor={kind === 'error' ? 'danger.plainColor' : 'text.tertiary'}
      sx={kind === 'empty' ? $.empty : undefined}
    >
      {children}
    </Typography>
  )

})

const $ = sx$({
  empty: {
    py:        4,
    textAlign: 'center',
  },
})

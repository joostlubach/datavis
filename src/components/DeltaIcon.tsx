import { memo } from 'react-util'

export interface DeltaIconProps {
  delta: Delta
}

/**
 * An arrow up or down, or an equals sign, in the color of the text around it.
 */
export const DeltaIcon = memo('DeltaIcon', (props: DeltaIconProps) => {

  const {delta} = props

  return (
    <svg width='0.8em' height='0.8em' viewBox='0 0 12 12' style={{flex: 'none'}}>
      <path d={paths[delta]} fill='currentColor'/>
    </svg>
  )

})

export type Delta = 'up' | 'down' | 'equal'

const paths: Record<Delta, string> = {
  up:    'M6 1 L11 7 H7.75 V11 H4.25 V7 H1 Z',
  down:  'M6 11 L11 5 H7.75 V1 H4.25 V5 H1 Z',
  equal: 'M1 3 H11 V5.25 H1 Z M1 6.75 H11 V9 H1 Z',
}

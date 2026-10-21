import { BoxProps } from '@mui/joy'

export type SxProp = BoxProps['sx']

export function sx$<S extends Record<string, SxProp>>(sx: S) {
  return sx
}

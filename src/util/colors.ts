import { Theme } from '@mui/joy'

/**
 * The colors of the series of a chart, in a fixed order. Validated for colour vision deficiencies against the surface
 * of each mode.
 */
export function chartColors(theme: Theme) {
  return theme.palette.mode === 'dark' ? dark : light
}

/** A color of the theme, like `primary.400`, as a CSS variable, for use in SVG. */
export function paletteColor(token: string) {
  return `var(--joy-palette-${token.replace('.', '-')})`
}

export const hatchColor = 'color-mix(in srgb, var(--joy-palette-danger-500) 50%, transparent)'

const light = ['#1c81b8', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948']
const dark = ['#3a94c9', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767']

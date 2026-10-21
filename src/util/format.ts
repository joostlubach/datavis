import { DateTime } from 'luxon'
import { DataColumn } from '../types/Dataset'

/**
 * Formats a value for display, by the type of its column.
 */
export function formatValue(value: unknown, column: DataColumn | undefined): string {
  if (value == null) { return '—' }

  switch (column?.type) {
  case 'number':
    return typeof value === 'number' ? value.toLocaleString(LOCALE, {maximumFractionDigits: 2}) : String(value)
  case 'date':
    return formatDate(value, 'd LLL yyyy')
  case 'datetime':
    return formatDate(value, 'd LLL yyyy HH:mm')
  case 'json':
    return JSON.stringify(value)
  default:
    return String(value)
  }
}

/** Shorter, for the axis of a chart. */
export function formatTick(value: unknown, column: DataColumn | undefined): string {
  if (column?.type === 'date' || column?.type === 'datetime') {
    return formatDate(value, 'd LLL')
  }
  if (column?.type === 'number' && typeof value === 'number') {
    return compactNumber(value)
  }
  return formatValue(value, column)
}

export function compactNumber(value: number) {
  return value.toLocaleString(LOCALE, {notation: 'compact', maximumFractionDigits: 1})
}

export function formatPercentage(value: number) {
  return value.toLocaleString(LOCALE, {style: 'percent', maximumFractionDigits: 0})
}

export function toNumber(value: unknown) {
  if (typeof value === 'number') { return value }
  if (typeof value === 'string' && value.trim() !== '') {
    const number = Number(value)
    return isNaN(number) ? null : number
  }
  return null
}

const LOCALE = 'nl-NL'

function formatDate(value: unknown, format: string) {
  // Dates come as `yyyy-MM-dd HH:mm:ss`, as the database has them.
  const date = DateTime.fromSQL(String(value))
  return date.isValid ? date.toFormat(format) : String(value)
}

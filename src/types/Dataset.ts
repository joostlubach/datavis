/** Rows of values, with a column for each value. */
export interface Dataset {
  columns: DataColumn[]
  rows:    unknown[][]
}

export interface DataColumn {
  name: string
  type: DataColumnType
}

export type DataColumnType = 'number' | 'date' | 'datetime' | 'text' | 'json'

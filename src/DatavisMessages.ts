import { createContext, useContext } from 'react'

/**
 * The texts that visualizations show, for the app to translate.
 */
export const DatavisMessagesContext = createContext<DatavisMessages>({
  noRows:        "No data.",
  unknownColumn: column => `Column ${column} does not appear in the result.`,
  rightAxis:     "right axis",
  other:         "Other",
  baseline:      value => `was ${value}`,
})

export function useDatavisMessages() {
  return useContext(DatavisMessagesContext)
}

export interface DatavisMessages {
  noRows:        string
  unknownColumn: (column: string) => string
  /** Added to the label of a series on the right axis, to tell it apart. */
  rightAxis:     string
  /** The slice of a pie chart with the rest of the rows. */
  other:         string
  /** The value a metric is compared with. */
  baseline:      (value: string) => string
}

import { useTranslation } from 'react-i18next'
import config from '../config'

export function useDatavisTranslation() {
  return useTranslation(config.namespace, {i18n: config.i18next ?? undefined})
}

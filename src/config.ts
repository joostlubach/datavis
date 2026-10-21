import { i18n as I18next } from 'i18next'

export interface Config {
  /** Falls back to the instance react-i18next has globally. */
  i18next:   I18next | null
  namespace: string
}

const config: Config = {
  i18next:   null,
  namespace: 'datavis',
}

export default config

export function configure(cfg: Partial<Config>) {
  Object.assign(config, cfg)
}

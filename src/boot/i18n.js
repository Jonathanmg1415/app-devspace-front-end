import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import es from '../i18n/es'
import en from '../i18n/en'

const i18n = createI18n({
  locale: localStorage.getItem('devspace_locale') || 'es',
  fallbackLocale: 'en',
  messages: { es, en },
  legacy: false,
})

export default boot(({ app }) => {
  app.use(i18n)
})

export { i18n }

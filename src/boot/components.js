import { boot } from 'quasar/wrappers'
import DsSpinner from 'src/components/DsSpinner.vue'

export default boot(({ app }) => {
  // Registrar DsSpinner globalmente (para usar en botones via <template #loading>)
  app.component('DsSpinner', DsSpinner)
})

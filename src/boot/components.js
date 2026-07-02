import { boot } from 'quasar/wrappers'
import { Loading } from 'quasar'
import DsSpinner from 'src/components/DsSpinner.vue'

export default boot(({ app }) => {
  app.component('DsSpinner', DsSpinner)

  Loading.setDefaults({
    spinner: DsSpinner,
    spinnerSize: 32,
    spinnerColor: undefined,
    backgroundColor: 'rgba(0,0,0,0.55)',
    message: '',
  })
})

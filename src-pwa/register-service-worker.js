import { register } from 'register-service-worker'

register(process.env.SERVICE_WORKER_FILE, {
  ready () {},
  registered () {},
  cached () {},
  updatefound () {},
  updated (registration) {
    document.dispatchEvent(new CustomEvent('swUpdated', { detail: registration }))
  },
  offline () {
    console.warn('DevSpace: sin conexión')
  },
  error (err) {
    console.error('Service worker error:', err)
  },
})

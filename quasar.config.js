import { configure } from 'quasar/wrappers'

module.exports = configure(function (ctx) {
  return {
    boot: ['axios', 'i18n'],
    css: ['app.scss'],
    extras: ['material-icons', 'mdi-v7'],
    build: {
      target: { browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'] },
      vueRouterMode: 'history',
      env: {
        API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:1337',
      },
    },
    devServer: { open: true },
    framework: {
      config: { dark: 'auto' },
      plugins: ['Notify', 'Dialog', 'Loading', 'LocalStorage', 'Cookies'],
    },
    animations: [],
    ssr: { pwa: false },
    pwa: {},
    cordova: {},
    capacitor: { hideSplashscreen: true },
    electron: { inspectPort: 5858, bundler: 'packager' },
  };
});

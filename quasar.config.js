import { configure } from 'quasar/wrappers'

module.exports = configure(function (ctx) {
  return {
    boot: ['axios', 'i18n', 'components'],
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
      config: {
        dark: 'auto',
        loadingBar: { color: '#F97316', size: '2px', position: 'top' },
        notify:     { position: 'bottom-right', timeout: 2500 },
      },
      plugins: ['Notify', 'Dialog', 'Loading', 'LoadingBar', 'LocalStorage', 'Cookies'],
    },
    animations: [],
    ssr: { pwa: false },
    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      manifest: {
        name: 'DevSpace',
        short_name: 'DevSpace',
        description: 'Tu workspace técnico personal',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0B0B0D',
        theme_color: '#F97316',
        icons: [
          { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      extendGenerateSWOptions (cfg) {
        cfg.skipWaiting = true
        cfg.clientsClaim = true
        cfg.runtimeCaching = [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts' },
          },
        ]
      },
    },
    cordova: {},
    capacitor: { hideSplashscreen: true },
    electron: { inspectPort: 5858, bundler: 'packager' },
  };
});

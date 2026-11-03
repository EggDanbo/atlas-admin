import type { App } from 'vue'

import VueVideoPlayer from '@videojs-player/vue'

import 'video.js/dist/video-js.css'

export function setupVideoPlayer(app: App<Element>) {
  app.use(VueVideoPlayer)
}

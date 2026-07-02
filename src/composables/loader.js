import { ref } from 'vue'

export const loaderVisible = ref(false)

let _count = 0
let _start = 0
const MIN_MS = 400

export function loaderShow() {
  if (_count === 0) {
    loaderVisible.value = true
    _start = Date.now()
  }
  _count++
}

export function loaderHide() {
  _count = Math.max(0, _count - 1)
  if (_count === 0) {
    const wait = Math.max(0, MIN_MS - (Date.now() - _start))
    if (wait > 0) setTimeout(() => { loaderVisible.value = false }, wait)
    else loaderVisible.value = false
  }
}

// 节流
export default function throttle (fn, time) {
  let timer = null
  return function () {
    let content = this
    let args = arguments
    if (!timer) {
      timer = setTimeout(() => {
        timer = null
        fn.apply(content, args)
      }, time)
    }
  }
}

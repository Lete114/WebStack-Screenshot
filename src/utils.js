function isBoolean(value) {
  return value === 'true' || value === true ? true : false
}

module.exports = {
  goto(data) {
    const options = {}

    // 是否以http协议开头
    data.url = /^https?:\/\//.test(data.url) ? data.url : 'http://' + data.url

    // 超时，默认30s
    if (!isNaN(data.timeout)) options.timeout = Math.abs(data.timeout) ?? 30000

    // 什么模式下截图
    if (data.waitUntil) {
      const opt = {
        load: 'load', // 在 load 事件触发时完成
        domcontentloaded: 'domcontentloaded', // 在 DOMContentLoaded 事件触发时完成
        networkidle0: 'networkidle0', // 500ms 内没有任何网站请求时
        networkidle2: 'networkidle2' // 500ms 内只有2个请求时
      }
      options.waitUntil = opt[data.waitUntil] || opt.load
    }

    return options
  },
  screenshot(data) {
    const options = { fullPage: true }

    // 图片质量 `1-100` 对 `png` 类型无效
    if (!isNaN(data.quality)) options.quality = Math.abs(data.quality)

    // 图片类型
    const typeOpt = {
      png: 'png',
      jpeg: 'jpeg',
      webp: 'webp'
    }

    options.type = typeOpt[data.type] || typeOpt.png

    // 图片编码
    if (data.encoding) {
      const opt = {
        base64: 'base64',
        binary: 'binary'
      }
      options.encoding = opt[data.encoding] || opt.binary
    }

    // 截取完整页面
    if (data.fullPage) options.fullPage = isBoolean(data.fullPage)

    return options
  },
  isBoolean
}

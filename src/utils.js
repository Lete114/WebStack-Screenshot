const { join } = require('path')
const chromium = require('chrome-aws-lambda')
const { PUPPETEER_EXECUTABLE_PATH, PUPPETEER_SERVER } = process.env

function isBoolean(value) {
  return value === 'true' || value === true ? true : false
}

function isNumber(value) {
  return !isNaN(value)
}

function isHttp(url) {
  return /^https?:\/\//.test(url)
}

function clip(data) {
  if (!data.clip) return
  const clip = data.clip.split(',')
  const opt = {
    x: clip[0],
    y: clip[1],
    width: clip[2],
    height: clip[3]
  }
  for (const key in opt) {
    const temp = parseInt(opt[key])
    const isNumber = /^-?\d+$/.test(temp)
    if (!isNumber) return
    opt[key] = temp
  }
  return opt
}

module.exports = {
  async launch(fontUrl) {
    // 设置字体: 文泉驿宽微米黑
    const fontPath = join(__dirname, '../font/WenQuanDengKuanWeiMiHei-1.ttf')

    // 判断是否是url字体
    const font = isHttp(fontUrl) ? fontUrl : fontPath

    // 使用字体
    await chromium.font(font)

    // local (Server) 配置
    const localOptions = {}
    if (PUPPETEER_EXECUTABLE_PATH) {
      localOptions.executablePath = PUPPETEER_EXECUTABLE_PATH
    }
    // lambda (ServerLess) 配置
    const lambdaOptions = {
      args: chromium.args,
      headless: chromium.headless
    }
    if (!PUPPETEER_SERVER) {
      lambdaOptions.executablePath = await chromium.executablePath
    }

    // 判断是服务器(Server)还是无服务器(ServerLess)
    return PUPPETEER_SERVER ? localOptions : lambdaOptions
  },
  goto(data) {
    const options = {}

    // 是否以http协议开头
    data.url = isHttp(data.url) ? data.url : 'http://' + data.url

    // 超时，默认30s
    // if (isNumber(data.timeout)) {
    //   options.timeout = Math.abs(data.timeout) ?? 30000
    // }
    // 源码如上，为了适配低于v12.x的nodejs版本，改为如下写法
    if (isNumber(data.timeout)) {
      const timeout = Math.abs(data.timeout)
      options.timeout = timeout !== null && timeout !== void 0 ? timeout : 30000
    }

    // 页面渲染完成后等待(毫秒)
    if (isNumber(data.await)) options.await = Math.abs(data.await) || 0

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
    const options = { fullPage: false }

    // 图片质量 `1-100` 对 `png` 类型无效
    if (isNumber(data.quality)) options.quality = Math.abs(data.quality)

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

    // 截取指定坐标以及宽高
    const clipOpt = clip(data)
    if (clipOpt) options.clip = clipOpt

    return options
  },
  cache(cache) {
    if (cache === 'false') return
    const sec = Math.abs(cache)
    const daySec = 86400
    const cacheKey = 'public, no-transform, s-maxage=$, max-age=$'
    if (cache === void 0 || isNumber(sec)) {
      return cacheKey.replace(/\$/g, sec || daySec)
    }
  },
  isBoolean,
  isNumber
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { join } from 'path'
import { existsSync } from 'fs'
import chromium from 'chrome-aws-lambda'
import { PuppeteerLifeCycleEvent, ScreenshotClip, ScreenshotOptions } from 'puppeteer'

export function isBoolean(value: string | boolean) {
  return value === 'true' || value === true ? true : false
}

export function isNumber(value: number) {
  return !isNaN(value)
}

export function isHttp(url: string) {
  return /^https?:\/\//.test(url)
}

export function deepClone(data: any): { [key: string]: any } {
  try {
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    return {}
  }
}

export function clip(data: { [key: string]: string }) {
  if (!data.clip) return
  const clip = data.clip.split(',')
  const opt: ScreenshotClip = {
    x: parseInt(clip[0]),
    y: parseInt(clip[1]),
    width: parseInt(clip[2]),
    height: parseInt(clip[3])
  }
  return opt
}

export async function launch(fontUrl: any) {
  // 设置字体: 文泉驿宽微米黑
  let fontPath = join(__dirname, '../font/WenQuanDengKuanWeiMiHei-1.ttf')
  fontPath = existsSync(fontPath) ? fontPath : join(__dirname, '../../font/WenQuanDengKuanWeiMiHei-1.ttf')

  // 判断是否是url字体
  const font = isHttp(fontUrl) ? fontUrl : fontPath

  // 使用字体
  await chromium.font(font)

  // local (Server) 配置
  const localOptions: { executablePath?: string } = {}
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    localOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
  }

  // lambda (ServerLess) 配置
  const lambdaOptions: {
    args: string[]
    headless: boolean
    executablePath?: string
  } = {
    args: chromium.args,
    headless: chromium.headless
  }
  if (!process.env.PUPPETEER_SERVER) {
    lambdaOptions.executablePath = await chromium.executablePath
  }
  // 判断是服务器(Server)还是无服务器(ServerLess)
  return process.env.PUPPETEER_SERVER ? localOptions : lambdaOptions
}

export function goto(data: { [x: string]: any; timeout?: any; await?: any; waitUntil?: any }) {
  const options: { timeout?: number; await?: number; waitUntil?: PuppeteerLifeCycleEvent } = {}

  // 超时，默认30s
  // if (isNumber(data.timeout)) {
  //   options.timeout = Math.abs(data.timeout) ?? 30000
  // }
  // 源码如上，为了适配低于v12.x的nodejs版本，改为如下写法
  if (isNumber(data.timeout)) {
    const timeout = Math.abs(data.timeout)
    // eslint-disable-next-line eqeqeq
    options.timeout = timeout == void 0 ? 30000 : timeout
  }

  // 页面渲染完成后等待(毫秒)
  if (isNumber(data.await)) options.await = Math.abs(data.await) || 0

  // 什么模式下截图
  const waitUntils = [
    'load', // 在 load 事件触发时完成
    'domcontentloaded', // 在 DOMContentLoaded 事件触发时完成
    'networkidle0', // 500ms 内没有任何网站请求时
    'networkidle2' // 500ms 内只有2个请求时
  ]
  options.waitUntil = waitUntils.includes(data.waitUntil) ? data.waitUntil : waitUntils[0]

  return options
}

export function screenshot(data: { [key: string]: any }) {
  const options: ScreenshotOptions = {}

  // 图片质量 `1-100` 对 `png` 类型无效
  if (isNumber(data.quality)) options.quality = Math.abs(data.quality)

  // 图片类型
  const types = ['png', 'jpeg', 'webp']
  options.type = types.includes(data.type) ? data.type : types[0]

  // 图片编码
  const encodings = ['binary', 'base64']

  options.encoding = encodings.includes(data.encoding) ? data.encoding : encodings[0]

  // 截取完整页面
  options.fullPage = isBoolean(data.fullPage)

  // 截取指定坐标以及宽高
  const clipOpt = clip(data)
  if (clipOpt) options.clip = clipOpt

  return options
}

export function cache(cache: number | boolean) {
  // 不适用 http 强制缓存
  if ((cache as unknown as string) === 'false') return

  const sec = Math.abs(cache as number)
  const daySec = 86400
  const cacheKey = 'public, no-transform, s-maxage=$, max-age=$'

  // eslint-disable-next-line eqeqeq
  if (cache == void 0) return cacheKey.replace(/\$/g, daySec as unknown as string)

  if (isNumber(sec)) return cacheKey.replace(/\$/g, sec as unknown as string)
}

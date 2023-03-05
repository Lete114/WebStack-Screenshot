/* eslint-disable @typescript-eslint/no-explicit-any */
import { tmpdir } from 'os'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import http from 'http'
import https from 'https'
import chromium from 'chrome-aws-lambda'
import { Page, PuppeteerLifeCycleEvent, ScreenshotClip, ScreenshotOptions } from 'puppeteer'
import { TlaunchOptions } from './types'

const TMP_DIR_PATH = join(tmpdir(), 'WebStack-Screenshot')
if (!existsSync(TMP_DIR_PATH)) mkdirSync(TMP_DIR_PATH, { recursive: true })

export function isBoolean(value: string | boolean) {
  return value === 'true' || value === true ? true : false
}

export function isNumber(value: number) {
  return !isNaN(value)
}

export function isHttp(url: string) {
  return /^https?:\/\//.test(url)
}

export const isValidKey = (key: string, object: object): key is keyof typeof object => key in object

export function deepClone(data: any): { [key: string]: any } {
  try {
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    return {}
  }
}

/**
 * request
 * @param {string} url
 */
export function request(url: string) {
  const protocol = url.startsWith('https') ? https : http

  return new Promise<Buffer>((resolve, reject) => {
    const req = protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${res.statusMessage}`))
        return
      }
      const data: any[] = []
      res.on('data', (chunk) => {
        data.push(chunk)
      })

      res.on('end', () => {
        const buffer = Buffer.concat(data)
        resolve(buffer)
      })
    })
    req.on('error', (error) => {
      reject(error)
    })

    req.end()
  })
}

/**
 * download file
 * @param {string} url
 * @param {string} filePath
 */
export async function download(url: string, filePath: string) {
  const buffer = await request(url)
  writeFileSync(filePath, buffer)
  return buffer
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

export async function launch() {
  const options: TlaunchOptions = {
    args: chromium.args,
    defaultViewport: chromium.defaultViewport
  }

  // lambda (ServerLess) 配置
  const lambdaOptions = options
  if (!process.env.PUPPETEER_SERVER) {
    process.env.FUNCTION_NAME = process.env.FUNCTION_NAME ? process.env.FUNCTION_NAME : 'Screenshot'
    lambdaOptions.headless = chromium.headless
    lambdaOptions.executablePath = await chromium.executablePath
    return lambdaOptions
  }

  // local (Server) 配置
  const localOptions: TlaunchOptions = options
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    localOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
  }

  return localOptions
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

export async function getFont(url: string, fontName: string) {
  const fontPath = join(TMP_DIR_PATH, fontName)
  if (existsSync(fontPath)) {
    return readFileSync(fontPath, { encoding: 'base64' })
  }
  const buffer = await download(url, fontPath)
  return buffer.toString('base64')
}

export async function setFont(page: Page, fontUrl: string) {
  if (!isHttp(fontUrl)) return
  const MIME_TYPES = {
    ttf: 'font/ttf',
    woff: 'font/woff',
    woff2: 'font/woff2',
    otf: 'font/otf'
  }

  const { pathname } = new URL(fontUrl)
  const fontName = pathname.split('/').at(-1) || ''
  const [, ext] = fontName.split('.')

  const mimeType = isValidKey(ext, MIME_TYPES) && MIME_TYPES[ext]
  const base64 = await getFont(fontUrl, fontName)
  const style = `
    @font-face {
      font-family: 'WebStack-Screenshot';
      src: url(data:${mimeType};base64,${base64});
      font-weight: normal;
      font-style: normal;
    }

    body {
      font-family: 'WebStack-Screenshot', sans-serif;
    }
  `
  if (mimeType) await page.addStyleTag({ content: style })
}

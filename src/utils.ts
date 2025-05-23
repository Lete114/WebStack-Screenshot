import type { ScreenshotClip, ScreenshotOptions, Viewport } from 'puppeteer-core'
import type { IOptions, TLaunchOptions } from './types'
import process from 'node:process'
import puppeteer from 'puppeteer'

const { WEBSTACK_SCREENSHOT_PUPPETEER_EXECUTABLE_PATH }
  = process.env

export function isBoolean(value: string | boolean): boolean {
  return !!(value === 'true' || value === true)
}

export function isNumber(value: number): boolean {
  return !Number.isNaN(value)
}

export function isHttp(url: string): boolean {
  return /^https?:\/\//.test(url)
}

export function isString(value: any): boolean {
  return typeof value === 'string'
}

export function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null
}
export const isValidKey = (key: string, object: object): key is keyof typeof object => key in object

export function deepClone(data: any): { [key: string]: any } {
  try {
    return JSON.parse(JSON.stringify(data))
  }
  catch (error) {
    console.error(`clone failure: ${error}`)
    return {}
  }
}

export function parseClip(clip: string): ScreenshotClip {
  const [x = '0', y = '0', width = '0', height = '0'] = clip.split(',').map(part => part.trim())

  return {
    x: Number.parseInt(x),
    y: Number.parseInt(y),
    width: Number.parseInt(width),
    height: Number.parseInt(height),
  }
}

export function getLaunch(options: TLaunchOptions = {}): TLaunchOptions {
  const opts: TLaunchOptions = {
    // args,
    ...options,
    // headless: 'shell'
    executablePath: puppeteer.executablePath(),
  }

  if (WEBSTACK_SCREENSHOT_PUPPETEER_EXECUTABLE_PATH) {
    opts.executablePath = WEBSTACK_SCREENSHOT_PUPPETEER_EXECUTABLE_PATH
  }

  return opts
}

export type GotoType = Pick<IOptions, 'await' | 'waitUntil' | 'timeout'>

export function goto(data: GotoType): GotoType {
  const options: GotoType = {
    timeout: data.timeout ?? 30000,
    await: data.await || 0,
    waitUntil: data.waitUntil ?? 'load',
  }

  return options
}

export function getScreenshotOptions(data: IOptions): ScreenshotOptions {
  const { quality = 80, type = 'jpeg', encoding = 'binary', fullPage = false, clip } = data
  const options: ScreenshotOptions = {}

  // Image quality between 0-100, ignored if the image type is png
  options.quality = quality
  options.type = type

  options.encoding = encoding

  // Screenshot of the full page
  options.fullPage = fullPage

  // Intercepts the specified coordinates and width and height
  if (clip) {
    options.clip = parseClip(clip)
  }
  return options
}

export function cache(cache: number | boolean | undefined): string | undefined {
  // Do not use http forced caching
  // catch is false or cache is zero
  if (cache === false || cache === 0) {
    return undefined
  }

  const sec = Math.abs(cache as number)
  const daySec = 86400
  const cacheKey = 'public, no-transform, s-maxage=$, max-age=$'

  if (!cache) {
    return cacheKey.replace(/\$/g, daySec.toString())
  }

  if (isNumber(sec)) {
    return cacheKey.replace(/\$/g, sec.toString())
  }

  return undefined
}

export function parseViewportString(viewportString: string): Viewport | null {
  const [widthStr, heightStr] = viewportString.split('x').map(str => str.trim())
  const width = Number.parseInt(widthStr)
  const height = Number.parseInt(heightStr || widthStr)

  return Number.isNaN(width) && Number.isNaN(height) ? null : { width, height }
}

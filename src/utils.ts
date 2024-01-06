/* eslint-disable @typescript-eslint/no-explicit-any */
import { tmpdir } from 'os'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import type { PuppeteerLifeCycleEvent, ScreenshotClip, ScreenshotOptions } from 'puppeteer-core'
import { args } from './args'
import { TlaunchOptions, TtypeOptions } from './types'

const { WEBSTACK_SCREENSHOT_SERVERLESS, WEBSTACK_SCREENSHOT_FONTS, WEBSTACK_SCREENSHOT_PUPPETEER_EXECUTABLE_PATH } =
  process.env

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

export function parseClip(clip: string): ScreenshotClip {
  const [x = '0', y = '0', width = '0', height = '0'] = clip.split(',').map((part) => part.trim())

  return {
    x: parseInt(x),
    y: parseInt(y),
    width: parseInt(width),
    height: parseInt(height)
  }
}

export async function launch() {
  const options: TlaunchOptions = {
    args,
    defaultViewport: {
      height: 1080,
      width: 1920
    }
  }

  // lambda (ServerLess)
  const lambdaOptions = options
  if (WEBSTACK_SCREENSHOT_SERVERLESS) {
    const chromium = (await import('@sparticuz/chromium')).default
    // install font
    if (WEBSTACK_SCREENSHOT_FONTS) {
      const fonts = (WEBSTACK_SCREENSHOT_FONTS || '').split(',').filter(Boolean)
      await Promise.all(fonts.map((font) => chromium.font(font)))
    }
    lambdaOptions.executablePath = await chromium.executablePath()
    return lambdaOptions
  }

  // local (Server)
  const localOptions = options
  const { executablePath } = (await import('puppeteer'))
  localOptions.executablePath = executablePath()
  if (WEBSTACK_SCREENSHOT_PUPPETEER_EXECUTABLE_PATH) {
    localOptions.executablePath = WEBSTACK_SCREENSHOT_PUPPETEER_EXECUTABLE_PATH
  }

  return localOptions
}


export type GotoType = Pick<TtypeOptions, 'await' | 'waitUntil' | 'timeout'>;

export function goto(data: GotoType): GotoType {
  const options: GotoType = {
    timeout: data.timeout ?? 30000,
    await: data.await || 0,
    waitUntil: data.waitUntil ?? 'load'
  }

  return options
}

export function screenshot(data: TtypeOptions) {
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


export function cache(cache: number | boolean): string | undefined {
  // Do not use http forced caching
  // catch is false or cache is zero
  if (cache === false || cache === 0) return undefined

  const sec = Math.abs(cache as number)
  const daySec = 86400
  const cacheKey = 'public, no-transform, s-maxage=$, max-age=$'

  if (!cache) return cacheKey.replace(/\$/g, daySec.toString())

  if (isNumber(sec)) return cacheKey.replace(/\$/g, sec.toString())

  return undefined
}

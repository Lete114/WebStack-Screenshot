import type { TLaunchOptions } from './types'
import process from 'node:process'
import sparticuzPuppeteer from '@sparticuz/chromium'
import puppeteer from 'puppeteer'

const { WEBSTACK_SCREENSHOT_PUPPETEER_EXECUTABLE_PATH, WEBSTACK_SCREENSHOT_IS_AWS_LAMBDA, WEBSTACK_SCREENSHOT_FONTS }
  = process.env

export function isNumber(value: number): boolean {
  return !Number.isNaN(value)
}

export function isHttp(url: string): boolean {
  return /^https?:\/\//.test(url)
}

export async function getLaunch(options: TLaunchOptions = {}): Promise<TLaunchOptions> {
  const opts: TLaunchOptions = {
    ...options,
    headless: 'shell',
    executablePath: puppeteer.executablePath(),
  }

  // If running in AWS Lambda, use Sparticuz Puppeteer
  if (WEBSTACK_SCREENSHOT_IS_AWS_LAMBDA) {
    if (WEBSTACK_SCREENSHOT_FONTS) {
      const fonts = WEBSTACK_SCREENSHOT_FONTS.split(',').filter(Boolean).map(font => sparticuzPuppeteer.font(font))
      await Promise.all(fonts)
    }
    opts.args = sparticuzPuppeteer.args
    opts.executablePath = await sparticuzPuppeteer.executablePath()
  }

  if (WEBSTACK_SCREENSHOT_PUPPETEER_EXECUTABLE_PATH) {
    opts.executablePath = WEBSTACK_SCREENSHOT_PUPPETEER_EXECUTABLE_PATH
  }

  return opts
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

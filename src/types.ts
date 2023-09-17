import { PuppeteerLaunchOptions,PuppeteerLifeCycleEvent, ScreenshotClip } from 'puppeteer-core'

export type TtypeOptions = {
  url: string
  type: 'png' | 'jpeg' | 'webp'
  cache: number | boolean
  quality: number
  viewport: string
  fullPage: boolean
  isMobile: boolean
  await: number
  timeout: number
  encoding: 'binary' | 'base64'
  clip: ScreenshotClip
  font: string
  waitUntil: PuppeteerLifeCycleEvent
}

export type TlaunchOptions = PuppeteerLaunchOptions

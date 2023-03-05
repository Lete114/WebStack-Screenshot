import { PuppeteerLifeCycleEvent, ScreenshotClip, Viewport } from 'puppeteer'

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

export type TlaunchOptions = {
  args?: string[]
  headless?: boolean
  executablePath?: string
  defaultViewport?: Viewport
}

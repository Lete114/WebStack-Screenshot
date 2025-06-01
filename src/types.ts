import type { LaunchOptions, PuppeteerLifeCycleEvent, ScreenshotClip, ScreenshotOptions, Viewport } from 'puppeteer-core'

export interface IOptions {
  url: string
  type?: 'png' | 'jpeg' | 'webp'
  cache?: number | boolean
  quality?: number
  size?: string
  viewport?: Viewport
  fullPage?: boolean
  isMobile?: boolean
  await?: number
  timeout?: number
  encoding?: ScreenshotOptions['encoding']
  clip?: string | ScreenshotClip
  waitUntil?: PuppeteerLifeCycleEvent
}

export type TLaunchOptions = LaunchOptions

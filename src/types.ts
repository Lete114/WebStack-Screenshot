import { PuppeteerLaunchOptions, PuppeteerLifeCycleEvent, type Viewport } from 'puppeteer-core'

export type TtypeOptions = {
  url: string
  type?: 'png' | 'jpeg' | 'webp'
  cache?: number | boolean
  quality?: number
  viewport?: string | Viewport
  fullPage?: boolean
  isMobile?: boolean
  await?: number
  timeout?: number
  encoding?: 'binary' | 'base64'
  clip?: string
  waitUntil?: PuppeteerLifeCycleEvent
}

export type TlaunchOptions = PuppeteerLaunchOptions

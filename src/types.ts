import type { LaunchOptions, PuppeteerLifeCycleEvent, Viewport } from 'puppeteer-core'

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
  encoding?: 'binary' | 'base64'
  clip?: string
  waitUntil?: PuppeteerLifeCycleEvent
}

export type TLaunchOptions = LaunchOptions

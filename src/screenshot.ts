import type { Page, ScreenshotClip, ScreenshotOptions, Viewport } from 'puppeteer-core'
import type { IOptions } from './types'
import { DEFAULT_VIEWPORT } from './constant'

export type * from 'puppeteer-core'

export class Screenshot {
  private static instance: Screenshot

  private constructor() {
    // eslint-disable-next-line no-console
    console.log('Browser singleton instance created')
  }

  public static getInstance(): Screenshot {
    if (!Screenshot.instance) {
      Screenshot.instance = new Screenshot()
    }
    return Screenshot.instance
  }

  public async getScreenshot(page: Page, options: IOptions): Promise<Uint8Array | string> {
    await this.setViewport(page, options)

    // open a website
    await page.goto(options.url, {
      timeout: options.timeout ?? 30000,
      waitUntil: options.waitUntil ?? 'load',
    })

    const opts = this.parse(options)

    const buffer = await page.screenshot(opts)
    return buffer
  }

  public async setViewport(page: Page, options: IOptions): Promise<void> {
    const viewport = { ...DEFAULT_VIEWPORT, ...options.viewport, isMobile: options.isMobile ?? false }
    if (typeof options.viewport === 'string') {
      const v = this.parseViewport(options.viewport)
      Object.assign(viewport, v)
    }

    await page.setViewport(viewport as Viewport)
  }

  public parse(options: IOptions): ScreenshotOptions {
    const { quality = 80, type = 'jpeg', encoding = 'binary', fullPage = false, clip } = options
    const opts: ScreenshotOptions = {
      // Image quality between 0-100, ignored if the image type is png
      type,
      quality,
      // Screenshot of the full page
      fullPage,

      encoding,
    }

    // Intercepts the specified coordinates and width and height
    if (typeof clip === 'string') {
      opts.clip = this.parseClip(clip)
    }
    if (typeof clip === 'object') {
      opts.clip = clip
    }

    return opts
  }

  /// --- utils

  public parseViewport(viewportString: string): Viewport | undefined {
    const [width, height] = viewportString.split('x').map(str => +str.trim())
    if (width && height) {
      return { width, height }
    }
  }

  public parseClip(clip: string): ScreenshotClip | undefined {
    const [x, y, width, height] = clip.split(',').map(part => +part.trim())
    if (x && y && width && height) {
      return { x, y, width, height }
    }
  }
}

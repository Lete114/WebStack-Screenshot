import type { Browser, Page, Viewport } from 'puppeteer-core'
import type { IOptions } from './types'
import { Buffer } from 'node:buffer'
import puppeteer from 'puppeteer-core'
import { DEFAULT_VIEWPORT } from './constant'
import { getLaunch, getScreenshotOptions, isHttp, isString } from './utils'

let browser: Browser | null, page: Page | null

export async function getScreenshot(data: IOptions): Promise<Buffer> {
  try {
    const { viewport, size, isMobile = false } = data

    // Whether or not it starts with the http protocol
    data.url = isHttp(data.url) ? data.url : `http://${data.url}`

    if (!browser) {
      const launchOpt = getLaunch({ defaultViewport: DEFAULT_VIEWPORT })
      browser = await puppeteer.launch(launchOpt)
    }

    // Creating a new tab
    page = await browser.newPage()

    // Setting the page size
    let isViewPort = false
    const viewportOptions: Viewport = { width: 0, height: 0, isMobile, ...viewport }
    if (viewport && Object.keys(viewport).length) {
      isViewPort = true
    }
    if (size && isString(size)) {
      isViewPort = true
      const [w, h] = size?.split('x')
      const width = +w
      const height = +h
      viewportOptions.width = width
      viewportOptions.height = height
    }
    if (isViewPort) {
      await page.setViewport(viewportOptions)
    }

    // open a website
    await page.goto(data.url, {
      timeout: data.timeout ?? 30000,
      waitUntil: data.waitUntil ?? 'load',
    })

    const screenshotOptions = getScreenshotOptions(data)

    // Wait after page rendering is complete (milliseconds)
    await new Promise(r => setTimeout(r, (data.await || 0) + 1000))
    return await page.screenshot(screenshotOptions) as Buffer
  }
  catch (error) {
    console.error(error)
    if (browser) {
      browser.close()
      browser = null
    }
  }
  finally {
    if (page) {
      await page.close()
      page = null
    }
  }
  return Buffer.from('')
}

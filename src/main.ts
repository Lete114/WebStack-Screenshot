import type { Browser, Page } from 'puppeteer-core'
import type { IOptions } from './types'
import { Buffer } from 'node:buffer'
import puppeteer from 'puppeteer-core'
import { Screenshot } from './screenshot'
import { getLaunch, isHttp } from './utils'

let browser: Browser | null, page: Page | null

export async function getScreenshot(data: IOptions): Promise<Uint8Array | string> {
  try {
    // Whether or not it starts with the http protocol
    data.url = isHttp(data.url) ? data.url : `http://${data.url}`

    if (!browser) {
      const launchOpt = await getLaunch({ })
      browser = await puppeteer.launch(launchOpt)
    }

    const screenshot = Screenshot.getInstance()

    // Creating a new tab
    page = await browser.newPage()
    const buffer = await screenshot.getScreenshot(page, data)

    // Wait after page rendering is complete (milliseconds)
    await new Promise(r => setTimeout(r, (data.await || 0) + 1000))
    return buffer
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

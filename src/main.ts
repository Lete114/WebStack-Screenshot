import type { Browser, Page, PuppeteerLifeCycleEvent, Viewport } from 'puppeteer-core'
import puppeteer from 'puppeteer-core'
import { TtypeOptions } from './types'
import { isHttp, launch, goto, screenshot, isBoolean } from './utils'
export { TtypeOptions } from './types'

let browser: Browser | null, page: Page | null
// eslint-disable-next-line max-statements, @typescript-eslint/no-explicit-any
export default async (data: TtypeOptions): Promise<string | Buffer> =>{
  try {
    // Whether or not it starts with the http protocol
    data.url = isHttp(data.url) ? data.url : 'http://' + data.url

    const launchOpt = await launch()
    if (!browser) browser = await puppeteer.launch(launchOpt)

    // Creating a new tab
    page = await browser.newPage()

    // Setting the screenshot aspect ratio
    if (data.viewport) {
      const [widthStr, heightStr] = data.viewport.split('x').map((str) => str.trim())
      const width = parseInt(widthStr)
      const height = parseInt(heightStr || widthStr) // Use width as height if height is not provided
      if (!isNaN(width) && !isNaN(height)) {
        const viewport: Viewport = {
          width,
          height,
          isMobile: isBoolean(data.isMobile)
        }

        await page.setViewport(viewport) // Setting the page size
      }
    }


    // open a website
    const gotoOpt = goto(data)
    await page.goto(
      data.url,
      gotoOpt
    )

    const screenshotOpt = screenshot(data)
    // Wait after page rendering is complete (milliseconds)
    await new Promise((r) => setTimeout(r, (gotoOpt.await || 0) + 1000))
    return (await page.screenshot(screenshotOpt)) as Buffer | string
  } catch (error) {
    // eslint-disable-next-line
    console.error(error)
    if (browser) {
      browser.close()
      browser = null
    }
  } finally {
    if (page) {
      await page.close()
      page = null
    }
  }
  return ''
}


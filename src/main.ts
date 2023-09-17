import type { Browser, Page, PuppeteerLifeCycleEvent, Viewport } from 'puppeteer-core'
import puppeteer from 'puppeteer-core'
import { TtypeOptions } from './types'
import { isHttp, launch, goto, screenshot, isBoolean } from './utils'

let browser: Browser | null, page: Page | null
// eslint-disable-next-line max-statements, @typescript-eslint/no-explicit-any
export = async function (data: TtypeOptions): Promise<string | Buffer> {
  try {
    // Whether or not it starts with the http protocol
    data.url = isHttp(data.url) ? data.url : 'http://' + data.url

    const launchOpt = await launch()
    if (!browser) browser = await puppeteer.launch(launchOpt)

    // Creating a new tab
    page = await browser.newPage()

    // Setting the screenshot aspect ratio
    if (data.viewport) {
      const viewport = data.viewport.split('x')
      if (viewport.length === 1) viewport.push(viewport[0])
      data.viewport = {
        width: parseInt(viewport[0]),
        height: parseInt(viewport[1]),
        isMobile: isBoolean(data.isMobile)
      } as unknown as string
      await page.setViewport(data.viewport as unknown as Viewport) // Setting the page size
    }

    // open a website
    const gotoOpt = goto(data)
    await page.goto(
      data.url,
      gotoOpt as {
        timeout: number
        waitUntil: PuppeteerLifeCycleEvent
      }
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

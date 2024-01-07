import type { Browser, Page, Viewport } from 'puppeteer-core'
import puppeteer from 'puppeteer-core'
import { TtypeOptions } from './types'
import { isHttp, launch, goto, screenshot, isString, isObject, parseViewportString } from './utils'
export { TtypeOptions } from './types'

let browser: Browser | null, page: Page | null

const DEFAULT_VIEWPORT = {
  width: 1920,
  height: 1080
}

// eslint-disable-next-line max-statements, @typescript-eslint/no-explicit-any
export default async (data: TtypeOptions): Promise<string | Buffer> => {
  try {
    const { viewport, isMobile = false } = data
    // Whether or not it starts with the http protocol
    data.url = isHttp(data.url) ? data.url : `http://${data.url}`

    const launchOpt = await launch()
    if (!browser) browser = await puppeteer.launch(launchOpt)

    // Creating a new tab
    page = await browser.newPage()

    // Setting the screenshot aspect ratio
    if (isString(viewport)) {
      const parsedViewport = parseViewportString(viewport as string)
      // parse failed, when using default values
      if (parsedViewport) {
        await page.setViewport({ ...parsedViewport, isMobile }) // Setting the page size
      } else {
        // eslint-disable-next-line max-len, no-console
        console.warn(`viewport parameter parsing exception, please check whether it is passed in accordance with "width x height" rules, or using viewport object ${viewport}`)
        await page.setViewport({ ...DEFAULT_VIEWPORT, isMobile })
      }
    } else if (isObject(viewport)) {
      // is viewport type
      const modifiedViewport: Viewport = {
        ...(viewport as Viewport),
        isMobile // override isMobile property
      }
      await page.setViewport(modifiedViewport)
    } else {
      // No viewport passed in
      await page.setViewport({ ...DEFAULT_VIEWPORT, isMobile }) // Setting the page size
    }


    // open a website
    const gotoOpt = goto(data)
    await page.goto(data.url, gotoOpt)

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


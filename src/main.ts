import puppeteer, { Browser, Page, PuppeteerLifeCycleEvent, ScreenshotClip, Viewport } from 'puppeteer'
import { isHttp, launch, goto, screenshot, isBoolean } from './utils'

type typeOptions = {
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

let browser: Browser | null, page: Page | null
// eslint-disable-next-line max-statements, @typescript-eslint/no-explicit-any
export = async function (data: typeOptions): Promise<string | Buffer> {
  try {
    // 是否以 http 协议开头
    data.url = isHttp(data.url) ? data.url : 'http://' + data.url

    // 判断是服务器(Server)还是无服务器(ServerLess)，决定使用Chromium
    const launchOpt = await launch(data.font)
    if (!browser) browser = await puppeteer.launch(launchOpt)

    // 创建新的标签页
    page = await browser.newPage()

    // 设置截图宽高比
    if (data.viewport) {
      const viewport = data.viewport.split('x')
      if (viewport.length === 1) viewport.push(viewport[0])
      data.viewport = {
        width: parseInt(viewport[0]),
        height: parseInt(viewport[1]),
        isMobile: isBoolean(data.isMobile)
      } as unknown as string
      await page.setViewport(data.viewport as unknown as Viewport) // 设置页面大小
    }

    // 打开网站
    const gotoOpt = goto(data) // 打开网站选项
    await page.goto(
      data.url,
      gotoOpt as {
        timeout: number
        waitUntil: PuppeteerLifeCycleEvent
      }
    )

    // 页面渲染完成后等待(毫秒)
    await new Promise((r) => setTimeout(r, gotoOpt.await as number))

    // 截图
    const screenshotOpt = screenshot(data) // 截图选项
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

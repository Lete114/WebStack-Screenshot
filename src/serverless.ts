import bodyData from 'body-data'
import { IncomingMessage, ServerResponse } from 'http'
import { PuppeteerLifeCycleEvent, ScreenshotClip } from 'puppeteer'
import main from './main'
import { cache, screenshot } from './utils'

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

/*eslint-disable max-statements */
export = async (req: IncomingMessage, res: ServerResponse) => {
  // eslint-disable-next-line no-console
  console.log('NODE.js', process.version)
  // 允许所有域
  res.setHeader('Access-Control-Allow-Origin', '*')
  // 返回json数据
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  try {
    if (req.url === '/favicon.ico') return res.end()
    const data: typeOptions = (await bodyData(req)) as typeOptions

    const projectUrl = 'https://github.com/Lete114/WebStack-Screenshot#%E5%B1%9E%E6%80%A7'
    if (!data.url) {
      const msg = { msg: 'URL not detected , Using parameters: ' + projectUrl }
      return res.end(JSON.stringify(msg))
    }

    const screenshotOpt = screenshot(data) // 截图选项
    const content = await main(data)

    // 强制HTTP缓存
    const cacheResult = cache(data.cache)
    if (cacheResult) res.setHeader('Cache-Control', cacheResult)

    // 响应base64的img标签
    if (screenshotOpt.encoding === 'base64') {
      const base64 = `data:image/${screenshotOpt.type};base64,${content}`
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ data: base64 }))
    } else {
      // 直接响应图片
      res.setHeader('Content-Type', 'image/' + screenshotOpt.type) // 响应图片类型
      res.write(content, screenshotOpt.encoding as BufferEncoding)
    }
    res.end()
  } catch (error) {
    // eslint-disable-next-line
    console.error(error)
    res.end(JSON.stringify({ msg: 'Screenshot failed' }))
  }
}
/* eslint-enable max-statements */

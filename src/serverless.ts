import type { IncomingMessage, ServerResponse } from 'node:http'
import type { IOptions } from './types'
import process from 'node:process'
import { bodyData } from 'body-data'
import { getScreenshot } from './main'
import { cache, getScreenshotOptions } from './utils'

export async function serverless(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('NODE.js', process.version)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  try {
    if (req.url === '/favicon.ico') {
      res.end()
      return
    }
    const { params, body } = (await bodyData(req)) as unknown as { params: IOptions, body: IOptions }

    const data = req.method?.toUpperCase() === 'POST' ? body : params

    if (!data.url) {
      const projectUrl = 'https://github.com/Lete114/WebStack-Screenshot#properties'
      const msg = { msg: `URL not detected , Using parameters: ${projectUrl}` }
      res.end(JSON.stringify(msg))
      return
    }

    const screenshotOptions = getScreenshotOptions(data)
    const content = await getScreenshot(data)

    const cacheResult = cache(data.cache)
    if (cacheResult) {
      res.setHeader('Cache-Control', cacheResult)
    }

    if (screenshotOptions.encoding === 'base64') {
      const base64 = `data:image/${screenshotOptions.type};base64,${content}`
      res.end(JSON.stringify({ data: base64 }))
    }
    else {
      res.setHeader('Content-Type', `image/${screenshotOptions.type}`)
      res.write(content, screenshotOptions.encoding as BufferEncoding)
    }
    res.end()
  }
  catch (error) {
    console.error(error)
    res.end(JSON.stringify({ msg: 'Screenshot failed' }))
  }
}

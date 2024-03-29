import bodyData from 'body-data'
import { IncomingMessage, ServerResponse } from 'http'
import main from './main'
import { cache, screenshot } from './utils'
import type { TtypeOptions } from './types'

/*eslint-disable max-statements */
export = async (req: IncomingMessage, res: ServerResponse) => {
  // eslint-disable-next-line no-console
  console.log('NODE.js', process.version)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  try {
    if (req.url === '/favicon.ico') return res.end()
    const data: TtypeOptions = (await bodyData(req)) as TtypeOptions

    const projectUrl = 'https://github.com/Lete114/WebStack-Screenshot#properties'
    if (!data.url) {
      const msg = { msg: 'URL not detected , Using parameters: ' + projectUrl }
      return res.end(JSON.stringify(msg))
    }

    const screenshotOpt = screenshot(data)
    const content = await main(data)

    const cacheResult = cache(data.cache)
    if (cacheResult) res.setHeader('Cache-Control', cacheResult)

    if (screenshotOpt.encoding === 'base64') {
      const base64 = `data:image/${screenshotOpt.type};base64,${content}`
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ data: base64 }))
    } else {
      res.setHeader('Content-Type', 'image/' + screenshotOpt.type)
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

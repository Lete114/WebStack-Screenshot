import type { IncomingMessage, ServerResponse } from 'node:http'
import type { IOptions } from './types'
import process from 'node:process'
import { bodyData } from 'body-data'
import { getScreenshot } from './main'
import { cache, isHttp } from './utils'

export async function serverless(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('NODE.js', process.version)
  if (req.url === '/favicon.ico') {
    res.end()
    return
  }
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  try {
    const { params, body } = (await bodyData(req)) as unknown as { params: IOptions, body: IOptions }

    const data = req.method?.toUpperCase() === 'POST' ? body : params

    if (!data.url) {
      const projectUrl = 'https://github.com/Lete114/WebStack-Screenshot#properties'
      const msg = { msg: `URL not detected , Using parameters: ${projectUrl}` }
      res.end(JSON.stringify(msg))
      return
    }

    if (!isHttp(data.url)) {
      const msg = { msg: 'URL must start with http:// or https://' }
      res.end(JSON.stringify(msg))
      return
    }

    const content = await getScreenshot(data)

    const cacheResult = cache(data.cache)
    if (cacheResult) {
      res.setHeader('Cache-Control', cacheResult)
    }

    if (data.encoding === 'base64') {
      const base64 = `data:image/${data.type};base64,${content}`
      res.end(JSON.stringify({ data: base64 }))
    }
    else {
      res.setHeader('Content-Type', `image/${data.type}`)
      res.write(content, data.encoding as BufferEncoding)
    }
    res.end()
  }
  catch (error) {
    console.error(error)
    res.end(JSON.stringify({ msg: 'Screenshot failed' }))
  }
}

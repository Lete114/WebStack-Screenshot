import http from 'node:http'
import process from 'node:process'
import { serverless } from './serverless'

const PORT = process.env.WEBSTACK_SCREENSHOT_PORT || process.env.PORT || 6870

export function startServer(port = PORT): void {
  const server = http.createServer(serverless)
  server.listen(port, () => {
  // eslint-disable-next-line no-console
    console.log(`Service is up and running port, http://127.0.0.1:${port}`)
  })
}

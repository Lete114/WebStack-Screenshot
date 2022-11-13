import http from 'http'
import serverless from './serverless'

process.env.PUPPETEER_SERVER = 'true'
const PORT = process.env.WEBSTACK_SCREENSHOT || process.env.PORT || 6870
const server = http.createServer(serverless)
server.listen(PORT, () => {
  // eslint-disable-next-line
  console.log('Service is up and running port, http://127.0.0.1:' + PORT)
})

import http from 'http'
import serverless from './serverless'

const PORT = process.env.WEBSTACK_SCREENSHOT_PORT || process.env.PORT || 6870
const server = http.createServer(serverless)
server.listen(PORT, () => {
  // eslint-disable-next-line
  console.log('Service is up and running port, http://127.0.0.1:' + PORT)
})

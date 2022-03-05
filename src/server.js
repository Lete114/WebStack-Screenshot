const http = require('http')
const main = require('./main')

async function init(PORT) {
  process.env.PUPPETEER_SERVER = true
  PORT = process.env.PORT || PORT || 6870
  const server = http.createServer(main)
  server.listen(PORT, () => {
    // eslint-disable-next-line
    console.log('Service is up and running port: ' + PORT)
  })
}

module.exports = init

const puppeteer = require('puppeteer')
const bodyData = require('body-data')
const { goto, screenshot, isBoolean } = require('./utils')

/*eslint-disable max-statements */
module.exports = async (req, res) => {
  try {
    if (req.url === '/favicon.ico') return res.end()
    const data = await bodyData(req)

    if (!data.url) {
      return res.end(JSON.stringify({ msg: 'URL not detected' }))
    }

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    // 设置截图宽高比
    if (data.viewport) {
      const viewport = data.viewport.split('x')
      data.viewport = {
        width: Math.abs(viewport[0]),
        height: Math.abs(viewport[1])
      }
      data.viewport.isMobile = isBoolean(data.isMobile)
      await page.setViewport(data.viewport) // 设置页面大小
    }

    // 打开网站
    const gotoOpt = goto(data) // 打开网站选项
    await page.goto(data.url, gotoOpt)

    // 截图
    const options = screenshot(data) // 截图选项
    const content = await page.screenshot(options)

    // 关闭浏览器
    await browser.close()

    res.setHeader('Content-Type', 'image/' + options.type)
    res.write(content, options.encoding)
    if (options.encoding === 'base64') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
    }
    res.end()
  } catch (error) {
    // eslint-disable-next-line
    console.error(error)
    res.end(JSON.stringify({ msg: 'Screenshot failed' }))
  }
}
/* eslint-enable max-statements */

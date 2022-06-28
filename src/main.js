const puppeteer = require('puppeteer')
const bodyData = require('body-data')
const {
  isHttp,
  launch,
  goto,
  screenshot,
  cache,
  isBoolean
} = require('./utils')

let browser, page
/*eslint-disable max-statements */
module.exports = async (req, res) => {
  // 允许所有域
  res.setHeader('Access-Control-Allow-Origin', '*')
  // 返回json数据
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  try {
    if (req.url === '/favicon.ico') return res.end()
    const data = await bodyData(req)

    const projectUrl =
      'https://github.com/Lete114/WebStack-Screenshot#%E5%B1%9E%E6%80%A7'
    if (!data.url) {
      const msg = { msg: 'URL not detected , Using parameters: ' + projectUrl }
      return res.end(JSON.stringify(msg))
    }

    // 是否以http协议开头
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
        width: Math.abs(viewport[0]),
        height: Math.abs(viewport[1])
      }
      data.viewport.isMobile = isBoolean(data.isMobile)
      await page.setViewport(data.viewport) // 设置页面大小
    }

    // 打开网站
    const gotoOpt = goto(data) // 打开网站选项
    await page.goto(data.url, gotoOpt)

    // 页面渲染完成后等待(毫秒)
    await page.waitForTimeout(gotoOpt.await)

    // 截图
    const screenshotOpt = screenshot(data) // 截图选项
    const content = await page.screenshot(screenshotOpt)

    // 强制HTTP缓存
    const cacheResult = cache(data.cache)
    if (cacheResult) res.setHeader('Cache-Control', cacheResult)

    // 响应base64的img标签
    if (screenshotOpt.encoding === 'base64') {
      const base64 = `data:image/${screenshotOpt.type};base64,${content}`
      res.setHeader('Content-Type', 'text/html; charset=utf-8')

      // img 标签
      const styleImg = 'style=display:block;margin:auto;cursor:zoom-in;'
      const img = `<img src=${base64} ${styleImg}>`

      // body 标签
      const styleBody = 'style=margin:0px;background:#0e0e0e;height:100%;'
      const body = `<body ${styleBody}>${img}</body>`
      res.write(body)
    } else {
      // 直接响应图片
      res.setHeader('Content-Type', 'image/' + screenshotOpt.type) // 响应图片类型
      res.write(content, screenshotOpt.encoding)
    }
    res.end()
  } catch (error) {
    // eslint-disable-next-line
    console.error(error)
    res.end(JSON.stringify({ msg: 'Screenshot failed' }))
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
}
/* eslint-enable max-statements */

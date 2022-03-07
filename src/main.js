const puppeteer = require('puppeteer')
const bodyData = require('body-data')
const { launch, goto, screenshot, isBoolean } = require('./utils')

/*eslint-disable max-statements */
module.exports = async (req, res) => {
  // 允许所有域
  res.setHeader('Access-Control-Allow-Origin', '*')
  // 返回json数据
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  let browser = null
  try {
    if (req.url === '/favicon.ico') return res.end()
    const data = await bodyData(req)

    const projectUrl =
      'https://github.com/Lete114/WebStack-Screenshot#%E5%B1%9E%E6%80%A7'
    if (!data.url) {
      return res.end(
        JSON.stringify({
          msg: 'URL not detected , Using parameters: ' + projectUrl
        })
      )
    }

    // 判断是服务器(Server)还是无服务器(ServerLess)，决定使用Chromium
    const launchOpt = await launch(data.font)

    browser = await puppeteer.launch(launchOpt)

    // 创建新的标签页
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

    // 页面渲染完成后等待(毫秒)
    await page.waitForTimeout(gotoOpt.await)

    // 截图
    const screenshotOpt = screenshot(data) // 截图选项
    const content = await page.screenshot(screenshotOpt)

    // 关闭浏览器
    // 每次关闭浏览器后，下次再次使用会重新启动浏览器，消耗性能(消耗几百毫秒的启动时间)
    // 可直接关闭标签页来提高性能 `await page.close()`
    // 或是保留标签页到缓存中，如果一直被请求同一个url那么直接使用缓存里的标签页(会增加服务器内存消耗，但能得到极高的请求响应速度)
    // 如果你想优化，欢迎你PR哦~(其实我就是懒才直接关闭浏览器的)
    await browser.close()

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
  } finally {
    if (browser !== null) {
      await browser.close()
    }
  }
}
/* eslint-enable max-statements */

<div align="right">
  语言:
  中文
  <a title="English" href="README.md">English</a>
</div>

<h1 align="center"><a href="https://github.com/lete114/WebStack-Screenshot" target="_blank">WebStack-Screenshot</a></h1>
<p align="center">网站截图 API</p>

<p align="center">
    <a href="https://github.com/Lete114/WebStack-Screenshot/releases/"><img src="https://img.shields.io/npm/v/webstack-screenshot?logo=npm" alt="Version"></a>
    <a href="https://github.com/Lete114/WebStack-Screenshot/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/webstack-screenshot" alt="MIT License"></a>
    <img src="https://visitor_badge.deta.dev/?id=github.WebStack-Screenshot" alt="visitor_badge">
</p>

## 简介

仅仅只是做了一些简单的截图操作，如果有什么需求，或是想参与开发，我们欢迎您 PR

## 快速开始

### 免费 Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Lete114/WebStack-Screenshot/tree/Vercel)

### 安装

```bash
npm install webstack-screenshot --save
```

```js
const webstackScreenshot = require('webstack-screenshot')

webstackScreenshot({ url: 'https://example.com' }).then((buffer) => {
  console.log('buffer', buffer)
})

webstackScreenshot({ url: 'https://example.com', encoding: 'base64' }).then((base64) => {
  console.log('base64', base64)
})
```

### ServerLess

> 你需要配置一个环境变量名 `WEBSTACK_SCREENSHOT_SERVERLESS`，环境变量值可以随意填写任何值，例如：`true`

> 如果截取的网站含有其它国家的语言文字，你可能需要手动配置字体文件。
>
> 配置环境变量名 `WEBSTACK_SCREENSHOT_FONTS`，环境变量值可以是一个 url 或者是一个 path，多个字体文件需要使用 `,` 分割。url 地址必须是 `https://`，path 必须是绝对路径
>
> 例如：`/var/task/fonts/xxx.ttf,https://xxxxx/xxx/xxx.ttf`

```js
module.exports = require('webstack-screenshot/dist/src/serverless')
```

### 克隆仓库

通过克隆仓库到本地来启动 **网站截图 API**

```bash
# 克隆仓库，并进入 WebStack-Screenshot 目录
git clone https://github.com/Lete114/WebStack-Screenshot.git WebStack-Screenshot
cd WebStack-Screenshot

# 安装依赖
npm install

# 启动服务
npm run start
```

## 属性

请求方法: GET | POST

| 属性      | 默认值    | 类型          | 描述                                                                      |
| --------- | --------- | ------------- | ------------------------------------------------------------------------- |
| url       |           | String        | 请求的网站 URL 地址，如果输入的是域名会自动拼接`http://`                  |
| type      | jpeg      | String        | 图片类型，`png`、`jpeg`、`webp`                                           |
| cache     | 86400     | Int & Boolean | 缓存，默认缓存为 1 天，传入`false`禁用缓存，传入数字如:`123`则缓存 123 秒 |
| quality   | 50        | Int           | 图片质量**0-100**之间，如果是图片类型是`png`则被忽略                      |
| viewport  | 1080x1920 | Int           | 截图 100 宽 200 高，格式`100x200`                                         |
| fullPage  | false     | Boolean       | 截取完整页面                                                              |
| isMobile  | false     | Boolean       | 是否是手机端                                                              |
| await     | 1000      | Int           | 页面渲染完成后等待                                                        |
| timeout   | 30000     | Int           | 截图超时，`0`表示无限制(单位毫秒)                                         |
| encoding  | binary    | String        | 图片编码，`binary`、`base64`                                              |
| clip      |           | String        | 剪切指定区域，接收 4 个单位以英文**逗号**分割分别是`x,y,width,height`     |
| waitUntil | load      | String        | 在什么时机触发截图，[详细请看下方另一个表格 ](#waituntil)                 |

### waitUntil

| 属性             | 描述                           |
| ---------------- | ------------------------------ |
| load             | 在 load 事件触发时             |
| domcontentloaded | 在 DOMContentLoaded 事件触发时 |
| networkidle0     | 500ms 内没有任何网站请求时     |
| networkidle2     | 500ms 内只有 2 个请求时        |

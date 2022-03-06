<div align="right">
  语言:
  中文
  <a title="English" href="/README_EN.md">English</a>
</div>

<h1 align="center"><a href="https://github.com/lete114/WebStack-Screenshot" target="_blank">WebStack-Screenshot</a></h1>
<p align="center">网站截图 API</p>

<p align="center">
    <a href="https://github.com/Lete114/WebStack-Screenshot/releases/"><img src="https://img.shields.io/npm/v/webstack-screenshot?logo=npm" alt="Version"></a>
    <a href="https://github.com/Lete114/WebStack-Screenshot/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/webstack-screenshot" alt="MIT License"></a>
</p>

## 简介

仅仅只是做了一些简单的截图操作，如果有什么需求，或是想参与开发，我们欢迎您 PR

## 快速开始

### 免费部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Lete114/WebStack-Screenshot/tree/Vercel)

### NPM 安装

初始化`npm`项目，并且安装`webstack-screenshot`库

```bash
npm init -y
npm install webstack-screenshot --save
```

新建`server.js`文件

```js
// server.js
// 服务器(Server) 部署使用 server
// 无服务器(ServerLess) 部署使用 main
const { server, main } = require('webstack-screenshot')

// 服务器(Server) 直接调用 server() 函数即可运行
// 服务端口号默认为: 6870
// 可直接传入端口号指定，如: server(6870)
// 可指定环境变量 PORT 来指定端口号
// 端口优先级: process.env.PORT ---> PORT ---> 6870
server()

// 无服务器(ServerLess) 暴露 main() 函数给无服务器即可
module.exports = main
```

### 克隆仓库

通过克隆仓库到本地来启动 **网站截图 API**

```bash
# 克隆仓库，并进入 WebStack-Screenshot 目录
git clone https://github.com/Lete114/WebStack-Screenshot.git WebStack-Screenshot
cd WebStack-Screenshot

# 安装依赖
npm install

# 启动服务(于下方热启动任选其一执行即可)
npm run start

# 使用热启动服务
npm run start:hot
```

## 属性

请求方法: GET | POST

| 属性      | 默认值 | 类型    | 描述                                                          |
| --------- | ------ | ------- | ------------------------------------------------------------- |
| url       |        | String  | 请求的网站 URL 地址，如果输入的是域名会自动拼接`http://`      |
| font      |        | String  | 如果指定的截图网站出现乱码，你可通过该参数指定字体`url`地址   |
| viewport  |        | Int     | 截图 100 宽 200 高，格式`100x200`(需添加`fullPage=false`)     |
| isMobile  | false  | Boolean | 是否是手机端                                                  |
| await     | 0      | Int     | 页面渲染完成后等待，`0`表示不等待(单位毫秒)                   |
| timeout   | 30000  | Int     | 截图超时，`0`表示无限制(单位毫秒)                             |
| waitUntil | load   | String  | 在什么时机触发截图，[详细请看下方另一个表格 ](#waituntil)     |
| fullPage  | true   | Boolean | 截取完整页面(如果使用`viewport`需要将`fullPage`设置为`false`) |
| type      | png    | String  | 图片类型，`png`、`jpeg`、`webp`                               |
| encoding  | binary | String  | 图片编码，`binary`、`base64`                                  |

### waitUntil

| 属性             | 描述                               |
| ---------------- | ---------------------------------- |
| load             | 在 load 事件触发时完成             |
| domcontentloaded | 在 DOMContentLoaded 事件触发时完成 |
| networkidle0     | 500ms 内没有任何网站请求时         |
| networkidle2     | 500ms 内只有 2 个请求时            |

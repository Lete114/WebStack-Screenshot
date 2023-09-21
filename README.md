## 📸 Website Screenshot

You need to configure an environment variable name `WEBSTACK_SCREENSHOT_SERVERLESS`, and the value of the environment variable can be any value you want, e.g. `true`.

You may need to manually configure font files if the intercepted site contains text in other languages.

Configure the environment variable name `WEBSTACK_SCREENSHOT_FONTS`, the environment variable value can be a url or a path, multiple font files need to be split by `,`. url address must be `https://`, path must be an `absolute` path.

e.g. `/var/task/fonts/xxx.ttf,https://xxxxx/xxx/xxx.ttf`

## Properties

Request Method: GET | POST

| Properties | Default   | Type          | Description                                                                                                       |
| ---------- | --------- | ------------- | ----------------------------------------------------------------------------------------------------------------- |
| url        |           | String        | The URL of the requested website, if the domain name is entered it will be automatically spelled out as `http://` |
| type       | jpeg      | String        | The image type, `png`, `jpeg`, `webp`                                                                             |
| cache      | 86400     | Int & Boolean | cache, default cache is 1 day, pass `false` to disable cache, pass number like:`123` to cache 123 seconds         |
| quality    | 50        | Int           | Image quality between **0-100**, ignored if the image type is `png`                                               |
| viewport   | 1080x1920 | Int           | Screenshot 100 wide by 200 high, format `100x200`                                                                 |
| fullPage   | false     | Boolean       | Capture the full page                                                                                             |
| isMobile   | false     | Boolean       | If or not it is mobile                                                                                            |
| await      | 1000      | Int           | Wait for the page to finish rendering                                                                             |
| timeout    | 30000     | Int           | Screenshot timeout, `0` means no limit (in milliseconds)                                                          |
| encoding   | binary    | String        | Image encoding, `binary`, `base64`                                                                                |
| clip       |           | String        | Clip the specified area, receive 4 units divided by English **comma**, `x,y,width,height`                         |
| waitUntil  | load      | String        | At what time the screenshot is triggered, [see another table below for details](#waituntil)                       |

### waitUntil

| Properties       | Description                                     |
| ---------------- | ----------------------------------------------- |
| load             | Done when the load event is fired               |
| domcontentloaded | Done when the DOMContentLoaded event is fired.  |
| networkidle0     | When there are no website requests within 500ms |
| networkidle2     | When there are only 2 requests within 500ms     |

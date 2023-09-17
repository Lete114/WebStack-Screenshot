export const args = (() => {
  /**
   * These are the default args in puppeteer.
   * https://github.com/puppeteer/puppeteer/blob/3a31070d054fa3cd8116ca31c578807ed8d6f987/packages/puppeteer-core/src/node/ChromeLauncher.ts#L185
   */
  const puppeteerFlags = [
    '--allow-pre-commit-input',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-extensions-with-background-pages',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-popup-blocking',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-sync',
    '--enable-automation',
    // TODO(sadym): remove '--enable-blink-features=IdleDetection' once
    // IdleDetection is turned on by default.
    '--enable-blink-features=IdleDetection',
    '--export-tagged-pdf',
    '--force-color-profile=srgb',
    '--metrics-recording-only',
    '--no-first-run',
    '--password-store=basic',
    '--use-mock-keychain'
  ]
  const puppeteerDisableFeatures = [
    'Translate',
    'BackForwardCache',
    // AcceptCHFrame disabled because of crbug.com/1348106.
    'AcceptCHFrame',
    'MediaRouter',
    'OptimizationHints'
  ]
  const puppeteerEnableFeatures = ['NetworkServiceInProcess2']
  const chromiumFlags = [
    '--disable-domain-reliability',
    '--disable-print-preview',
    '--disable-speech-api',
    '--disk-cache-size=33554432',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-pings',
    // Needs to be single-process to avoid `prctl(PR_SET_NO_NEW_PRIVS) failed` error
    '--single-process'
  ]
  const chromiumDisableFeatures = ['AudioServiceOutOfProcess', 'IsolateOrigins', 'site-per-process']
  const chromiumEnableFeatures = ['SharedArrayBuffer']
  const graphicsFlags = [
    '--hide-scrollbars',
    '--ignore-gpu-blocklist',
    '--in-process-gpu',
    // https://chromium.googlesource.com/chromium/src/+/main/docs/gpu/swiftshader.md
    '--use-gl=angle',
    '--use-angle=swiftshader',
    // https://source.chromium.org/search?q=lang:cpp+symbol:kWindowSize&ss=chromium
    '--window-size=1920,1080'
  ]
  const insecureFlags = [
    '--allow-running-insecure-content',
    '--disable-setuid-sandbox',
    '--disable-site-isolation-trials',
    '--disable-web-security',
    '--no-sandbox',
    // https://source.chromium.org/search?q=lang:cpp+symbol:kNoZygote&ss=chromium
    '--no-zygote'
  ]
  return [
    ...puppeteerFlags,
    ...chromiumFlags,
    `--disable-features=${[...puppeteerDisableFeatures, ...chromiumDisableFeatures].join(',')}`,
    `--enable-features=${[...puppeteerEnableFeatures, ...chromiumEnableFeatures].join(',')}`,
    ...graphicsFlags,
    ...insecureFlags,
    "--headless='new'"
  ]
})()

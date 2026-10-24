import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const routes = [
  ['', 'command-center.png', 3500],
  ['construction', 'construction-twin.png', 9000],
  ['engineering', 'structural-civil.png', 10000],
  ['proptech', 'proptech.png', 9000],
  ['agents', 'agent-ops.png', 9000],
]
for (const [route, file, wait] of routes) {
  await page.goto(`http://127.0.0.1:4310/#/${route}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(wait)
  await page.screenshot({ path: `docs/${file}` })
}
await browser.close()

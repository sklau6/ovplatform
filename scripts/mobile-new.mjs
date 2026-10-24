import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'] })
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
for (const [route, name] of [['construction', 'mobile-construction'], ['engineering', 'mobile-engineering'], ['proptech', 'mobile-proptech'], ['agents', 'mobile-agents']]) {
  await page.goto(`http://127.0.0.1:4310/#/${route}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(6000)
  await page.screenshot({ path: `.shots/${name}.png` })
  const dims = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, vw: innerWidth, h: document.documentElement.scrollHeight }))
  console.log(name, dims)
}
await browser.close()

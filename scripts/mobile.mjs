import { chromium } from 'playwright-core'
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--hide-scrollbars'],
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
for (const [route, name] of [['', 'mobile-home'], ['twin', 'mobile-twin'], ['brief', 'mobile-brief']]) {
  await page.goto(`http://127.0.0.1:4310/#/${route}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(route === 'twin' ? 4000 : 2200)
  await page.screenshot({ path: `.shots/${name}.png` })
  const overflow = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, vw: innerWidth }))
  console.log(name, overflow)
}
await browser.close()

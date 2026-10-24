import { chromium } from 'playwright-core'
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--hide-scrollbars'],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
await page.goto('http://127.0.0.1:4310/#/twin', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(4000)
const box = await page.locator('.twin-canvas').boundingBox()
await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.55)
for (let i = 0; i < 5; i++) { await page.mouse.wheel(0, 220); await page.waitForTimeout(150) }
await page.waitForTimeout(1800)
await page.screenshot({ path: '.shots/twin-zoomout.png' })
await browser.close()

import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
for (const width of [1280, 1024, 768, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 800 } })
  await page.goto('http://127.0.0.1:4310/#/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(700)
  const info = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, vw: innerWidth, topbar: document.querySelector('.app-topbar')?.getBoundingClientRect().width }))
  console.log(width, info)
  await page.close()
}
await browser.close()

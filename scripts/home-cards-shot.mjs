import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
await page.goto('http://127.0.0.1:4310/#/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)
await page.evaluate(() => window.scrollTo(0, 1020))
await page.waitForTimeout(500)
await page.screenshot({ path: '.shots/home-cards.png' })
await browser.close()

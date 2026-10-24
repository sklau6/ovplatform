import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'] })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
await page.goto('http://127.0.0.1:4310/#/war-room', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(5500)
console.log(await page.evaluate(() => ({ w: document.documentElement.scrollWidth, vw: innerWidth })))
await browser.close()

import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
await page.goto('http://127.0.0.1:4310/#/bim', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(6500)
await page.getByRole('button', { name: /Facade/ }).click()
await page.waitForTimeout(1800)
await page.screenshot({ path: '.shots/bim-facade.png' })
await browser.close()

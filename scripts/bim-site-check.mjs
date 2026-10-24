import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'] })
for (const theme of ['dark','light']) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } })
  const page = await ctx.newPage()
  await page.addInitScript((t) => localStorage.setItem('ophylla-theme', t), theme)
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()) })
  await page.goto('http://127.0.0.1:4320/#/bim-site', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  console.log(theme, await page.evaluate(() => ({ w: document.documentElement.scrollWidth, vw: innerWidth })), errors.slice(0,2))
  await ctx.close()
}
await browser.close()

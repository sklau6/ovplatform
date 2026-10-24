import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
await page.goto('http://127.0.0.1:4310/#/agents', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(5000)
await page.getByRole('button', { name: /Run operating review/i }).click()
for (let i = 0; i < 14; i++) {
  await page.waitForTimeout(1800)
  const approve = page.getByRole('button', { name: /Approve & continue/i }).first()
  if (await approve.count()) {
    await approve.click().catch(() => {})
    await page.waitForTimeout(300)
  }
  const text = await page.locator('body').innerText()
  if (text.includes('Complete · board pack') || text.includes('Run again')) break
}
await page.waitForTimeout(1200)
await page.screenshot({ path: '.shots/agents-complete.png' })
const body = await page.locator('body').innerText()
console.log(JSON.stringify({ errors: errors.slice(0, 8), complete: body.includes('Complete · board pack') || body.includes('Run again'), gateCards: (body.match(/approve/gi)||[]).length }, null, 2))
await browser.close()

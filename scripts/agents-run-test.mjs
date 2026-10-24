import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
await page.goto('http://127.0.0.1:4310/#/agents', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(5000)
await page.getByRole('button', { name: /Run operating review/i }).click()
await page.waitForTimeout(2200)
await page.screenshot({ path: '.shots/agents-running.png' })
await page.waitForTimeout(2600)
await page.screenshot({ path: '.shots/agents-gate.png' })
const gateBtn = page.getByRole('button', { name: /Approve & continue/i }).first()
if (await gateBtn.count()) {
  await gateBtn.click()
  await page.waitForTimeout(2200)
  await page.screenshot({ path: '.shots/agents-after-gate.png' })
}
const body = await page.locator('body').innerText()
console.log(JSON.stringify({ errors: errors.slice(0, 8), hasGate: body.includes('Human gate held'), hasComplete: body.includes('Complete') }, null, 2))
await browser.close()

import { chromium } from 'playwright-core'
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--hide-scrollbars'],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const errors = []
page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))
page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
const out = {}

await page.goto('http://127.0.0.1:4310/#/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
await page.getByRole('button', { name: /Run city scan/i }).first().click()
await page.waitForTimeout(3200)
out.scanToast = await page.locator('body').innerText().then(t => t.includes('City scan complete'))
await page.screenshot({ path: '.shots/smoke-scan.png' })

await page.goto('http://127.0.0.1:4310/#/intelligence', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
const input = page.getByPlaceholder(/Ask about the portfolio/i)
await input.fill('What is at risk in delivery this quarter?')
await input.press('Enter')
await page.waitForTimeout(1800)
out.aiReply = await page.locator('body').innerText().then(t => t.includes('delivery') && t.includes('risk'))
await page.screenshot({ path: '.shots/smoke-ai.png' })

await page.goto('http://127.0.0.1:4310/#/trust', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(700)
const before = await page.locator('body').innerText()
await page.getByRole('button', { name: /Anchor snapshot/i }).first().click()
await page.waitForTimeout(1400)
const after = await page.locator('body').innerText()
out.anchorChanged = before !== after
out.anchorToast = after.includes('Anchored') || after.includes('anchor')
await page.screenshot({ path: '.shots/smoke-trust.png' })

await page.goto('http://127.0.0.1:4310/#/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(500)
await page.keyboard.press('Meta+k')
await page.waitForTimeout(400)
out.palette = await page.locator('body').innerText().then(t => /Jump to|Command palette|Search/i.test(t))
await page.screenshot({ path: '.shots/smoke-palette.png' })

out.errors = errors.slice(0, 10)
console.log(JSON.stringify(out, null, 2))
await browser.close()

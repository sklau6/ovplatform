import { chromium } from 'playwright-core'
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--hide-scrollbars'],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
await page.goto('http://127.0.0.1:4310/#/twin', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3500)
await page.getByRole('button', { name: 'Day', exact: true }).click()
await page.waitForTimeout(1800)
await page.screenshot({ path: '.shots/twin-day.png' })
await page.getByRole('button', { name: 'Night', exact: true }).click()
await page.getByRole('button', { name: 'Levels', exact: true }).click()
await page.waitForTimeout(2200)
await page.screenshot({ path: '.shots/twin-exploded.png' })
await page.getByRole('button', { name: 'Levels', exact: true }).click()
await page.getByText('Energy heatmap', { exact: true }).click()
await page.waitForTimeout(1800)
await page.screenshot({ path: '.shots/twin-energy.png' })
console.log(JSON.stringify({ errors: errors.slice(0, 8) }, null, 2))
await browser.close()

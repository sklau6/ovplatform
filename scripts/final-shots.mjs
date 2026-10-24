import { chromium } from 'playwright-core'
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--hide-scrollbars'],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const shots = [
  ['', 'command-center.png', 2000],
  ['twin', 'digital-twin.png', 8500],
  ['map', 'geospatial.png', 2200],
  ['trust', 'trust-ledger.png', 2200],
  ['brief', 'executive-brief.png', 2200],
]
for (const [route, file, wait] of shots) {
  await page.goto(`http://127.0.0.1:4310/#/${route}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(wait)
  await page.screenshot({ path: `docs/${file}` })
}
await page.goto('http://127.0.0.1:4310/#/twin', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(6500)
await page.getByRole('button', { name: 'Levels', exact: true }).click()
await page.waitForTimeout(1800)
await page.screenshot({ path: 'docs/bim-exploded.png' })
await browser.close()

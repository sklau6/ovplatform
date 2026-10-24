import { chromium } from 'playwright-core'

const url = process.argv[2] || 'http://127.0.0.1:4310/'
const out = process.argv[3] || '.shots/shot.png'
const width = Number(process.argv[4] || 1600)
const height = Number(process.argv[5] || 1000)

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--hide-scrollbars', '--force-color-profile=srgb'],
})
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
const errors = []
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`) })
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(6000)
await page.screenshot({ path: out, fullPage: false })
console.log(JSON.stringify({ url, out, title: await page.title(), errors: errors.slice(0, 12) }, null, 2))
await browser.close()

import { chromium } from 'playwright-core'
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--hide-scrollbars'],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const routes = [
  ['', 'home'], ['twin', 'twin'], ['map', 'map'], ['intelligence', 'intelligence'],
  ['trust', 'trust'], ['portfolio', 'portfolio'], ['architecture', 'architecture'], ['brief', 'brief'],
]
const report = []
for (const [route, name] of routes) {
  const errors = []
  const onErr = e => errors.push(`pageerror: ${e.message}`)
  const onCon = m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) }
  page.on('pageerror', onErr); page.on('console', onCon)
  await page.goto(`http://127.0.0.1:4310/#/${route}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(name === 'twin' ? 4500 : 2200)
  await page.screenshot({ path: `.shots/page-${name}.png` })
  report.push({ name, title: await page.title(), errors: errors.slice(0, 5) })
  page.off('pageerror', onErr); page.off('console', onCon)
}
console.log(JSON.stringify(report, null, 2))
await browser.close()

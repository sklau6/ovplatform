import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const report = []
for (const [route, name] of [['', 'home'], ['twin', 'twin'], ['map', 'map'], ['intelligence', 'intelligence'], ['trust', 'trust'], ['portfolio', 'portfolio'], ['architecture', 'architecture'], ['brief', 'brief']]) {
  const errors = []
  const hE = e => errors.push(`pageerror: ${e.message}`)
  const hC = m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) }
  page.on('pageerror', hE); page.on('console', hC)
  const res = await page.goto(`http://127.0.0.1:4320/#/${route}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(route === 'twin' ? 3500 : 800)
  report.push({ name, status: res?.status(), title: await page.title(), errors: errors.slice(0, 3) })
  page.off('pageerror', hE); page.off('console', hC)
}
console.log(JSON.stringify(report, null, 2))
await browser.close()

import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'] })
const routes = ['', 'twin', 'construction', 'fleet', 'handover', 'quality', 'utilities', 'safety', 'fire', 'supply', 'procurement', 'contracts', 'waste', 'factory', 'bim', 'bim-site', 'bim-workflows', 'design', 'bim-xr', 'esg-building', 'esg-world', 'water', 'port', 'dc-ops', 'plant', 'power', 'assets', 'maintenance', 'mobility', 'traffic', 'ev', 'vehicles', 'resilience', 'place', 'heritage', 'engineering', 'ground', 'facade', 'seismic', 'acoustics', 'proptech', 'workplace', 'esg', 'energy', 'agents', 'map', 'intelligence', 'data', 'trust', 'cyber', 'portfolio', 'capital', 'insurance', 'deals', 'labs', 'war-room', 'people', 'architecture', 'brief']
const report = []
for (const theme of ['dark', 'light']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.addInitScript((t) => localStorage.setItem('ophylla-theme', t), theme)
  for (const route of routes) {
    const errors = []
    const onErr = e => errors.push(e.message)
    const onCon = m => { if (m.type() === 'error') errors.push(m.text()) }
    page.on('pageerror', onErr); page.on('console', onCon)
    await page.goto(`http://127.0.0.1:4320/#/${route}`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(route === '' ? 700 : 1200)
    const info = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, vw: innerWidth, theme: document.documentElement.dataset.theme }))
    report.push({ theme, route: route || 'home', errors: errors.slice(0, 2), overflow: info.w > info.vw })
    page.off('pageerror', onErr); page.off('console', onCon)
  }
  await ctx.close()
}
console.log(JSON.stringify({ failures: report.filter(r => r.errors.length || r.overflow), total: report.length }, null, 2))
await browser.close()

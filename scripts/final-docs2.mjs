import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'] })

const dark = await browser.newContext({ viewport: { width: 1600, height: 1000 } })
const p = await dark.newPage()
await p.addInitScript(() => { localStorage.setItem('ophylla-theme','dark'); localStorage.setItem('ophylla-locale','en') })
const routes = [
  ['', 'command-center.png', 3000],
  ['twin', 'digital-twin.png', 7000],
  ['construction', 'construction-twin.png', 7000],
  ['engineering', 'structural-civil.png', 7500],
  ['proptech', 'proptech.png', 7000],
  ['agents', 'agent-ops.png', 7000],
  ['map', 'geospatial.png', 1800],
  ['intelligence', 'intelligence.png', 1800],
  ['trust', 'trust-ledger.png', 1800],
  ['portfolio', 'portfolio.png', 1800],
  ['architecture', 'architecture.png', 1800],
  ['brief', 'executive-brief.png', 1800],
]
for (const [route, file, wait] of routes) {
  await p.goto(`http://127.0.0.1:4310/#/${route}`, { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(wait)
  await p.screenshot({ path: `docs/${file}` })
}
// exploded BIM
await p.goto('http://127.0.0.1:4310/#/twin', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(6500)
await p.getByRole('button', { name: 'Levels', exact: true }).click()
await p.waitForTimeout(2200)
await p.screenshot({ path: 'docs/bim-exploded.png' })
// typhoon
await p.goto('http://127.0.0.1:4310/#/twin', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(6000)
await p.getByRole('button', { name: 'Typhoon', exact: true }).click()
await p.waitForTimeout(2200)
await p.screenshot({ path: 'docs/typhoon-twin.png' })
await dark.close()

const light = await browser.newContext({ viewport: { width: 1600, height: 1000 } })
const pl = await light.newPage()
await pl.addInitScript(() => { localStorage.setItem('ophylla-theme','light'); localStorage.setItem('ophylla-locale','en') })
await pl.goto('http://127.0.0.1:4310/#/', { waitUntil: 'domcontentloaded' })
await pl.waitForTimeout(3000)
await pl.screenshot({ path: 'docs/light-command-center.png' })
await light.close()

const zh = await browser.newContext({ viewport: { width: 1600, height: 1000 } })
const pz = await zh.newPage()
await pz.addInitScript(() => { localStorage.setItem('ophylla-theme','light'); localStorage.setItem('ophylla-locale','zh-Hans') })
await pz.goto('http://127.0.0.1:4310/#/construction', { waitUntil: 'domcontentloaded' })
await pz.waitForTimeout(7000)
await pz.screenshot({ path: 'docs/chinese-light.png' })
await zh.close()
await browser.close()

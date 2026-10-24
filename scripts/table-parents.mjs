import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
await page.goto('http://127.0.0.1:4310/#/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
const info = await page.evaluate(() => {
  const t = document.querySelector('table.table')
  if (!t) return null
  const out = []
  let el = t
  for (let i = 0; i < 8 && el; i++) {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el)
    out.push({ tag: el.tagName, cls: String(el.className).slice(0,100), w: Math.round(r.width), left: Math.round(r.left), overflowX: cs.overflowX, minWidth: cs.minWidth, display: cs.display })
    el = el.parentElement
  }
  return out
})
console.log(JSON.stringify(info, null, 2))
await browser.close()

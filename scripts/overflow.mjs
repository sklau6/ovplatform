import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
await page.goto('http://127.0.0.1:4310/#/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)
const items = await page.evaluate(() => [...document.querySelectorAll('*')].map(el => {
  const r = el.getBoundingClientRect()
  return { tag: el.tagName, cls: String(el.className).slice(0,90), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), text: String(el.textContent).trim().slice(0,50) }
}).filter(x => x.right > innerWidth + 1).slice(0, 25))
console.log(JSON.stringify(items, null, 2))
await browser.close()

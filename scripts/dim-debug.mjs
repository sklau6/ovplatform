import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
await page.goto('http://127.0.0.1:4310/#/twin', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(6000)
const info = await page.evaluate(() => {
  const main = document.querySelector('main')
  const pageEl = document.querySelector('.page-enter')
  const fixed = [...document.querySelectorAll('*')].map(el => {
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect()
    return { tag: el.tagName, cls: String(el.className).slice(0,80), pos: cs.position, z: cs.zIndex, opacity: cs.opacity, bg: cs.backgroundColor, inset: `${r.left},${r.top},${r.width},${r.height}`, display: cs.display }
  }).filter(x => (x.pos === 'fixed' || x.pos === 'absolute') && x.width > 800 && x.height > 500 && x.opacity !== '0' && x.display !== 'none')
  return { mainOpacity: main ? getComputedStyle(main).opacity : null, pageOpacity: pageEl ? getComputedStyle(pageEl).opacity : null, anim: pageEl ? getComputedStyle(pageEl).animation : null, fixed }
})
console.log(JSON.stringify(info, null, 2))
await page.screenshot({ path: '.shots/dim-debug.png' })
await browser.close()

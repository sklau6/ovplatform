import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
await page.addInitScript(() => localStorage.setItem('ophylla-theme','light'))
await page.goto('http://127.0.0.1:4310/#/trust', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
const info = await page.evaluate(() => {
  const block = document.querySelector('.code-block')
  const line = block?.querySelector('div')
  const kw = block?.querySelector('span.text-\\[\\#c4b5fd\\]')
  return { blockBg: block ? getComputedStyle(block).backgroundColor : null, blockColor: block ? getComputedStyle(block).color : null, lineColor: line ? getComputedStyle(line).color : null, kwColor: kw ? getComputedStyle(kw).color : null, lineClass: line?.className }
})
console.log(info)
await browser.close()

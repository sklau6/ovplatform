import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
await page.goto('http://127.0.0.1:4310/#/construction', { waitUntil: 'domcontentloaded' })
await page.getByRole('button', { name: 'Switch to light theme' }).click()
await page.waitForTimeout(700)
const info = await page.evaluate(() => {
  const el = document.querySelector('.badge-amber')
  const cs = el ? getComputedStyle(el) : null
  return { text: el?.textContent, color: cs?.color, bg: cs?.backgroundColor, border: cs?.borderColor }
})
console.log(info)
await browser.close()

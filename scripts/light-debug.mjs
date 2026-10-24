import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
await page.goto('http://127.0.0.1:4310/#/', { waitUntil: 'domcontentloaded' })
await page.getByRole('button', { name: 'Switch to light theme' }).click()
await page.waitForTimeout(800)
const info = await page.evaluate(() => {
  const section = document.querySelector('section.dark-surface')
  const h2 = section?.querySelector('h2')
  const h1 = section?.querySelector('h1')
  const label = section?.querySelector('[class*="text-[#c9d5e0]"]')
  const title = pageTitle()
  function pageTitle(){ const el = document.querySelector('main h1'); return el ? getComputedStyle(el).color : null }
  return {
    sectionClass: section?.className,
    h2Color: h2 ? getComputedStyle(h2).color : null,
    h2Class: h2?.className,
    h1Color: h1 ? getComputedStyle(h1).color : null,
    labelColor: label ? getComputedStyle(label).color : null,
    mainTitle: title,
    sectionBg: section ? getComputedStyle(section).backgroundColor : null,
  }
})
console.log(JSON.stringify(info, null, 2))
await browser.close()

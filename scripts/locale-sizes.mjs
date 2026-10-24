import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
for (const locale of ['zh-Hant','zh-Hans','es','fr','ja']) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
  await page.addInitScript((loc) => { localStorage.setItem('ophylla-locale', loc); localStorage.setItem('ophylla-theme', 'light') }, locale)
  await page.goto('http://127.0.0.1:4310/#/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(700)
  const info = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, vw: innerWidth, title: document.querySelector('main h1')?.textContent, lang: document.documentElement.lang }))
  console.log(locale, info)
  await page.close()
}
await browser.close()

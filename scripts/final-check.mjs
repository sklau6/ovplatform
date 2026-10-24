import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
await page.goto('http://127.0.0.1:4320/#/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)
const before = await page.evaluate(() => ({
  theme: document.documentElement.dataset.theme,
  themeLabel: document.querySelector('button[aria-label*="theme"]')?.getAttribute('aria-label'),
  langLabel: document.querySelector('button[aria-label*="Language"], button[aria-label*="语言"], button[aria-label*="語言"]')?.getAttribute('aria-label'),
}))
await page.getByRole('button', { name: /Switch to light theme/i }).click()
await page.waitForTimeout(500)
const after = await page.evaluate(() => ({
  theme: document.documentElement.dataset.theme,
  themeLabel: document.querySelector('button[aria-label*="theme"]')?.getAttribute('aria-label'),
  scroll: document.documentElement.scrollWidth,
}))
await page.getByRole('button', { name: /Language|语言|語言/i }).click()
await page.waitForTimeout(250)
const langs = await page.locator('.pref-popover button').allTextContents()
await page.getByRole('button', { name: /日本語/ }).click()
await page.waitForTimeout(600)
const ja = await page.evaluate(() => ({ lang: document.documentElement.lang, title: document.querySelector('main h1')?.textContent, theme: document.documentElement.dataset.theme }))
console.log(JSON.stringify({ before, after, langs, ja }, null, 2))
await browser.close()

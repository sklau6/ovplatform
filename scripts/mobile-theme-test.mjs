import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'] })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
await page.addInitScript(() => { localStorage.setItem('ophylla-theme', 'light'); localStorage.setItem('ophylla-locale', 'zh-Hant') })
for (const [route, name] of [['', 'mobile-light-zh-home'], ['agents', 'mobile-light-zh-agents'], ['engineering', 'mobile-light-zh-eng']]) {
  await page.goto(`http://127.0.0.1:4310/#/${route}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(route === 'agents' || route === 'engineering' ? 5500 : 1800)
  await page.screenshot({ path: `.shots/${name}.png` })
  console.log(name, await page.evaluate(() => ({ w: document.documentElement.scrollWidth, vw: innerWidth, lang: document.documentElement.lang, theme: document.documentElement.dataset.theme })))
}
await browser.close()

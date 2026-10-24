import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
await page.addInitScript(() => { localStorage.setItem('ophylla-theme', 'light') })
for (const [route, name] of [['trust','light-trust'], ['intelligence','light-intel'], ['portfolio','light-portfolio'], ['brief','light-brief']]) {
  await page.goto(`http://127.0.0.1:4310/#/${route}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1800)
  await page.screenshot({ path: `.shots/${name}.png` })
}
await browser.close()

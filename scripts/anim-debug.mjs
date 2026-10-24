import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
await page.goto('http://127.0.0.1:4310/#/twin', { waitUntil: 'domcontentloaded' })
for (const t of [2000, 5000, 9000]) {
  await page.waitForTimeout(t === 2000 ? 2000 : 3000)
  const info = await page.evaluate(() => {
    const el = document.querySelector('.page-enter')
    return {
      now: performance.now(),
      opacity: el ? getComputedStyle(el).opacity : null,
      animations: el ? el.getAnimations().map(a => ({ state: a.playState, time: a.currentTime, duration: a.effect?.getTiming().duration })) : [],
      frames: window.__frames,
    }
  })
  console.log(t, JSON.stringify(info))
}
await page.screenshot({ path: '.shots/anim-debug.png' })
await browser.close()

import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--hide-scrollbars'] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
await page.goto('http://127.0.0.1:4320/#/proptech', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(6000)
const beforeP = await page.locator('body').innerText()
await page.mouse.click(700, 500)
await page.waitForTimeout(1500)
const afterP = await page.locator('body').innerText()
await page.screenshot({ path: '.shots/proptech-click.png' })
await page.goto('http://127.0.0.1:4320/#/agents', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(6000)
const beforeA = await page.locator('body').innerText()
await page.mouse.click(580, 650)
await page.waitForTimeout(1500)
const afterA = await page.locator('body').innerText()
await page.screenshot({ path: '.shots/agents-click.png' })
console.log(JSON.stringify({
  propTechChanged: beforeP.match(/Level \d\d/)?.[0] !== afterP.match(/Level \d\d/)?.[0],
  propLevel: afterP.match(/Level \d\d/)?.[0],
  agentChanged: beforeA.slice(0, 800) !== afterA.slice(0, 800),
  agentTop: afterA.slice(0, 0),
}, null, 2))
await browser.close()

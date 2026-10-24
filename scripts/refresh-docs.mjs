import { chromium } from 'playwright-core';
const shots = [
  ['/#/twin', 'digital-twin.png'], ['/#/place', 'place.png'], ['/#/facade', 'facade.png'],
  ['/#/power', 'power.png'], ['/#/ev', 'ev.png'], ['/#/heritage', 'heritage.png'],
  ['/#/assets', 'assets.png'], ['/#/maintenance', 'maintenance.png'], ['/#/deals', 'deals.png'],
  ['/#/quality', 'quality.png'], ['/#/utilities', 'utilities.png'], ['/#/data', 'data.png'],
  ['/#/insurance', 'insurance.png'], ['/#/handover', 'handover.png'], ['/#/contracts', 'contracts.png'],
  ['/#/procurement', 'procurement.png'], ['/#/fleet', 'fleet.png'], ['/#/fire', 'fire.png'],
  ['/#/traffic', 'traffic.png'], ['/#/waste', 'waste.png'], ['/#/port', 'port.png'],
];
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--hide-scrollbars'],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:4310/', { waitUntil: 'networkidle' });
for (const [route, file] of shots) {
  await page.goto(`http://127.0.0.1:4310${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3200);
  await page.screenshot({ path: `docs/${file}` });
  console.log(file);
}
await browser.close();

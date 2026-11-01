import puppeteer from 'puppeteer';

const EXECUTABLE_PATH = '/Users/aldopd95/Documents/ProductEngineer/DentalClinic/backend/.cache/chrome/mac_arm-156.0.8078.47/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: EXECUTABLE_PATH,
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();

  const routes = ['attention', 'appointments', 'patients', 'metrics'];
  const report: Record<string, any> = {};

  for (const r of routes) {
    await page.goto('http://localhost:4200/' + r, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'ui_' + r + '.png', fullPage: true });
    const info = await page.evaluate("(() => { const h2 = document.querySelector('h2')?.textContent?.trim(); const cards = document.querySelectorAll('.data-card').length; const spinners = document.querySelectorAll('.animate-spin').length; return { h2, cards, spinners }; })()");
    report[r] = info;
  }

  console.log('AUDIT_REPORT:', JSON.stringify(report, null, 2));
  await browser.close();
})();

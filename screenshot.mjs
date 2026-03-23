/**
 * Screenshot tool — usage:
 *   node screenshot.mjs http://localhost:3000
 *   node screenshot.mjs http://localhost:3000 home
 *   node screenshot.mjs http://localhost:3000 home --width=390 --height=844
 *   node screenshot.mjs http://localhost:3000 full --full
 */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHROME_PATH = 'C:/Users/execu/.cache/puppeteer/chrome/win64-146.0.7680.31/chrome-win64/chrome.exe';

const args = process.argv.slice(2);
const url    = args[0] || 'http://localhost:3000';
const label  = args.find(a => !a.startsWith('--') && a !== url) || '';
const full   = args.includes('--full');
const width  = parseInt(args.find(a => a.startsWith('--width='))?.split('=')[1]  || '390');
const height = parseInt(args.find(a => a.startsWith('--height='))?.split('=')[1] || '844');

const dir = join(__dirname, 'temporary screenshots');
mkdirSync(dir, { recursive: true });

const existing = (await import('fs')).readdirSync(dir).filter(f => f.endsWith('.png'));
const n = existing.length + 1;
const filename = `screenshot-${n}${label ? '-' + label : ''}.png`;
const filepath = join(dir, filename);

const browser = await puppeteer.launch({
  headless: true,
  executablePath: CHROME_PATH,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0' });

if (full) {
  await page.screenshot({ path: filepath, fullPage: true });
} else {
  await page.screenshot({ path: filepath });
}

await browser.close();
console.log(`Screenshot saved: ${filepath}`);

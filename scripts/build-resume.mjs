/**
 * Prints /cv to public/valentino-rota-resume.pdf, the file the hero's CV link points at.
 *
 *   npm run resume        builds the site, serves it, prints the page, stops the server
 *
 * With RESUME_BASE_URL set (say, http://localhost:3000 for a running `next dev`), it prints from
 * that server instead and starts nothing.
 *
 * The fonts use `display: optional`: a face that is not ready at first paint is skipped for that
 * page view. So the page is loaded until both faces are the ones in use (the second load has them
 * cached), checked through the DevTools protocol rather than assumed, and the PDF is refused unless
 * the CV is set in Geist (its text and its dates) and fits one page.
 */
import { spawn, spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = fileURLToPath(new URL('../public/valentino-rota-resume.pdf', import.meta.url));
const PORT = 3210;

/** Pages in a PDF: every page object, not the page tree (`/Type /Pages`). */
const pdfPageCount = (pdf) => (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;

async function serve() {
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], {
    cwd: ROOT,
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  const url = `http://localhost:${PORT}`;
  for (let i = 0; i < 120; i++) {
    if (server.exitCode !== null) throw new Error(`next start exited with code ${server.exitCode}`);
    try {
      if ((await fetch(`${url}/cv`)).ok) return { url, stop: () => stop(server) };
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  stop(server);
  throw new Error(`No answer from ${url} after 60 seconds`);
}

/** `next start` may run child processes: end the whole tree. */
function stop(child) {
  if (child.exitCode !== null) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  else child.kill('SIGTERM');
}

/** The faces the browser actually used to draw an element's text. */
async function usedFonts(cdp, selector) {
  const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
  if (!nodeId) throw new Error(`Nothing matches ${selector}`);
  const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
  return fonts.map((f) => f.familyName);
}

async function print(url) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.emulateMedia({ media: 'print' });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');

    let fonts = {};
    for (let attempt = 1; attempt <= 3; attempt++) {
      await page.goto(`${url}/cv`, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      fonts = {
        sans: await usedFonts(cdp, '[data-cv-sheet] h1'),
        dates: await usedFonts(cdp, '[data-cv-sheet] .tabular-nums'),
      };
      if (fonts.sans.includes('Geist') && fonts.dates.includes('Geist')) break;
      fonts = { ...fonts, failed: true };
    }
    if (fonts.failed) throw new Error(`The CV is not set in Geist: ${JSON.stringify(fonts)}`);

    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: false, tagged: true, outline: false });
    const pages = pdfPageCount(pdf);
    if (pages !== 1) throw new Error(`The CV prints on ${pages} pages, not one`);
    writeFileSync(OUT, pdf);
    console.log(`Wrote ${OUT}: 1 page, ${(pdf.length / 1024).toFixed(0)} KB, set in ${fonts.sans[0]}`);
  } finally {
    await browser.close();
  }
}

const external = process.env.RESUME_BASE_URL;
const server = external ? { url: external.replace(/\/$/, ''), stop: () => {} } : await serve();
try {
  await print(server.url);
} finally {
  server.stop();
}

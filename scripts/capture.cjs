const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const PORT = 5198;
const DIST_DIR = path.resolve(__dirname, '../dist');
const OUT_DIR = path.resolve(__dirname, '../docs/images');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);

  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    res.writeHead(500);
    res.end('Error loading file');
  }
});

server.listen(PORT, '127.0.0.1', async () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);

  try {
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      defaultViewport: {
        width: 1200,
        height: 760,
        deviceScaleFactor: 2, // Retina 2x crisp screenshots
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });

    const page = await browser.newPage();

    const targets = [
      { name: 'clock.png', url: `http://127.0.0.1:${PORT}/?tab=clock`, wait: 1200 },
      { name: 'dynamic-island.png', url: `http://127.0.0.1:${PORT}/?tab=clock&island=expanded`, wait: 1000 },
      { name: 'timer.png', url: `http://127.0.0.1:${PORT}/?tab=timer`, wait: 1000 },
      { name: 'pomodoro.png', url: `http://127.0.0.1:${PORT}/?tab=pomodoro`, wait: 1000 },
      { name: 'settings.png', url: `http://127.0.0.1:${PORT}/?tab=clock&settings=true`, wait: 1000 },
    ];

    for (const target of targets) {
      console.log(`Navigating to ${target.url}...`);
      await page.goto(target.url, { waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, target.wait));

      const outPath = path.join(OUT_DIR, target.name);
      await page.screenshot({ path: outPath });
      console.log(`Saved screenshot: ${target.name}`);
    }

    await browser.close();
    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Error capturing screenshots:', err);
  } finally {
    server.close(() => {
      process.exit(0);
    });
  }
});

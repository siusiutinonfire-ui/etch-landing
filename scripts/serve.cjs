/**
 * Minimal static server for E2E runs and local checks. No file watching and
 * no live-reload injection: live-server reloads every open page whenever
 * Playwright writes into test-results/, which resets scroll positions in
 * unrelated tests mid-run.
 *
 *   node scripts/serve.cjs [port]   (default 3000, serves the landing-page folder)
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.argv[2] || 3000);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".mp4": "video/mp4",
};

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    let rel = decodeURIComponent(url.pathname);
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.normalize(path.join(ROOT, rel));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Content-Length": fs.statSync(file).size,
      "Cache-Control": "no-store",
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => {
    process.stdout.write(`serving ${ROOT} on http://localhost:${PORT}\n`);
  });

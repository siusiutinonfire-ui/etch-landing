/**
 * Minimal static server for E2E runs and local checks. No file watching and
 * no live-reload injection: live-server reloads every open page whenever
 * Playwright writes into test-results/, which reset scroll positions in
 * unrelated tests mid-run.
 *
 *   node scripts/serve.cjs [port]   (default 3000, loopback only, serves the landing-page folder)
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

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

/** @param {number} status @param {import("http").ServerResponse} res @param {string} text */
function plain(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

/**
 * @param {string} root — directory to serve
 * @returns {import("http").Server} not yet listening
 */
function createServer(root) {
  const ROOT = path.resolve(root);
  return http.createServer((req, res) => {
    let rel;
    try {
      rel = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
    } catch {
      plain(res, 400, "bad request");
      return;
    }
    if (rel.endsWith("/")) rel += "index.html";

    const file = path.resolve(ROOT, "." + rel);
    // Segment-aware containment check: a bare startsWith(ROOT) would also accept
    // sibling directories such as <root>-private.
    const inside = file === ROOT || file.startsWith(ROOT + path.sep);
    if (!inside || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      plain(res, 404, "not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Content-Length": fs.statSync(file).size,
      "Cache-Control": "no-store",
    });
    fs.createReadStream(file).pipe(res);
  });
}

if (require.main === module) {
  const PORT = Number(process.argv[2] || 3000);
  const root = path.resolve(__dirname, "..");
  createServer(root).listen(PORT, "127.0.0.1", () => {
    process.stdout.write(`serving ${root} on http://localhost:${PORT}\n`);
  });
}

module.exports = { createServer };

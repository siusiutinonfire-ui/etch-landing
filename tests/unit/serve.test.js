// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createServer } from "../../scripts/serve.cjs";

let base;
let siteRoot;
let server;
let origin;

function get(rawPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: "127.0.0.1", port: server.address().port, path: rawPath, method: "GET" }, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on("error", reject);
    req.end();
  });
}

beforeAll(async () => {
  base = fs.mkdtempSync(path.join(os.tmpdir(), "etch-serve-"));
  siteRoot = path.join(base, "site");
  fs.mkdirSync(path.join(siteRoot, "css"), { recursive: true });
  fs.writeFileSync(path.join(siteRoot, "index.html"), "<!doctype html><title>ok</title>");
  fs.writeFileSync(path.join(siteRoot, "css", "main.css"), "body{}");
  // A sibling directory whose name shares the root's prefix — must never be reachable.
  fs.mkdirSync(path.join(base, "site-private"), { recursive: true });
  fs.writeFileSync(path.join(base, "site-private", "secret.txt"), "top secret");

  server = createServer(siteRoot);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(base, { recursive: true, force: true });
});

describe("static test server", () => {
  it("serves index.html at / with type and length headers", async () => {
    const res = await get("/");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(Number(res.headers["content-length"])).toBeGreaterThan(0);
    expect(res.body).toContain("<title>ok</title>");
  });

  it("serves nested assets with the right content type", async () => {
    const res = await get("/css/main.css");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/css");
  });

  it("returns 404 for missing files and for directories (no listing)", async () => {
    expect((await get("/nope.txt")).status).toBe(404);
    expect((await get("/css")).status).toBe(404);
  });

  it("never serves a sibling directory that merely shares the root's name prefix", async () => {
    // "%2e%2e%5c" decodes to "..\" which path.join normalises on Windows.
    const res = await get("/%2e%2e%5csite-private%5csecret.txt");
    expect(res.status).toBe(404);
    expect(res.body).not.toContain("top secret");
  });

  it("answers 400 to malformed percent-encoding instead of crashing", async () => {
    const res = await get("/%");
    expect(res.status).toBe(400);
    expect((await get("/")).status).toBe(200); // still alive
  });
});

describe("createServer", () => {
  it("is exported for tests and does not listen on its own", () => {
    const s = createServer(siteRoot);
    expect(s.listening).toBe(false);
    s.close();
  });
});

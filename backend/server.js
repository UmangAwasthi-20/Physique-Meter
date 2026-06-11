"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { calculatePhysique } = require("../shared/physique");

const PORT = Number(process.env.PORT || 3000);
const FRONTEND_DIR = path.resolve(__dirname, "../frontend");
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(FRONTEND_DIR, requestedPath));

  if (!filePath.startsWith(FRONTEND_DIR)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(data);
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.url === "/api/health" && request.method === "GET") {
    sendJson(response, 200, { ok: true, service: "physique-meter-api" });
    return;
  }

  if (request.url === "/api/metrics" && request.method === "POST") {
    try {
      const body = await readBody(request);
      const payload = body ? JSON.parse(body) : {};
      const metrics = calculatePhysique(payload);
      sendJson(response, 200, { ok: true, metrics });
    } catch (error) {
      sendJson(response, 400, { ok: false, error: error.message });
    }
    return;
  }

  if (request.method === "GET") {
    serveStatic(request, response);
    return;
  }

  sendJson(response, 405, { ok: false, error: "Method not allowed" });
});

server.listen(PORT, () => {
  console.log(`Physique Meter running at http://localhost:${PORT}`);
});

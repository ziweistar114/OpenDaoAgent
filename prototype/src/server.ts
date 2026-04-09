import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { getConfig } from "./core/config.js";
import { prototypeRoot } from "./core/paths.js";
import { runOrchestrator } from "./orchestrator/run.js";
import { logStep } from "./shared/logger.js";
import { listAllowedTools } from "./tools/catalog.js";

const config = getConfig();
const port = Number(process.env.PORT || 3010);
const maxBodySize = 64 * 1024;
const appHtmlPath = path.join(prototypeRoot, "public", "index.html");

function setJsonHeaders(response: http.ServerResponse): void {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function writeJson(response: http.ServerResponse, statusCode: number, payload: unknown): void {
  setJsonHeaders(response);
  response.statusCode = statusCode;
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function writeHtml(response: http.ServerResponse, statusCode: number, html: string): void {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.end(html);
}

async function readJsonBody(request: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let totalLength = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalLength += buffer.length;

    if (totalLength > maxBodySize) {
      throw new Error(`request body exceeds ${maxBodySize} bytes`);
    }

    chunks.push(buffer);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return {};
  }

  return JSON.parse(raw) as unknown;
}

function isQueryPayload(value: unknown): value is { text: string } {
  return Boolean(
    value &&
      typeof value === "object" &&
      "text" in value &&
      typeof (value as { text?: unknown }).text === "string"
  );
}

const server = http.createServer(async (request, response) => {
  const method = request.method || "GET";
  const url = new URL(request.url || "/", `http://${request.headers.host || `localhost:${port}`}`);

  if (method === "OPTIONS") {
    setJsonHeaders(response);
    response.statusCode = 204;
    response.end();
    return;
  }

  if (method === "GET" && url.pathname === "/") {
    try {
      const html = await fs.readFile(appHtmlPath, "utf8");
      writeHtml(response, 200, html);
      return;
    } catch {
      writeJson(response, 500, {
        ok: false,
        error: "failed to load the local app page"
      });
      return;
    }
  }

  if (method === "GET" && url.pathname === "/app-info") {
    writeJson(response, 200, {
      appName: config.appName,
      mode: config.mode,
      phase: config.currentPhase,
      endpoints: {
        home: "GET /",
        health: "GET /health",
        query: "POST /api/query"
      },
      allowedTools: listAllowedTools()
    });
    return;
  }

  if (method === "GET" && url.pathname === "/health") {
    writeJson(response, 200, {
      ok: true,
      appName: config.appName,
      mode: config.mode,
      phase: config.currentPhase,
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/query") {
    try {
      const body = await readJsonBody(request);

      if (!isQueryPayload(body) || !body.text.trim()) {
        writeJson(response, 400, {
          ok: false,
          error: "request body must be JSON with a non-empty text field"
        });
        return;
      }

      logStep("api", `received query over HTTP: ${body.text}`);
      const result = await runOrchestrator({ text: body.text.trim() });
      writeJson(response, 200, result);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      writeJson(response, 400, {
        ok: false,
        error: message
      });
      return;
    }
  }

  writeJson(response, 404, {
    ok: false,
    error: "route not found"
  });
});

server.listen(port, () => {
  logStep("api", `server listening on http://localhost:${port}`);
});

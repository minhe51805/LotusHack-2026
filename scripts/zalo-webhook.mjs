import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const ROOT_DIR = process.cwd();
const DEFAULT_WEBHOOK_PATH = "/api/zalo/webhook";
const ENV_FILES = [".env.local", ".env"];

loadEnvFiles();

const action = process.argv[2];

if (!action || !["me", "info", "set", "delete"].includes(action)) {
  console.error(
    "Usage: bun scripts/zalo-webhook.mjs <me|info|set|delete>"
  );
  process.exit(1);
}

const botToken = process.env.ZALO_BOT_TOKEN?.trim();

if (!botToken) {
  console.error("Missing ZALO_BOT_TOKEN");
  process.exit(1);
}

const webhookPath = normalizeWebhookPath(
  process.env.ZALO_WEBHOOK_PATH?.trim() || DEFAULT_WEBHOOK_PATH
);
const webhookBaseUrl = process.env.ZALO_WEBHOOK_BASE_URL?.trim();
const webhookSecret = process.env.ZALO_WEBHOOK_SECRET?.trim();
const webhookUrl = webhookBaseUrl ? joinUrl(webhookBaseUrl, webhookPath) : null;
const apiBase = `https://bot-api.zaloplatforms.com/bot${botToken}`;

try {
  switch (action) {
    case "me":
      await printResponse("getMe", await callBotApi(apiBase, "getMe"));
      break;
    case "info":
      await printResponse(
        "getWebhookInfo",
        await callBotApi(apiBase, "getWebhookInfo")
      );
      break;
    case "set":
      if (!webhookUrl) {
        console.error("Missing ZALO_WEBHOOK_BASE_URL");
        process.exit(1);
      }

      await printResponse(
        "setWebhook",
        await callBotApi(apiBase, "setWebhook", {
          url: webhookUrl,
          ...(webhookSecret ? { secret_token: webhookSecret } : {}),
        })
      );
      break;
    case "delete":
      await printResponse(
        "deleteWebhook",
        await callBotApi(apiBase, "deleteWebhook")
      );
      break;
    default:
      process.exit(1);
  }
} catch (error) {
  console.error(
    error instanceof Error ? error.message : `Unknown error: ${String(error)}`
  );
  process.exit(1);
}

function loadEnvFiles() {
  for (const fileName of ENV_FILES) {
    const filePath = resolve(ROOT_DIR, fileName);
    if (!existsSync(filePath)) continue;

    const raw = readFileSync(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex <= 0) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      if (!key || process.env[key] !== undefined) continue;

      let value = trimmed.slice(separatorIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  }
}

function normalizeWebhookPath(pathname) {
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function joinUrl(baseUrl, pathname) {
  return `${baseUrl.replace(/\/+$/, "")}${pathname}`;
}

async function callBotApi(baseUrl, method, payload) {
  const response = await fetch(`${baseUrl}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload ? JSON.stringify(payload) : "{}",
  });

  const raw = await response.text();
  let data = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!response.ok) {
    throw new Error(
      `${method} failed with status ${response.status}: ${stringify(data)}`
    );
  }

  return data;
}

async function printResponse(method, data) {
  console.log(
    JSON.stringify(
      {
        method,
        webhookUrl,
        hasSecret: Boolean(webhookSecret),
        response: data,
      },
      null,
      2
    )
  );
}

function stringify(value) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

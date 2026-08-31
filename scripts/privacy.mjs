import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const secretKey =
  /(?:password|passwd|api[_-]?key|access[_-]?token|refresh[_-]?token|private[_-]?key|secret)$/i;
const unsafeText = [
  [
    "IPv4 literal",
    /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|169\.254\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/,
  ],
  ["localhost address", /\b(?:localhost|0\.0\.0\.0)\b/i],
  [
    "IPv6 literal",
    /(?:^|[\s"'])(?:\[?[a-f0-9]{0,4}:[a-f0-9:]{2,}\]?)(?=$|[\s"'])/i,
  ],
  ["private path", /(?:\/Users\/|\/home\/|\/root\/|[A-Za-z]:\\Users\\)/],
  ["SSH-style host", /\b[a-z_][a-z0-9_-]*@[a-z0-9.-]+:/i],
  ["LAN hostname", /\b[a-z0-9-]+\.(?:local|lan|home|internal)\b/i],
  [
    "control endpoint",
    /\/(?:v1\/models|v1\/chat\/completions|api\/models|admin\/models)\b/i,
  ],
];

export function scanText(text, label = "input") {
  const errors = [];
  for (const [name, pattern] of unsafeText)
    if (pattern.test(text)) errors.push(`${label}: ${name}`);
  return errors;
}

export function scanValue(value, path = "$") {
  const errors = [];
  if (Array.isArray(value))
    value.forEach((item, index) =>
      errors.push(...scanValue(item, `${path}[${index}]`)),
    );
  else if (value && typeof value === "object")
    for (const [key, item] of Object.entries(value)) {
      if (secretKey.test(key))
        errors.push(`${path}.${key}: credential-shaped field`);
      if (/container(?:Name)?$/i.test(key))
        errors.push(`${path}.${key}: container identifier field`);
      errors.push(...scanValue(item, `${path}.${key}`));
    }
  else if (typeof value === "string") {
    errors.push(...scanText(value, path));
    if (/^\\\\[^\\]+\\/.test(value)) errors.push(`${path}: private path`);
    if (/^https?:\/\//i.test(value)) {
      try {
        const url = new URL(value);
        if (
          url.protocol !== "https:" ||
          /^(?:\d{1,3}\.){3}\d{1,3}$/.test(url.hostname) ||
          url.hostname.includes(":")
        )
          errors.push(`${path}: unsafe external URL`);
      } catch {
        errors.push(`${path}: invalid URL`);
      }
    }
  }
  return errors;
}

export function scanDirectory(root) {
  const errors = [];
  const allowed = new Set([
    ".html",
    ".js",
    ".css",
    ".json",
    ".txt",
    ".xml",
    ".svg",
  ]);
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      const file = join(dir, name);
      if (statSync(file).isDirectory()) walk(file);
      else if (allowed.has(extname(file)))
        errors.push(
          ...scanText(readFileSync(file, "utf8"), file.slice(root.length + 1)),
        );
    }
  }
  walk(root);
  return errors;
}

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import http from "node:http";
import https from "node:https";
import { isBlockedResourceUrl, isPrivateOrReservedAddress } from "./networkSecurity.mjs";

const MAX_BYTES = 10 * 1024 * 1024;
const REDIRECTS = new Set([301, 302, 303, 307, 308]);

// Keep the URL hostname for Host/SNI/certificate validation, but give the socket
// only the already-validated addresses. Never resolve the hostname a second time.
export async function fetchExportResource(rawUrl, {
  resolveHost = lookup,
  request = (url, options, callback) => (url.protocol === "https:" ? https : http).request(url, options, callback),
  userAgent = "AIRDeck export",
  signal = AbortSignal.timeout(10_000),
} = {}) {
  let url = new URL(rawUrl);
  for (let redirects = 0; redirects <= 5; redirects++) {
    signal.throwIfAborted();
    if (!/^https?:$/.test(url.protocol) || url.username || url.password || isBlockedResourceUrl(url.href)) {
      throw new Error("Blocked export resource");
    }
    const hostname = url.hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "");
    const family = isIP(hostname);
    const addresses = family ? [{ address: hostname, family }] : await resolveHost(hostname, { all: true, verbatim: true });
    signal.throwIfAborted();
    if (!addresses.length || addresses.some(({ address }) => isPrivateOrReservedAddress(address))) {
      throw new Error("Blocked export resource address");
    }
    const result = await new Promise((resolve, reject) => {
      const req = request(url, {
        method: "GET", agent: false, signal,
        headers: { "user-agent": userAgent, "accept-encoding": "identity" },
        lookup: (_host, options, callback) => {
          const candidates = options.family ? addresses.filter((entry) => entry.family === options.family) : addresses;
          if (!candidates.length) return callback(new Error("No validated address for requested family"));
          if (options.all) return callback(null, candidates);
          callback(null, candidates[0].address, candidates[0].family);
        },
      }, (res) => {
        if (REDIRECTS.has(res.statusCode) && res.headers.location) {
          res.destroy();
          resolve({ location: res.headers.location });
          return;
        }
        const chunks = [];
        let size = 0;
        res.on("data", (chunk) => {
          size += chunk.length;
          if (size > MAX_BYTES) {
            reject(new Error("Export resource exceeds size limit"));
            res.destroy();
            req.destroy();
          } else chunks.push(chunk);
        });
        res.on("error", reject);
        res.on("aborted", () => reject(new Error("Export resource interrupted")));
        res.on("end", () => {
          // Never forward cookies, connection headers or redirect headers to Chromium.
          const headers = {};
          for (const name of ["content-type", "content-encoding", "access-control-allow-origin"]) {
            if (typeof res.headers[name] === "string") headers[name] = res.headers[name];
          }
          resolve({ status: res.statusCode, headers, body: Buffer.concat(chunks) });
        });
      });
      req.on("error", reject);
      req.end();
    });
    if (!result.location) return result;
    url = new URL(result.location, url);
  }
  throw new Error("Too many export resource redirects");
}

export async function handleExportResource(route, options) {
  try {
    if (route.request().method() !== "GET") return await route.abort();
    const response = await fetchExportResource(route.request().url(), options);
    await route.fulfill(response);
  } catch {
    // Broken or blocked remote resources must not prevent a deck exporting.
    await route.abort().catch(() => {});
  }
}

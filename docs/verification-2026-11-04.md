# Repair branch verification — 4 November 2026

Branch: `repair/sandbox-and-tests`, base commit `4354a96`, with the uncommitted Monaco CSP fix and test changes.

Result: **179 automated checks passed, 1 failed** across 159 renderer/unit/route/download checks and 21 live API checks. The original 12 API checks were also run separately and passed; they are included in the expanded 21, not counted twice. Production build passed. ESLint exited successfully with 16 warnings and no errors.

This is not an all-green release sign-off. Live BYOK generation exceeded the 180-second test deadline. Full DNS-rebinding resistance remains unverified. Browser console review found missing PWA icons and a blocked debugging source map.

## Phase 1 — Test suite: 4/4 passed

- [x] Deck compiler tests — standalone HTML, escaping, deterministic compilation, component validation and aggregation passed.
- [x] Linear theme compilation — compiler and real PDF/PPTX rendering passed.
- [x] Invalid theme handling — unknown themes rejected by compiler and export routes.
- [x] Deck schema validation — valid/invalid shapes, bounds, nested props and non-JSON values passed.

## Phase 2 — Sandbox: 9/9 passed within the stated coverage

Browser checks used Chrome and the production build at `http://localhost:3210/sandbox`, with separate local storage from the existing `localhost:3000` deck.

- [x] Sandbox preview — default slide and edited HTML rendered in Chrome.
- [x] Multi-slide navigation — created a second test slide and switched back to the first; preview matched selection.
- [x] Slide editing — replaced test-slide HTML in Monaco; preview updated and status returned to Saved.
- [x] Normal refresh — both edited test slides survived reload.
- [x] Malformed JSON recovery — replaced test-origin `pptPages` with `{broken` using DevTools storage controls; reload showed one default New Slide without a crash.
- [x] Invalid stored data recovery — automated tests passed for non-array JSON, mixed non-string entries and unavailable storage. A separate live invalid-value test was not completed; this item has automated coverage only.
- [x] Blank slide fallback — a fresh production origin showed one editable New Slide; malformed JSON also recovered to that fallback.
- [x] Console logging — `QA_CONSOLE_OK` from slide JavaScript appeared in the sandbox console.
- [x] Iframe message isolation — automated tests rejected unrelated source windows and malformed messages. A live slide attempting parent local-storage access caught the browser's isolation error and logged `ISOLATION_OK`. A live forged-message console test was not executed because Chrome blocked console pasting; that protection was left enabled.

## Phase 3 — Security: 13 passed, 1 failed, 1 partial

- [x] CSP headers — real production responses for `/`, `/sandbox`, and `/code-ide` returned CSP, `nosniff`, and `SAMEORIGIN`; nonce and sandbox policy tests passed.
- [x] Monaco Editor — Chrome showed correctly ordered code, line numbers and spacing after the CSS allowance. Edits worked on the production build.
- [x] Authentication checks — unauthenticated generation, editing, export, saving, sharing and duplication requests rejected with 401.
- [x] Presentation ownership — owners could read/rename/save; other users could not read, change, delete, share or duplicate private decks.
- [x] Shared presentation access — recipients could read and duplicate shared decks; live share and revoke operations changed access as expected.
- [x] Public presentation access — public token returned slides; disabling the link made it return 404. Non-owner publication was rejected.
- [x] Password protection — locked public responses omitted slide contents and used `private, no-store`; wrong password returned 401 and correct password returned slides. Non-owner password changes were rejected.
- [x] Rate limiting — live password verification returned 429 with Retry-After after ten attempts; export route tests also exercised repeated-request limits. This is coverage of those paths, not every endpoint or distributed deployment behavior.
- [x] Gemini platform API key — live one-slide linear generation succeeded in about 38 seconds; one fixture credit was charged. Header-only key transport passed unit tests.
- [ ] Gemini BYOK key — **FAILED timing check**: live request aborted after 180.1 seconds. Server logs show eventual compilation at 6 minutes 2 seconds after model fallback. No successful response or final credit assertion was observed by the test. The existing configured platform credential was supplied via the BYOK header to exercise that branch; no independent user's key was tested. Key override/header transport unit tests passed.
- [x] PDF export — real rendering, route validations, private Blob upload and successful download of a non-empty PDF passed.
- [x] PPTX export — real rendering, slide/image/ZIP structure, route validations, private Blob upload and successful download passed.
- [x] Private IPv4 blocking — loopback, RFC1918, link-local/metadata and reserved-range tests passed; private-image rendering cases passed.
- [x] Private IPv6 blocking — loopback, ULA, link-local, multicast, IPv4-mapped and transition/special-purpose cases passed.
- [ ] DNS rebinding/private DNS blocking — **PARTIAL**: mocked private/mixed DNS answers and DNS failures are rejected. Full rebinding was not exercised. Source inspection shows Node resolves before `route.continue()`, while Chromium subsequently makes its own connection; the checked address is not pinned. Passing these unit tests does not establish resistance to a changing DNS answer.

## Phase 4 — Final verification: 5 passed, 1 failed, 2 with warnings

- [ ] All automated tests — **FAILED overall**: 179/180 passed; the live BYOK timeout is the only failed check. No skips in the recorded full runs.
- [x] ESLint — **WITH WARNINGS**: exit 0, 0 errors, 16 warnings (unused imports/variables and obsolete directives). Changed test/CSP files additionally passed targeted ESLint.
- [x] Production build — passed with TypeScript validation. Initial restricted-network attempt could not fetch Geist fonts; the network-enabled rerun succeeded.
- [x] Presentation generation — real platform-key request produced a one-slide linear deck. BYOK timing failure is recorded separately above.
- [x] Editing and saving — live API create/update/read-back passed; Chrome preview edits and local persistence passed. The complete authenticated save-button UI sequence was not separately exercised.
- [x] Sharing and duplication — live owner/recipient API checks passed, including revocation and recipient duplication. The UI dialogs were not separately exercised.
- [x] PDF/PPTX exports — both live service endpoints returned downloadable artifacts with matching byte sizes and file signatures; browser download-helper tests also passed. Live export buttons were not separately exercised.
- [x] Final browser console review — **WITH WARNINGS**: `/icons/icon-192.png` returns 404; manifest inspection also reports missing `/icons/icon-512.png`. DevTools blocks Monaco's optional `loader.js.map` under `connect-src 'self'`. No Monaco stylesheet block remained. A console syntax error caused by the diagnostic tool entering a panel-search label is excluded from application findings.

## Findings to address

1. **Generation latency:** `lib/gemini.js` calls fetch without a request timeout/abort signal. The configured `gemini-3.8-flash` attempt was unavailable and fallback to `gemini-3.6-flash` took over six minutes for the BYOK case. Bound each model attempt and propagate cancellation; independently verify the configured model before changing it.
2. **DNS verification gap:** `lib/slideRenderer.js` checks `isBlockedResourceRequest()` and then continues the browser request. Review connection-time enforcement/address pinning and redirect handling before claiming full DNS-rebinding protection.
3. **Missing application icons:** layout/manifest reference icon files absent from the served app. Restore the assets or correct the references.
4. **Lint and debugging noise:** 16 lint warnings remain. The blocked source map affects debugging, not the verified editor rendering.

## Reproduction and evidence

The real renderer/download/route/unit run used:

```sh
node --import ./tests/register-loader.mjs --experimental-test-module-mocks --test tests/deck-compile.test.mjs tests/deck-schema.test.mjs tests/sandbox.test.mjs tests/csp.test.mjs tests/public-deck-access.test.mjs tests/network-security.test.mjs tests/sandbox-messages.test.mjs tests/gemini-security.test.mjs tests/export-pdf-route.test.mjs tests/export-pptx-route.test.mjs tests/export-storage.test.mjs tests/download-helper.test.mjs tests/pdf-export.test.mjs tests/pptx-export.test.mjs
npm run lint
npm run build
npm run start -- --port 3210
RUN_LIVE_SERVICES=1 npm run test:api
```

Live service tests are opt-in: without `RUN_LIVE_SERVICES=1`, the two AI calls and two Blob export checks are skipped. They require configured MongoDB, NextAuth, Gemini and private export-storage credentials. BYOK verification uses the configured Gemini key via the request header. Chromium was installed with `npx playwright install chromium`.

Local run logs (temporary files): `/tmp/devslide-all-tests.log`, `/tmp/devslide-api-checklist.log`, `/tmp/devslide-lint.log`, `/tmp/devslide-build.log`, `/tmp/devslide-production-server.log`.

API fixtures use unique per-run user emails; cleanup is scoped to those users and their decks. The two private Blob test exports were not deleted. The production test origin's malformed local-storage fixture was left in place and continues to recover to a blank slide. Existing `localhost:3000` presentation storage was not modified. No commits or pushes were made.


## Follow-up — 6 November 2026

- Live Gemini BYOK retest passed in 8.8 seconds with Gemini 3.6 Flash, valid HTML output, unchanged fixture credits, and fixture cleanup.
- Before the DNS fix, the complete local regression run passed 179/179, and production build passed. ESLint reported 15 warnings and no errors.
- Closed the export DNS check/connection gap: `lib/exportResource.mjs` resolves and validates addresses, pins them through Node's socket lookup, retains the URL hostname for TLS verification, and uses a fresh connection. Chromium receives fulfilled response bytes instead of continuing network requests.
- Redirect destinations are revalidated and pinned, with a five-redirect limit. Resources are limited to 10 MiB and GET requests; browser credentials are not forwarded. Oversized, blocked, or failed resources are omitted so the deck can still export. Requests have a 10-second transport deadline (DNS lookup uses the operating system resolver timeout).
- Export contexts block service workers and WebSockets. These controls apply to server exports, not the interactive editor.
- After the fix: 31 security tests passed, 56 PDF/PPTX renderer and route tests passed, and production build passed. An additional strengthened Chromium regression confirmed zero TCP connections to a listening private HTTP/WebSocket server. A real public HTTPS PNG fetched successfully with certificate verification enabled.
- Rebinding coverage uses a deterministic resolver that changes from public to private and asserts that the transport sees only the validated address. Redirect-to-private and same-host rebinding cases are covered. This is not a deployment-level hostile DNS or egress-firewall audit.
- Changes remain uncommitted; no merge or push performed.

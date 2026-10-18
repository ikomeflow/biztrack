# Version 1.5.0 reliable startup — 17 October 2026

- Build, portable build and syntax checks passed. **26 unit tests and 172 browser checks passed**: 67 general, 35 security, 22 simple UI, 1 portable app, 23 performance/upgrade and 24 new startup/retry checks. Synthetic records and isolated browser contexts only; no production ledger or credential was used.
- The PIN gate remains usable with the full workspace stylesheet deliberately stalled. Authenticated content waits for styling and resumes when it arrives. Main-module errors expose Retry; an eight-second stall exposes a slow-connection message and Retry, then resumes automatically when the download arrives. Failed style/offline downloads can be retried before unlock.
- The minimal gate keeps its 18 px field-to-Unlock gap and has no appearance toggle. Light/dark layouts at widths 320, 390, 768 and 1440 have no horizontal overflow. Screenshots inspected.
- Exact previous 1.4.3 shell and worker fixtures verify that open.html bypasses the old cached root. Update preserves ciphertext byte-for-byte, guards partial PIN input and open forms, and returns to the canonical root. The new entry also opens offline after cache activation. Failed candidate downloads retain the working previous app.
- Controlled gzip comparison at 400 ms latency, 50 KB/s download and 4× CPU slowdown: previous PIN gate 1987 ms, new gate 1634 ms (about 18% faster); new cached stalled-connection reload 586 ms. Timings describe this run and are not guarantees for every connection.
- All 250 synthetic entries survive the update with exact totals, complete CSV and offline multi-page PDF output. Existing recovery works offline; FlowTrack storage is untouched. Portable HTML still creates a PIN, saves encrypted records and unlocks after reload. Physical Safari/iOS and native screen-reader behavior were not tested.
- New suite: `node tests/startup-browser.mjs`. Existing browser suites use BIZTRACK_QA_URL, BIZTRACK_QA_PACKAGES, BIZTRACK_QA_BROWSER and BIZTRACK_QA_OUTPUT overrides as documented in their sources.

---

# Version 1.4.3 PIN spacing — 17 October 2026

- The deployed PIN input and button shared the same edges but had a zero-pixel vertical gap. The CSS now makes both block-level controls and gives the primary action an explicit 18 px top margin.
- Build, standalone build, syntax checks and all 26 unit checks pass. Sixteen isolated visual layout checks pass for setup and unlock, light/dark appearance and 320/390/768/1440 px widths: matching edges, 18 px spacing, at least 44 px button height and no horizontal overflow. Screenshots inspected on mobile and desktop.
- Styles only; app-v5.mjs and the original ledger, PIN, encryption and recovery modules are unchanged. Release styles-v6.css and cache v5-20261017-pin-spacing with matching HTML/build files.

---

# Version 1.4.2 minimal PIN screen — 17 October 2026

- Build, standalone build and syntax checks pass. All 26 unit checks pass, including encryption, recovery, record preservation and coherent offline caching.
- All 35 security browser checks pass with isolated synthetic records: migration, PIN changes, correct/incorrect recovery keys, locked backup restore, cross-tab locks, idle locking, storage failure and corrupt-data preservation. No production records or credentials were read or used.
- Setup and unlock screenshots inspected. The PIN gate has no appearance control or repeated normal-state instructions. Forgot PIN remains visible for a locked ledger. Backup and demo tools remain accessible through the native More options disclosure; damaged original data opens the disclosure automatically. Gate widths from 320 to 1440 px pass.
- The wider business browser suite was interrupted by the local browser connection. Its complete result is not claimed for this release. No calculation, storage, encryption or export module changed.
- Publish matching app-v5.mjs, styles-v5.css, index.html and cache v4-20261017-minimal-pin together with the updated build/source files. Earlier assets remain available for existing pages.

---

# Version 1.4.1 compact controls — 17 October 2026

- 26 unit tests, 67 business/mobile browser checks and the portable PIN/save/reload/unlock check pass. Day/night persistence, cross-tab appearance, demo exit, backups, reports and widths from 320 to 1440 px remain covered.
- Mobile and desktop screenshots inspected: the visible theme circle is smaller, the header has no demo strip, and Demo · Sample records / Exit demo are in the footer. The theme button retains its existing 44 px touch area and accessible name.
- A duplicate demo label found during QA was removed before packaging. There is exactly one demo-banner element, inside footer. Ledger, PIN and recovery code/format remain unchanged.
- Publish matching app-v4.mjs, styles-v4.css, index.html and cache v3-20261017-compact-controls together. Older assets remain available for existing offline pages.

---

# Version 1.4 simplified interface — 17 October 2026

- **26 unit tests and 148 browser checks passed**: 67 general/business/mobile, 35 PIN/recovery, 23 performance/offline/upgrade, 22 new concise-interface checks and one portable-copy flow.
- New entry options start closed, keyboard opens all fields, saved currencies/categories round-trip exactly, editing opens the saved options, and each new entry starts closed again.
- Backups, PIN/recovery and privacy disclosures start closed, work independently by keyboard, expose their existing actions, and never modify ledger bytes. Locking closes all sections and clears private text and drafts.
- Short overview and PIN headings, no creator byline on the PIN gate, mobile font sizing and Settings widths from 320 to 1440 px verified. All four screens and day/night behavior pass the existing mobile/browser suite.
- Offline PIN/recovery, 250-row full exports, waiting-update form protection, failed candidate retention and the portable copy all pass again. No production PINs, keys or records were read or used.
- Screenshots inspected for overview, settings and entry options. No runtime errors. Current assets are app-v3.mjs and styles-v3.css; report-v2.mjs, original vault/core modules and theme remain unchanged.

---

# Version 1.3 performance verification — 17 October 2026

- **26 unit tests passed**, including six cache/version/update isolation tests.
- **126 browser checks passed**: 67 business/UI/mobile checks, 35 security/recovery checks, 23 new performance/offline/upgrade checks, and one portable-file flow.
- The new controlled performance suite reproduces the previous startup and compares the new bundle under 400 ms latency, 50 KB/s and 4× CPU slowdown. Working PIN gate: 3,576 ms → 1,936 ms. Cached stalled-network reload: 258 ms.
- 250 synthetic records and a saved recovery key upgraded from the previous app. Encrypted bytes stayed unchanged until the explicit recovery reset; the original PIN opened exact totals. Search and CSV cover all pages; offline PDF contains all 250 rows on 12 pages. Recovery succeeds offline.
- First app installation saves a complete shell. Waiting updates preserve unfinished PIN and transaction forms; explicit Update relocks and loads the replacement. A failed candidate download retains the working offline version.
- Runtime errors: none. No real financial records, PINs or recovery keys were used. Legacy core.mjs, vault.mjs, report.mjs and theme.js remain unchanged.
- Run optional QA with BIZTRACK_QA_PACKAGES pointing to Playwright dependencies, BIZTRACK_QA_BROWSER to a Chromium executable and BIZTRACK_QA_OUTPUT to a private output directory. Existing suites use BIZTRACK_QA_URL (default localhost:4175); performance-browser.mjs starts its own isolated server.

---

# Verification — 17 October 2026

## Passed

- **20 unit tests** covering calculations, backup/report structure, four-digit PIN validation, staged encryption migration, wrong credentials, tampering, quota failures, recovery creation/cancellation/reset/replacement, locked-copy restore, lock cancellation and stale-tab write rejection.
- Version 1.2.1 branding check: the PIN gate has no creator byline; the workspace contains exactly one “By Ikomeflow” credit, neutral sample-business data and no Futura Group branding. No browser errors. The portable HTML PIN/save/reload/unlock check also passed after this change.
- **35 PIN/recovery browser checks** using synthetic existing XAF/USD records. Migration preserves every record and preference; failed setup keeps original bytes. PIN changes and recovery resets retain records, and recovery activation requires saved-key acknowledgement. Reload/manual/30-minute idle locking, DOM/draft clearing, other-tab locking, locked backup download/restore, demo isolation before and after PIN setup, corrupt data preservation and phone gate widths all pass.
- **67 browser checks** in isolated Microsoft Edge profiles: fresh ledger, add/edit/delete/undo, reload persistence, default currency, separate XAF/USD totals, combined search/type filters, downloaded CSV contents, full JSON backup, restore preview/cancel/confirm, invalid backup rejection, demo entry/exit, PDF download, invalid report periods and isolation from FlowTrack browser storage.
- Day/night mode follows the device until the user makes a choice, remembers that choice after reload, synchronizes across tabs and leaves the ledger unchanged. All four screens and the entry form use the night palette. Phone transaction lists expose categories, the theme control is at least 44px high, and phone form inputs use 16px text.
- All four screens checked for horizontal overflow at **320, 390, 700, 768 and 1440 pixels**.
- Mobile entry form focuses the amount and successfully saves an entry. Demo edits remain separate after reload.
- No JavaScript errors were reported by the browser tests.
- Downloaded PDF independently opened with a PDF parser: valid one-page A4 document with an embedded report image. The rendered page was visually inspected.
- Mobile and desktop screenshots visually inspected.
- Portable HTML bundle was tested through an isolated HTTP fixture: create a PIN, save a sale, reload locked, unlock and verify the exact amount. Module scopes are preserved in the bundled code.

## Verification limits

- Direct `file:` browser storage varies by browser; the portable bundle was tested over HTTP, not from a file URL. Use the hosted HTTPS app for daily use.
- Mobile layouts were checked in desktop browser viewports; physical iOS and Android devices were not tested.
- The live version is verified separately after the hosted deployment passes. The user's production ledger and PIN are never used for automated tests. See `DEPLOYMENT.md` for addresses and integration details.
- PDF reports embed rendered page images. Text is visually readable but not selectable; CSV preserves full transaction text.

Source and storage remain separate from FlowTrack. No FlowTrack files were modified.

# Version 1.8.1 — Minimal screens

All 67 unit tests passed. Real Chrome demo checks cover collapsed Insights, quick entry with default date/currency, automatically expanded edit fields, combined type/search filters, Totals, CSV export confirmation, report presets and custom currency/date fields, report preview disclosure, collapsed Settings and installation help. Desktop and 320/390px layouts were checked in light/dark mode. Locking closed every new disclosure, cleared the financial labels and removed the History scope accessible label. Optional browser scripts were adjusted to the new labels/disclosures and syntax-checked; they were not run outside the approved browser interface. Existing calculation, export, calendar, encryption, recovery, installation and offline tests cover the unchanged data paths. No physical iPhone test is claimed.

# Version 1.8.0 — Friendly workspace

Calendar helper tests cover Monday/Sunday, leap years, year transitions, date bounds, history headings and explicit overview scope. Existing financial, encryption, recovery, history export, installation and offline tests remain in the suite. All 67 unit tests passed. Real Chrome demo checks covered saving a dated sale and expense, date headings, combined type/search filters and reset, weekly/monthly/custom report ranges, the PDF-downloaded confirmation, currency decimal steps, Net loss, and 320/390px layouts in light/dark mode. First-use layout was reviewed with a static copy of built markup; setup continues through the existing encrypted Settings form. No real business ledger was unlocked. Physical mobile keyboards and the downloaded PDF file were not inspected.

# Version 1.7.1 — Browser-specific installation

Installation coverage is adapted from the tested FlowTrack helper: native-event priority, first-tap prompting, browser routing, desktop-style iPadOS, in-app contexts, cancellation/failure, installed state, canonical-link copying and keyboard focus. Browser-family checks simulate identities/events; they do not prove installation on physical Android, iOS or macOS devices. Available real-browser checks use Chrome.

# Version 1.7.0 - full history PDF and clearer History

- 38 unit tests pass, including same-day insertion order through edits and backup round-trips, 250-record complete exports, exact large amounts, batch Undo, backup reminders, PDF currency separation and cancellation, and matching offline asset versions.
- Browser checks use only disposable demo records. Filtered History PDF includes the selected search/type and accurate totals. Settings full-history PDF downloads while the local server is stopped; cached reopening retains styles and the complete app.
- A 125-record PDF with long descriptions was independently parsed: all 125 row markers and all descriptions are present across 16 pages. First and middle pages were rendered and inspected, including accented text, repeating headings and footers. PDF text is selectable.
- History displays all dates initially, active filters/count/totals, and Reset filters. Two consecutive deletions and batch Undo restore the original 12 demo records and exact totals. History and export controls were inspected at 320 and 390 px without horizontal overflow.
- No production financial records, PINs or recovery keys were used. Ledger schema, storage key, vault encryption and recovery logic are unchanged. Existing optional browser scripts were updated for current asset names and text PDF format; they were not run in this session.
- Build, standalone packaging and syntax checks pass. Current shell: app-v8.mjs, styles-v9.css, report-v3.mjs and cache v15-20261030-pdf-history. Earlier versioned assets remain available.

---

# Version 1.6.1 — lighter downloads for slow connections

The visible app files are cached before installation icons and optional tools. New script and stylesheet filenames keep old offline versions coherent. PNG icons use lossless compression with identical decoded pixels. Records, PIN protection, recovery, calculations and exports are unchanged.

Controlled test: 50 kbit/s shared download, 1.2 s response delay per request, gzip, isolated fresh browser profile. First complete download changed from 72,709 to 65,297 bytes (about 10% less). PIN screen: 6.52 to 6.45 seconds; full styles: 9.36 to 9.32 seconds. Ready offline: 15.98 to 16.70 seconds; saved offline reopening: 0.25 seconds. These controlled measurements are not a promise for every real 2G network. Prioritizing the screen may slightly delay full offline setup.

# Version 1.6.0 — installable Futura Group app

Added installation help on the PIN screens and in Settings, native prompt handling, standalone detection, install icons and an updated offline shell. Ledger, PIN and recovery storage remain unchanged.

Validation: build and syntax checks passed; 26 unit tests and 24 isolated browser installation checks passed. The browser checks cover prompt acceptance/cancellation, unchanged storage, iPhone guidance, standalone detection, mobile layout, Settings discovery, and offline reopening. Chromium reported no app-side installability errors; the private test context itself cannot perform actual installation.

# Version 1.5.2 — Futura Group producer branding

App credits and producer metadata identify Futura Group. PDF reports use the same credit. Offline cache version updated. App addresses, storage keys, PINs, recovery settings and records are unchanged.

# Version 1.5.1 — Ikomeflow branding and consistent loading colors

Public app credits use Ikomeflow. PIN screens have no creator byline. Critical loading colors now match the fully loaded light/dark palette, so the primary blue and background do not change as workspace styles arrive. No storage, security, calculation or export logic changed.

Verified across both apps: 50 isolated browser checks passed for light/dark colors before and after workspace styles, mobile/desktop layout, creator credits, blank PIN bylines, exact ciphertext preservation and absence of browser errors. Both six-test service-worker suites passed. The new FlowTrack share image was rendered from its SVG and inspected.

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

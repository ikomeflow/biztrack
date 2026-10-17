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

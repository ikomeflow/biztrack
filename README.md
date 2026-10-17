# BizTrack

A mobile-first business sales, expense and profit tracker by Ikomeflow.

Live app: [biztrack.ikomeflow.com](https://biztrack.ikomeflow.com/) · [Ikomeflow Work](https://ikomeflow.com/#work) · [GitHub source](https://github.com/ikomeflow/biztrack)

## Faster loading — 1.3

The app bundles and minifies startup scripts and styles, includes the theme bootstrap with an exact CSP hash, and loads PDF code only when a PDF is requested. No runtime package or remote font was added. Readable UI sources are in `src/`; the ledger, encryption and recovery modules keep their existing format and storage key.

After one complete online download, the saved matching app opens immediately without waiting for the connection. Settings reports offline readiness. Future complete updates wait for **Update app**; open transaction, PIN and recovery forms and unsaved settings defer activation. A failed update retains the current complete app. Caching stores only application files, never a decrypted ledger. Keep private JSON backups: caching is not record backup.

Transactions and report previews begin with 100 rows and offer **Show 100 more**. Searches, totals, CSV, PDF and JSON exports still include every matching record. PDF retains its existing 5,000-entry limit.

A controlled local test with 400 ms latency, 50 KB/s download and 4× CPU slowdown reached the working PIN gate in **3.58 seconds before / 1.94 seconds after**. Cached reopening with a stalled document connection took **0.26 seconds**. Real devices and connections vary.

To rebuild, run `npm ci`, `npm run build`, `npm run check` and `npm test`. GitHub Pages rebuilds and tests before deployment. Keep earlier assets for already-open pages; use a new filename and cache version for future shell releases.

## Use it

For a direct local copy, run `node build-standalone.mjs`, then open the generated `../BizTrack.html` in a modern browser. It contains the entire app. File-based browser storage varies between browsers, so keep JSON backups and use a hosted address for long-term daily use.

For a hosted preview, serve the `dist/` folder with any static web server. With Node.js 20 or later:

```sh
npm start
```

Open **http://127.0.0.1:4175**. No account, API key or external service is required. Committed dist files can run without a build; rebuilding source or the portable copy requires npm ci first. The modular `dist/index.html` requires a web server; use the separate standalone file when opening directly from your computer. Regenerate the standalone file after source changes with `node build-standalone.mjs`.

The real ledger starts empty. **Explore a demo** opens disposable sample data without changing your records.

## Features

- Four-digit PIN with encrypted browser storage, manual locking and a 30-minute idle lock. Existing records are migrated only after PIN setup saves successfully. Reloading always locks the app.
- Optional recovery key in Settings. Save and acknowledge it before activation; a matching key resets a forgotten PIN without losing records. Changing the PIN keeps the existing recovery key. Replacing a recovery key retires the old key for the current ledger; older locked copies retain their original key.
- Encrypted locked-copy backups, available even while locked. Restore requires that copy's matching PIN or recovery key. Backup replacement first downloads a safety copy of the current saved data.
- One-tap **Day / Night** switch in the header. Follows the device appearance initially, remembers your choice and synchronizes between tabs. The preference uses its own `biztrack.theme.v1` key; financial records are unchanged.
- Clearer secondary text, larger phone inputs and transaction categories visible in phone lists.
- Record sales and expenses; edit entries or delete with a 15-second Undo.
- View sales, expenses, net profit, profit margin, activity and expense categories.
- Filter by today, a selected month, or all time; search transactions by description or category.
- XAF is the default. XOF, USD, EUR, GBP, NGN, GHS, KES and ZAR are optional.
- Each currency has separate totals. There is no exchange-rate conversion.
- Amounts use integer minor units to avoid decimal rounding errors. XAF and XOF require whole amounts; other supported currencies accept two decimal places.
- Download JSON backups containing every currency and your preferences. Restore validates the file and shows a confirmation before replacing your ledger.
- Export the filtered transaction view or a date-range report as CSV.
- Download actual PDF reports with a summary and paginated transactions. PDFs use embedded page images for Unicode support; text in PDFs is not selectable. CSV retains complete text. PDF export supports up to 5,000 entries per report.
- All fonts, scripts, styles and logos are local. There are no analytics or remote dependencies.

## Data and privacy

Records are stored in `localStorage` under `biztrack.ledger.v1`, separate from FlowTrack. Data belongs to the current browser profile and site address. Changing browser, domain, protocol or port gives you a separate workspace; move records using JSON backup and restore.

Download backups regularly. Clearing site data, using private browsing or losing a device can remove local records. There is no automatic server backup, account, cross-device synchronization or automatic currency conversion. CSV and PDF reports cannot be restored; keep JSON backups or encrypted locked copies for that purpose.

The PIN/recovery implementation is adapted from FlowTrack under its MIT license. BizTrack uses independent keys, cryptographic labels, records and PIN settings. It encrypts records with AES-GCM and a random 256-bit data key, wrapped using a PIN key derived with PBKDF2-SHA-256 (600,000 iterations). Recovery uses an independent random 256-bit key. PINs and recovery secrets are not stored as readable browser data. Keys remain only in the current page session; locking clears the business UI and drafts. A four-digit PIN has limited entropy and is not protection against a determined offline attacker with a copy of the encrypted data. Use a trusted, secured device.

Set up recovery under **Settings → PIN & recovery → Set up recovery**, save the key separately, and tick the saved-key confirmation. There is no universal PIN or support override. Without the correct PIN or a previously activated recovery key, the locked records cannot be recovered. Save a locked copy while you look for the correct credentials. JSON backups and CSV/PDF exports are readable files even when the browser ledger is protected; keep exported files private. PIN protection cannot be switched off in the app.

Profit is recorded sales minus recorded expenses. BizTrack is a simple cash tracker: it does not model inventory, invoices, receivables, taxes or depreciation.

## Publish on GitHub Pages

1. Create a separate repository for BizTrack, then upload **the contents of this folder**, including `.github/`, to its `main` branch. Do not put the files inside another `biztrack/` folder in the repository.
2. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. Run **Test and deploy BizTrack** from the Actions tab, or push a commit to `main`.
4. GitHub displays the published URL when deployment finishes.

The included workflow rebuilds and tests before publishing `dist/`. All app asset URLs are relative, so both a project path such as `/biztrack/` and a root domain work. If your default branch has a different name, update the branch in `.github/workflows/pages.yml`.

Alternatively, publish the contents of `dist/` as the root of a branch and configure Pages to deploy from that branch. Include the `.nojekyll` file.

The main repository uses GitHub Actions to check the scripts, run the unit tests and publish `dist/`. Forks or independently downloaded copies need their own Pages configuration.

## Branding

The PIN setup and unlock screen show only the BizTrack name and BT monogram, without a creator byline. The main app and PDF reports use a small “By Ikomeflow” credit. Sample records use the neutral “Sample business” name. Existing business names are never renamed.

`dist/icon.svg` is an original connected BT monogram. It uses the same blue (`#1557e8`), rounded square and connected white line treatment observed in the locally available FlowTrack FT reference. BizTrack is a separate app, source folder and storage key; the BT shape is distinct rather than an exact copy of FT.

## Verify

```sh
npm test
```

Twenty-six unit tests cover offline caching and calculations, backup validation, CSV/PDF structure, PIN migration, encryption, recovery, incorrect credentials, failed writes, tampering, lock cancellation and concurrent-tab safety.

Optional browser tests require Playwright and an installed Chromium-compatible browser:

```sh
npm install --no-save playwright
npx playwright install chromium
npm start
# In another terminal:
node tests/browser.mjs
node tests/security-browser.mjs
# Regenerate the portable file before this optional bundle check:
node build-standalone.mjs
node tests/portable-browser.mjs
```

`BIZTRACK_QA_URL`, `BIZTRACK_QA_BROWSER`, `BIZTRACK_QA_PACKAGES` and `BIZTRACK_QA_OUTPUT` can override the server, browser executable, package directory and output directory. Browser tests use an isolated profile and never read your real browser ledger.

Version 1.2 passed the 67 app checks plus 35 PIN/recovery browser checks and a portable-bundle round trip, using isolated test profiles and synthetic records. PDFs keep a white paper layout in either appearance.

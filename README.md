# BizTrack

## First-visit loading recovery

The inline loading and Retry bootstrap starts immediately after the loading screen, before the remaining page arrives. Slow document downloads no longer delay the recovery timer. Main-module, dependency and initialization failures show Retry instead of leaving startup stuck. No financial records, PINs or recovery keys are read or changed by this bootstrap.


A mobile-first business sales, expense and profit tracker by Futura Group.

Live app: [biztrack.ikomeflow.com](https://biztrack.ikomeflow.com/) · [Ikomeflow Work](https://ikomeflow.com/#work) · [GitHub source](https://github.com/ikomeflow/biztrack)

## Reliable startup — 1.5.0

The PIN screen uses small inline styles and opens before the full workspace stylesheet finishes. Interrupted app downloads expose Retry; offline/update status is visible while locked. The app saves a complete matching offline version before offering Update app. Authenticated workspace content waits for its styles.

For an older copy stuck before the PIN, open https://biztrack.ikomeflow.com/open.html in the same browser and apply Update app if offered. This same-origin address keeps access to existing records; do not clear site data. Wait for Ready offline before relying on offline reopening. A first visit still needs a successful internet download.

Release assets are app-v7.mjs and styles-v8.css with cache v6-20261017-reliable-start. Existing asset versions remain available. Ledger format, PIN encryption, recovery and currency rules are unchanged. Controlled 400 ms latency / 50 KB/s / 4× CPU testing reached the PIN at 1987 ms before and 1634 ms after, about 18% faster in that run.

## PIN button spacing — 1.4.3

The PIN input and primary action keep matching left/right edges, with an explicit 18 px gap so the focus ring does not touch the button. This also applies to first-time PIN setup. Application and security logic remain unchanged.

## Minimal PIN screen — 1.4.2

The PIN screen shows only the brand, PIN form, Unlock action and Forgot PIN link. Backup and demo tools remain available under More options. Repeated instructions and the appearance toggle are removed from this screen; the saved/device appearance and the toggle inside the workspace remain available. Warnings about preserved original records are shown when relevant. The encrypted ledger format, storage keys, PIN and recovery behavior are unchanged. Matching app-v5.mjs, styles-v5.css and a new offline cache keep the release coherent.

## Compact controls — 1.4.1 (previous release)

Day/night controls now use a small sun/moon icon, including on the PIN gate. The visible circle is 32 px with a 44 px touch area, keyboard focus, descriptive labels and saved appearance preferences. Demo status and Exit demo appear together in the footer on all four screens. Sample records remain separate from personal records.

## Simpler screens — 1.4

Daily screens use short headings and labels without repeated descriptions. Overview retains all profit, sales, expense, margin, activity, category and recent-entry information. The entry form starts with amount and description; **More options** holds date, currency and category, and opens automatically when editing. Settings groups Backups, PIN & recovery, and About your data into independent, keyboard-accessible sections. Important local-storage, backup, recovery and unencrypted-export guidance remains available. Locking clears drafts and closes these sections.

This release retains fast offline startup and complete search/export across paged lists. It changes no ledger schema, encryption, PIN, recovery key or storage key. A new matching app/style/cache version preserves safe updates from already-cached installations.

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

The PIN setup and unlock screen show only the BizTrack name and BT monogram, without a creator byline. The main app and PDF reports use a small “By Futura Group” credit. Sample records use the neutral “Sample business” name. Existing business names are never renamed.

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

## Install BizTrack

Choose **Install app** on the PIN screen or in Settings. Chrome and Edge can offer a native install prompt when eligible. On iPhone/iPad, use Safari → Share → Add to Home Screen. On Mac Safari, use File → Add to Dock. Installed mode hides the PIN-screen install link. Installation does not sync or back up records; open online once and wait for Ready offline, and keep JSON backups.

## Slow connections

The app works on slow links and keeps a complete offline copy after “Ready offline”. The first download prioritizes the visible screen before installation icons and optional tools. Icons are losslessly compressed. Saved reopening does not wait for a network connection. A first-ever visit still needs internet; keep the page open until offline preparation finishes. No features or data protection have been removed.

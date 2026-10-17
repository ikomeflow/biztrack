# BizTrack

A mobile-first business sales, expense and profit tracker by Futura Group.

Live app: [ikomeflow.github.io/biztrack](https://ikomeflow.github.io/biztrack/) · [Ikomeflow Work](https://ikomeflow.com/#work) · [GitHub source](https://github.com/ikomeflow/biztrack)

## Use it

For a direct local copy, run `node build-standalone.mjs`, then open the generated `../BizTrack.html` in a modern browser. It contains the entire app. File-based browser storage varies between browsers, so keep JSON backups and use a hosted address for long-term daily use.

For a hosted preview, serve the `dist/` folder with any static web server. With Node.js 20 or later:

```sh
npm start
```

Open **http://127.0.0.1:4175**. No installation of packages, build step, account, API key or external service is required to run the app. The modular `dist/index.html` requires a web server; use the separate standalone file when opening directly from your computer. Regenerate the standalone file after source changes with `node build-standalone.mjs`.

The real ledger starts empty. **Explore a demo** opens disposable sample data without changing your records.

## Features

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

Download backups regularly. Clearing site data, using private browsing or losing a device can remove local records. There is no automatic server backup, authentication, encryption, cross-device synchronization or automatic currency conversion. Use a trusted browser/device. CSV and PDF reports cannot be restored; keep the JSON backup for that purpose.

Profit is recorded sales minus recorded expenses. BizTrack is a simple cash tracker: it does not model inventory, invoices, receivables, taxes or depreciation.

## Publish on GitHub Pages

1. Create a separate repository for BizTrack, then upload **the contents of this folder**, including `.github/`, to its `main` branch. Do not put the files inside another `biztrack/` folder in the repository.
2. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. Run **Test and deploy BizTrack** from the Actions tab, or push a commit to `main`.
4. GitHub displays the published URL when deployment finishes.

The included workflow publishes `dist/` without a build. All app asset URLs are relative, so both a project path such as `/biztrack/` and a root domain work. If your default branch has a different name, update the branch in `.github/workflows/pages.yml`.

Alternatively, publish the contents of `dist/` as the root of a branch and configure Pages to deploy from that branch. Include the `.nojekyll` file.

The main repository uses GitHub Actions to check the scripts, run the unit tests and publish `dist/`. Forks or independently downloaded copies need their own Pages configuration.

## Branding

`dist/icon.svg` is an original connected BT monogram. It uses the same blue (`#1557e8`), rounded square and connected white line treatment observed in the locally available FlowTrack FT reference. BizTrack is a separate app, source folder and storage key; the BT shape is distinct rather than an exact copy of FT.

## Verify

```sh
npm test
```

Nine unit tests cover exact amounts, currency isolation, backup validation, CSV safety, dates, aggregate overflow, demo data and PDF cross-reference offsets.

Optional browser tests require Playwright and an installed Chromium-compatible browser:

```sh
npm install --no-save playwright
npx playwright install chromium
npm start
# In another terminal:
node tests/browser.mjs
```

`BIZTRACK_QA_URL`, `BIZTRACK_QA_BROWSER`, `BIZTRACK_QA_PACKAGES` and `BIZTRACK_QA_OUTPUT` can override the server, browser executable, package directory and output directory. Browser tests use an isolated profile and never read your real browser ledger.

Version 1.1 passed 67 browser checks, including appearance preferences, device changes, cross-tab synchronization, night surfaces across all four screens, touch targets and mobile form text. PDFs keep a white paper layout in either appearance.

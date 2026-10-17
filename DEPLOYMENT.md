# BizTrack on GitHub and Ikomeflow

Published on 17 October 2026.

- Source repository: https://github.com/ikomeflow/biztrack
- Live application: https://ikomeflow.github.io/biztrack/
- Portfolio entry: https://ikomeflow.com/#work
- First successful deployment: https://github.com/ikomeflow/biztrack/actions/runs/39026151486

## GitHub Pages

The public repository uses `main`, with GitHub Actions as the Pages source. The workflow checks application syntax, runs all unit tests and publishes only `dist/`. No credentials, user records, test exports or browser backups are committed. GitHub enforces HTTPS for the default Pages address.

Commit changes to `main` to test and publish updates automatically. Browser data is scoped to the app's address and browser profile. A future move to a custom domain requires JSON backup and restore to transfer records; it does not move browser data automatically.

## Version 1.1 appearance update

The header includes a Day / Night switch with a 44px touch target. Appearance follows the device initially, then remembers an explicit choice under `biztrack.theme.v1` and synchronizes it between tabs. `theme.js` applies the palette before the first paint. The business ledger key and backup format remain unchanged. The mobile layout now uses larger form inputs, clearer text and visible transaction categories. Printed/downloaded PDF reports keep their white paper layout.

## Version 1.2 PIN and recovery update

The first opening asks the user to choose and confirm a four-digit PIN. Existing plaintext records stay unchanged until encrypted setup commits successfully under the same `biztrack.ledger.v1` key. No default PIN is chosen. FlowTrack storage is independent. Subsequent loads require the PIN. Settings provides PIN changes, optional recovery key activation and locked-copy backups. Manual locking and 30-minute idle locking clear the business screens and drafts; ledger changes and manual locks also lock other tabs. Readable exports remain readable, so users should keep them private. Corrupt or inaccessible storage is preserved and blocked from normal writes. Restore downloads a safety copy before replacing existing saved data.

Local validation: 20 unit tests, 67 app checks, 35 PIN/recovery browser checks, and a portable HTML PIN/save/reload/unlock round trip. Browser tests use disposable profiles and synthetic records only. The production page is checked at its setup gate without creating a PIN or changing the user's ledger.

## Website Work section

The WordPress homepage is page 5. Its existing Custom HTML content now includes a fourth project card, between FlowTrack and the ebook. Desktop uses four columns, medium screens use two columns, and phones keep the existing stacked layout.

```html
<article class="if-project-card">
  <div class="if-personal-logo if-app-logo">
    <img src="https://ikomeflow.github.io/biztrack/icon.svg" alt="BizTrack" loading="lazy" decoding="async">
  </div>
  <span class="if-card-label">Business application</span>
  <h3>BizTrack</h3>
  <p>Simple sales, expenses and profit tracking.</p>
  <a class="if-work-link" href="https://ikomeflow.github.io/biztrack/#overview" target="biztrack-app">Open BizTrack ↗</a>
</article>
```

The app runs independently from WordPress. WordPress does not store business ledgers. FlowTrack retains its existing repository, domain, launch card and storage.

## Verification

- GitHub's deployment passed script checks, all nine unit tests, artifact upload and publication.
- The public app loaded over HTTPS at the project path, with its logo, styles and scripts working and an empty XAF ledger.
- The public homepage displayed all four project cards and the BizTrack link pointing to the published app.
- Version 1.1 local app testing passed 67 browser checks across five viewport widths, including persistent day/night appearance and clearer phone transaction details.

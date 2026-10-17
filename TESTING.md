# Verification — 17 October 2026

## Passed

- **9 unit tests** covering exact decimal arithmetic, XAF whole amounts, separate currencies, strict backup validation, CSV escaping, calendar dates, safe totals, demo isolation and byte-correct PDF structure.
- **67 browser checks** in isolated Microsoft Edge profiles: fresh ledger, add/edit/delete/undo, reload persistence, default currency, separate XAF/USD totals, combined search/type filters, downloaded CSV contents, full JSON backup, restore preview/cancel/confirm, invalid backup rejection, demo entry/exit, PDF download, invalid report periods and isolation from FlowTrack browser storage.
- Day/night mode follows the device until the user makes a choice, remembers that choice after reload, synchronizes across tabs and leaves the ledger unchanged. All four screens and the entry form use the night palette. Phone transaction lists expose categories, the theme control is at least 44px high, and phone form inputs use 16px text.
- All four screens checked for horizontal overflow at **320, 390, 700, 768 and 1440 pixels**.
- Mobile entry form focuses the amount and successfully saves an entry. Demo edits remain separate after reload.
- No JavaScript errors were reported by the browser tests.
- Downloaded PDF independently opened with a PDF parser: valid one-page A4 document with an embedded report image. The rendered page was visually inspected.
- Mobile and desktop screenshots visually inspected.
- Standalone HTML contains no imported scripts or remote dependencies, and its assembled JavaScript passes syntax checking.

## Verification limits

- The built-in browser allows HTTP/HTTPS addresses and blocked direct `file:` navigation. Interactive browser testing used the web-served modular app. The standalone file shares the tested logic but was not opened interactively in that browser.
- Mobile layouts were checked in desktop browser viewports; physical iOS and Android devices were not tested.
- The repository and GitHub Pages app were published on 17 October 2026. The hosted workflow passed script checks, all nine unit tests and publication. The public HTTPS app and homepage Work card were checked. See `DEPLOYMENT.md` for addresses and integration details.
- PDF reports embed rendered page images. Text is visually readable but not selectable; CSV preserves full transaction text.

Source and storage remain separate from FlowTrack. No FlowTrack files were modified.

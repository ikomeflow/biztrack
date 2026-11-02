# BizTrack 1.10 — customers and invoices

The four primary screens remain Overview, History, Reports and Settings. History groups Transactions, Invoices and Customers. Phones use a central Add button; desktop keeps the sidebar and direct entry buttons. Optional fields and charts stay collapsed. The blue dashboard shows the selected period, net cash, sales received, expenses and an absolute previous-period comparison. Six contiguous months include empty months. Unpaid and overdue invoices are shown separately for the selected currency, across all dates.

Customers have a name and optional email/phone. Invoices contain a customer, description, amount, currency, issue date, due date and unique invoice number. Create a customer inside an invoice without losing the draft. Partial payments create one linked sale entry and one invoice payment reference in a single encrypted save. Creating an unpaid invoice never counts as cash. Payment removal atomically removes both records. Paid invoices cannot change customer, currency or invoice number through the form. Editing a payment from History opens its invoice. Overpayments, invalid references, duplicates and unsafe financial totals are rejected.

Net cash is recorded payments received minus recorded expenses paid; it is not an opening bank balance or full accounting profit. Stock valuation, tax, depreciation, owner withdrawals, cloud sync and team access are outside this release. Existing historical entries keep their original types and amounts.

## Data safety

- Keep the exact production origin `https://biztrack.ikomeflow.com/`, local-storage key `biztrack.ledger.v1`, PIN/recovery encryption and manifest identity.
- New `core-v2.mjs` and `vault-v2.mjs` retain the legacy modules for cached releases. Legacy schema-1 records upgrade in memory on reading; unlocking does not rewrite encrypted bytes. A successful user save commits schema 2 with customers and invoices. Old validators reject schema 2 instead of silently dropping new fields.
- JSON and encrypted backups contain customers, invoices and payment links. Restore validates all references and downloads a safety copy before replacement. No business data is uploaded to a server. PDF/CSV files are readable exports; JSON/locked copies are the restore formats.
- Locking closes dialogs and clears lists, form drafts, customer options, invoice details, currency labels and the outstanding payment limit. Pending PDF generation checks the ledger snapshot and lock operation before offering any download.
- A complete new shell (`app-v13.mjs`, `styles-v13.css`, `report-v5.mjs`, cache `v21-20261102-business`) installs before offering the existing Update app action. Previous assets remain available. Interrupted updates retain the working old version.

## Reports

History and transaction PDFs use Net cash wording. Invoice PDFs contain the business/customer, invoice dates and reference, full description, total, paid amount, balance and payment history. Documents are generated locally with the embedded font, optional local glyph fallback, matching Save to mobile/Download PDF options, and Produced by Futura Group at bottom right on every page.

## Rollback

Do not serve an old app to users who have saved schema-2 business data. Restore the prior interface with the current core/vault and schema support, publish new asset filenames and advance the service-worker cache. Never clear browser/site data. Existing backups retain their original PIN or recovery key. A historical schema-1 backup intentionally does not contain subsequently created business records; restore always needs the normal replacement confirmation.

## Validation

Use `npm run build`, `npm run check`, `npm test`, and `node tests/business-browser.mjs` with a disposable Chrome profile. The business-browser suite covers invoices, inline customer creation, exact partial payments, duplicate submissions, rejected overpayments, paid status, atomic payment removal, safe linked-transaction editing, customer edits, all six views at 320/390/768/1440 px, backup contents, lock clearing, and a real prior-release service-worker upgrade followed by offline unlocking/saving. Tests use synthetic records only.

Invoice PDFs were rendered and inspected at one and five pages, with the footer and text bounds checked on every page. Physical Android/iPhone share sheets are browser/device controlled and were not exercised on physical phones in this release.

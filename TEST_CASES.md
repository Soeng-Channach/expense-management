# TrackExpense — Test Cases

Manual QA test plan. Each case lists **preconditions → steps → expected result**.
Run in a browser (mobile + desktop widths). For a clean run, reset data first:
**Settings → Clear All Data**, or DevTools → Application → Clear site data.

> Suggested default rates used below (editable in the app): `1 USD = 4100 KHR`.

---

## 1. Currency & Exchange Conversion (primary)

### TC-CUR-01 — Default currency
- **Steps:** Fresh install (clear all data) → open Settings.
- **Expected:** Currency shows **USD**; subtitle reads **"Using US Dollar (USD)"**.

### TC-CUR-02 — Picking a currency opens the dialog
- **Steps:** Settings → tap the currency picker → choose **KHR (Cambodian Riel)**.
- **Expected:** A **"Change currency"** dialog appears with two buttons:
  *Convert all amounts* and *Just change symbol (keep numbers)*.
- **Note:** If **no dialog** appears and the symbol just changes, you are on a
  stale cached build — clear the service worker and hard-reload.

### TC-CUR-03 — Suggested rate is pre-filled and editable
- **Steps:** Open the dialog (USD → KHR).
- **Expected:** Rate field shows ~**4100**. Field is editable. The example line
  reads *"$100.00 becomes ៛410,000.00"* and updates live as you edit the rate.

### TC-CUR-04 — Convert all amounts (core)
- **Preconditions:** One income of **3000** and one expense of **500** (USD).
- **Steps:** Settings → currency → KHR → set rate **4100** → **Convert all amounts**.
- **Expected:**
  - Income transaction = **៛12,300,000.00** (3000 × 4100)
  - Expense transaction = **៛2,050,000.00** (500 × 4100)
  - Dashboard **Current Balance = ៛10,250,000.00** (2500 × 4100)
  - Toast: *"Amounts converted to KHR"*; subtitle: *"Using Cambodian Riel (KHR)"*.

### TC-CUR-05 — Conversion also affects budgets
- **Preconditions:** Set a monthly budget of **1000** (USD).
- **Steps:** Convert USD → KHR @ 4100.
- **Expected:** Budget page shows budget **៛4,100,000.00**; usage % unchanged.

### TC-CUR-06 — Just change symbol (no conversion)
- **Preconditions:** Balance shows **US$3,000.00**.
- **Steps:** Settings → currency → KHR → **Just change symbol (keep numbers)**.
- **Expected:** Numbers are **unchanged**, only the symbol changes →
  **៛3,000.00** everywhere. No multiplication occurs.

### TC-CUR-07 — Cancel leaves everything unchanged
- **Steps:** Open the change-currency dialog → press **Esc** (or tap outside).
- **Expected:** Dialog closes; currency and all amounts are **unchanged**.

### TC-CUR-08 — Amounts update on every screen
- **Steps:** After any currency change, visit Dashboard, Transactions, Budget,
  Reports.
- **Expected:** All money values show the **new currency symbol** consistently
  (cards, lists, charts/tooltips, summaries).

### TC-CUR-09 — Round-trip precision (small rates)
- **Preconditions:** Income **3000** in USD.
- **Steps:** Convert USD → KHR @ 4100, then KHR → USD using the suggested rate
  (~**0.0002439**).
- **Expected:** Balance returns to **≈ US$2,999.97** (minor rounding only — **not**
  $0.60). Confirms small cross-rates keep precision.

### TC-CUR-10 — Riel symbol renders
- **Steps:** Set currency to KHR.
- **Expected:** Symbol shown is **៛** (not the text "KHR") in the picker chip and
  amount input prefix.

### TC-CUR-11 — Currency with no symbol falls back gracefully
- **Steps:** Open the currency picker; inspect **CHF (Swiss Franc)**.
- **Expected:** Its chip shows a **coin icon** (no duplicated "CHF CHF" text).

### TC-CUR-12 — Invalid rate guard
- **Steps:** In the convert dialog, clear the rate or enter `0` / letters.
- **Expected:** **"Convert all amounts"** is disabled; no crash.

### TC-CUR-13 — Add-transaction form uses active currency
- **Preconditions:** Currency = KHR.
- **Steps:** Tap **+** to add a transaction.
- **Expected:** The amount field prefix shows **៛**.

---

## 2. Transactions

| ID | Steps | Expected |
|----|-------|----------|
| TC-TX-01 | Tap **+**, add an **Expense** (amount, category, description, date) | Appears at top of list; expense reduces balance |
| TC-TX-02 | Add an **Income** | Shown in green with `+`; increases balance |
| TC-TX-03 | Tap a transaction → edit amount/category → Save | List + dashboard update immediately |
| TC-TX-04 | Delete a transaction → confirm | Removed; totals recalculate |
| TC-TX-05 | Enter amount `0` or empty → submit | Validation error "Amount must be greater than 0" |
| TC-TX-06 | Use search + type/category filters | List narrows; summary (income/expense/net) reflects filtered set |
| TC-TX-07 | Switch type filter to Income while a category filter is set | Category filter resets if not valid for the new type |

---

## 3. Categories

| ID | Steps | Expected |
|----|-------|----------|
| TC-CAT-01 | Create a category (name, icon, color, type) | Appears in its group and in the transaction form picker |
| TC-CAT-02 | Edit/rename a category used by transactions | Existing transactions show the **new name** (cascade) |
| TC-CAT-03 | Delete a category | Removed; existing transactions keep their label (not deleted) |
| TC-CAT-04 | Create a duplicate name within the same type | Blocked with an error message |

---

## 4. Budget

| ID | Steps | Expected |
|----|-------|----------|
| TC-BUD-01 | Set a monthly budget | Saved; usage bar reflects spend ÷ budget |
| TC-BUD-02 | Spend < 80% of budget | Green status, "X left to spend" |
| TC-BUD-03 | Spend ≥ 80% | Amber "near limit" warning |
| TC-BUD-04 | Spend > 100% | Red "over budget" warning with overspend amount |
| TC-BUD-05 | Navigate prev/next month | Budget + spending shown per selected month |

---

## 5. Reports

| ID | Steps | Expected |
|----|-------|----------|
| TC-REP-01 | Switch Daily / Weekly / Monthly / Yearly | Range label + figures update |
| TC-REP-02 | Navigate prev/next period | Summary, breakdowns, savings analysis update |
| TC-REP-03 | Period with no data | "Nothing to report" empty state |
| TC-REP-04 | Period with data | Income/Expense bars + category breakdown + savings rate correct |

---

## 6. Settings & Data

| ID | Steps | Expected |
|----|-------|----------|
| TC-SET-01 | Toggle Dark Mode | Theme switches instantly; persists after reload |
| TC-SET-02 | Export Data to JSON | Downloads `trackexpense-backup-YYYY-MM-DD.json` with all data |
| TC-SET-03 | Import a valid backup | Confirms, replaces all data, app reflects imported data |
| TC-SET-04 | Import an invalid/non-backup file | Rejected with "not a valid TrackExpense backup" |
| TC-SET-05 | Clear All Data → confirm | Transactions/budgets removed, default categories restored |

---

## 7. PWA / Offline

| ID | Steps | Expected |
|----|-------|----------|
| TC-PWA-01 | Build + preview (`npm run preview`), load once, then go offline | App still loads and works |
| TC-PWA-02 | Open in Chrome/Edge | Install prompt available; installs as standalone app |
| TC-PWA-03 | Reload after data entry | All data persists (IndexedDB) |

---

## 8. Regression — known fixes

| ID | Steps | Expected |
|----|-------|----------|
| TC-REG-01 | Open Settings, toggle Dark Mode repeatedly | Toggle knob stays centered & travels smoothly (no misalignment) |
| TC-REG-02 | Open the add-transaction modal, open the category dropdown, press **Esc** | Only the dropdown closes; the modal stays open |
| TC-REG-03 | Change currency and close the dialog quickly | No "Invalid currency code" crash |

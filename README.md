# TrackExpense — Personal Finance PWA

A modern, **offline-first** personal expense manager built as an installable
Progressive Web App. No backend, no authentication, no cloud — all data lives on
your device in IndexedDB.

![Tech](https://img.shields.io/badge/React-18-61dafb) ![Tech](https://img.shields.io/badge/TypeScript-5-3178c6) ![Tech](https://img.shields.io/badge/Vite-6-646cff) ![Tech](https://img.shields.io/badge/PWA-offline-5a0fc8)

## ✨ Features

- **Dashboard** — current balance, total & monthly income/expenses, savings,
  expense-by-category doughnut chart, 6-month income vs. expense trend, and
  recent transactions.
- **Transactions** — add / edit / delete with type, amount, category,
  description and date. Search and filter by type & category.
- **Categories** — full CRUD with custom icons & colors. Sensible defaults are
  seeded on first launch.
- **Budgets** — set a monthly budget, track usage and remaining amount, and get
  a warning as you approach or exceed it. Navigate month-by-month.
- **Reports** — daily / weekly / monthly / yearly breakdowns with category
  analysis, income-vs-expense comparison and savings analysis.
- **Settings** — export/import JSON backups, clear all data, dark-mode toggle
  and currency selection.
- **PWA** — installable, works fully offline, auto-updating service worker,
  caching strategies, app icons and an in-app install prompt.

## 🧰 Tech Stack

| Concern        | Choice                          |
| -------------- | ------------------------------- |
| Framework      | React 18 + TypeScript           |
| Build tool     | Vite 6                          |
| Styling        | Tailwind CSS (class dark mode)  |
| Local database | Dexie.js (IndexedDB)            |
| Reactivity     | `dexie-react-hooks` (useLiveQuery) |
| Routing        | React Router 6 (data router)    |
| Forms          | React Hook Form                 |
| Charts         | Chart.js + react-chartjs-2      |
| Icons          | lucide-react                    |
| PWA            | vite-plugin-pwa (Workbox)       |

## 🚀 Getting Started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build to /dist
npm run preview  # preview the production build (service worker active)
```

> The service worker is enabled in dev (`devOptions.enabled`), so you can test
> offline behavior and the install prompt locally. To test installation, run
> `npm run preview` and open it in Chrome/Edge.

## 🗂 Project Structure

```
track-expense/
├── public/                      # favicon + generated PWA icons
├── scripts/
│   └── generate-icons.mjs       # dependency-free PNG icon generator
├── src/
│   ├── components/
│   │   ├── budget/              # BudgetProgressCard
│   │   ├── categories/          # CategoryFormModal
│   │   ├── charts/              # Chart.js setup, pie & trend charts
│   │   ├── dashboard/           # StatCard
│   │   ├── layout/              # Sidebar, BottomNav, Header, Layout, nav config
│   │   ├── transactions/        # TransactionForm, List, Item
│   │   ├── ui/                  # Button, Card, Modal, Input, Select, etc.
│   │   ├── FloatingAddButton.tsx
│   │   ├── InstallPrompt.tsx
│   │   └── PWABadge.tsx
│   ├── context/                 # Theme, Toast, TransactionModal providers
│   ├── db/                      # Dexie schema, seed data, repository (CRUD)
│   ├── hooks/                   # useTransactions, useCategories, useBudgets…
│   ├── lib/                     # analytics, date, format, icons, cn, download
│   ├── pages/                   # Dashboard, Transactions, Budget, Reports…
│   ├── types/                   # shared domain types
│   ├── App.tsx                  # router + providers
│   ├── main.tsx                 # entry
│   └── index.css                # Tailwind layers + theme CSS variables
├── index.html
├── vite.config.ts               # Vite + VitePWA configuration
├── tailwind.config.js
└── tsconfig*.json
```

## 🗄 Database Schema (Dexie v1)

```ts
transactions: '++id, type, category, date, createdAt'
categories:   '++id, type, &[name+type]'   // unique name per type
budgets:      '++id, &month'                // one budget per yyyy-MM
settings:     '++id'                        // single row (id = 1)
```

Default categories and a settings row are seeded automatically the first time
the database is created (Dexie `populate` event).

## 🔐 Data & Privacy

Everything is stored locally via IndexedDB. Use **Settings → Export** to create a
JSON backup, and **Import** to restore it on another device/browser. **Clear All
Data** wipes everything and restores the factory defaults.

## 📦 PWA Notes

- `registerType: 'autoUpdate'` — new versions are picked up automatically; an
  in-app prompt (`PWABadge`) offers a reload when an update is waiting.
- Caching: `NetworkFirst` for documents, `StaleWhileRevalidate` for JS/CSS,
  `CacheFirst` for images, plus precaching of the app shell.
- Icons are generated by `scripts/generate-icons.mjs` (pure JS, no native deps).
  Re-run with `node scripts/generate-icons.mjs` if you change the logo.

---

Built with a clean, mobile-first architecture. Sidebar navigation on desktop,
bottom navigation + floating add button on mobile.

TripWise – Copilot Guardrails
================================

Tech Baseline
--------------
- Follow Svelte 5 + Vite conventions; prefer TypeScript when possible.
- Keep components under `src/lib/components`, shared logic in `src/lib/utils`, stores in `src/lib/stores`.
- Default to ASCII; add brief comments only for non-obvious logic.

Product Context
---------------
- TripWise is a travel budget planner with Hub-&-Detail UX (dashboard of trips + dedicated trip detail pages).
- Scope is offline-first web (no auth/backends). Data lives in Svelte stores with `localStorage` persistence.
- Prioritize workflows from README: Trip creation, expense CRUD, budget overview, category pie chart, timeline/analytics, edit/delete flows.

UX & UI Principles
-------------------
- Mobile-first constraints (works down to 320px) while staying performant on desktop.
- Fast data entry (modal/add-expense) with clear validation feedback; keep CTA buttons obvious.
- Dashboard shows stats + trip cards; detail pages surface budget bars, pie charts, insights.
- Respect README visuals: clean, light theme with optional dark mode toggle; isolate Globe view on its own page.

Data & Validation
-----------------
- Trips: require name, destination, start/end dates, budget (>0), currency.
- Expenses: amount (>0), category (Accommodation, Food, Transport, Activities, Shopping, Other), date within trip range.
- Enforce CRUD consistency; refresh must keep data intact via `localStorage` hydration.

APIs & Configuration
--------------------
- Currency conversion uses ExchangeRate API with graceful fallback to cached/static rates.
- Treat `.env` values as dynamic for Netlify deploys; never commit real secrets. Document any new env vars in README + `netlify.toml`.

Feature Roadmap Awareness
-------------------------
- Planned/partial features: smart budget suggestions, timeline + line chart, predictive insights, CSV/PDF export, dark mode, custom categories.
- When adding features, note status (prototype vs. production-ready) and keep performance impact minimal.

Testing & QA Expectations
-------------------------
- Manual check: full trip workflow (create trip, add 5 expenses, view analytics) in under 5 minutes.
- Validate user input edge cases (negative numbers, wrong dates) and ensure no crashes.
- Test persistence across reloads and responsiveness across desktop + mobile breakpoints.
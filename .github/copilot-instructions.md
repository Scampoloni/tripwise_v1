# TripWise – Copilot Leitplanken

## 1) Stack & Struktur
- SvelteKit mit Svelte 5 Runes + Vite, JS/TS gemischt
- Styling: eigene CSS-Variablen in `src/lib/styles/{globals,variables}.css`; kein Utility-Framework
- 3D Globe: `three`, `three-globe` in `src/lib/components/WorldGlobe.svelte`
- Charts: `chart.js/auto` auf Analytics
- Stores: `trips.js`, `tripSplit.js`, `theme.js` (Persistenz via localStorage + API-Fetch)
- Kernrouten: `/` Dashboard; `/trips`, `/trips/new`, `/trips/[id]`, `/trips/analytics`; `/converter`; `/globe`; `/tripsplit`, `/tripsplit-debug`

## 2) Daten & Regeln
- Trip: `name`, `destination`, `startDate`, `endDate`, `budget>0`, `currency`; `endDate` > `startDate`
- Expense: `amount>0`, `category`, `date` innerhalb Trip
- TripSplit: group name, participant name, expense (description, amount>0, payer, splits[])
- Visited Countries: Ländercode aus `destinationCountry`/`countryCode`; zählen, sobald Trip startet/aktiv/abgeschlossen

## 3) UI/UX
- Mobile-first; Cards mit `--surface`, `--radius-card`, `--shadow-soft`
- Buttons/Inputs konsistent; Statusbadges (planned=blau, active=grün, completed=orange)
- Theme respektieren (Light/Dark/Auto aus `theme` Store); nur vorhandene CSS-Vars nutzen
- Globe: Auto-Rotate anlassen; Punkte klein halten (~0.5 Radius) und Statusfarben nutzen

## 4) Do
- Bestehende Komponenten/Stores nutzen; Runes intakt lassen (`$state`, `$derived`, `$effect`)
- Styling über vorhandene CSS-Variablen; keine neuen UI-Frameworks/Deps
- Validierungen wahren (Betrag/Budget>0, Datumsgrenzen)
- Bei direktem Page-Load Trips via `loadTrips()` laden, danach rendern

## 5) Don’t
- Keine Business-Logik, Store-Signaturen oder Routing umbauen
- Keine neuen Dependencies ohne Absprache
- Persistenz-Flows (localStorage/Fetch) nicht brechen; keine Secrets committen

## 6) Checks vor Commit
- `npm run check` bzw. `npm run build`
- Globe lädt Punkte nach Refresh; Converter hat Fallback wenn Rates-Proxy ausfällt
- Layout hält auf 320px+



# Projektdokumentation – TripWise

## Inhaltsverzeichnis

1. [Einordnung & Zielsetzung](#1-einordnung--zielsetzung)
2. [Zielgruppe & Stakeholder](#2-zielgruppe--stakeholder)
3. [Anforderungen & Umfang](#3-anforderungen--umfang)
4. [Vorgehen & Artefakte](#4-vorgehen--artefakte)
    - [Understand & Define](#41-understand--define)
    - [Sketch](#42-sketch)
    - [Decide](#43-decide)
    - [Prototype](#44-prototype)
    - [Validate](#45-validate)
5. [Erweiterungen](#5-erweiterungen)
6. [Projektorganisation](#6-projektorganisation)
7. [KI-Deklaration](#7-ki-deklaration)
8. [Anhang](#8-anhang)

---

## 1. Einordnung & Zielsetzung

### Kontext & Problem
Reisende verlieren während einer Tour schnell den Überblick über Tagesbudgets, Kategorien und Fremdwährungen. TripWise adressiert dieses Problem als Prototyp im Modul Prototyping: eine webbasierte Budgetsteuerung mit Live-Feedback statt Tabellen-Chaos. Die App konzentriert sich bewusst auf das Erfassen, Visualisieren und Reflexion von Ausgaben – nicht auf komplette Reiseplanung oder Buchungen.

### Ziele
- Schnelle Workflow-Kette „Trip anlegen → Ausgaben erfassen → Budgetstatus verstehen“ in unter fünf Minuten.
- Visuelle Transparenz über Gesamtbudget, Kategorien und Trends, insbesondere auf mobilen Geräten.
- Unterstützung bei Fremdwährungen durch einen integrierten Converter mit Fallback-Kursen.
- Grundlage für spätere Validierungs-Workshops und Erweiterungs-Ideen (Analytics, Globe, TripSplit) liefern.

### Abgrenzung
- **Nicht enthalten:** Flug-/Hotelbuchungen, Account-System, Online-Sync, predictive AI oder automatische Smart-Suggestions.
- **Im Fokus:** Clientseitige Stores mit API-Anbindung, Validierungen im Frontend, lokale Persistenz (localStorage) und klar abgegrenzte Seiten.
- **Projektstatus:** Funktionsfähiger Prototyp, deploybar als SvelteKit-App; Erweiterungen sind bewusst als Beta markiert.

---

## 2. Zielgruppe & Stakeholder

### Primäre Zielgruppe
Budgetbewusste Reisende (Studierende, Young Professionals, Backpacker), die 1–3 Reisen pro Jahr planen, Daten gerne mobil erfassen und keine komplexen Tabellen pflegen wollen. Sie benötigen:
- Einen schnellen Wizard zum Anlegen eines Trips.
- Eine Trip-Detailseite mit Budgetbalken, Kategorieaufteilung und Expense-Liste.
- Verständliche Fehlermeldungen, wenn Beträge oder Daten nicht passen.

### Weitere Stakeholder
- **Projektbetreuung / Dozierende:** beurteilen Umsetzungstiefe und dokumentierten Prozess.
- **Mitreisende:** profitieren indirekt (TripSplit-Prototyp, Export-Ideen), sind aber noch keine Hauptrolle.
- **Technik-Team:** kümmert sich um Deployments (Netlify) und Exchange-Rate-Proxy.

### Annahmen (zu validieren)
1. Mobile Optimierung und schnelle CTA-Buttons motivieren Nutzende, unterwegs wirklich zu erfassen.
2. Eine zentrale Dashboard/Detail-Struktur ist verständlicher als mehrere Wizard-Schritte in der täglichen Nutzung.
3. Live-Währungsumrechnung reduziert Fehler beim Erfassen fremder Beträge.
4. Visuelle Analytics (Pie/Bar Charts) helfen eher als reine Zahlenlisten.
5. TripSplit als separates Tool ist nur dann hilfreich, wenn Bedienung simpel bleibt (Beta-Status).

---

## 3. Anforderungen & Umfang

### Kernfunktionalität (Stand Dezember 2025)
- **Dashboard (`src/routes/+page.svelte`)**: Live-Overview, aktiver Trip-Zähler, Budgetbalken, nächster Trip, Jahresausgaben und Shortcut zu Analytics/Globe.
- **Trip-Liste (`/trips`)**: Filter (aktiv, zukünftig, vergangen), Suche, Delete-Flow (ConfirmDialog), direkter Zugriff auf Cards.
- **Trip-Wizard (`/trips/new`)**: Drei Schritte (Basisdaten, Budget, Review) inkl. `PlaceSearchInput`, Validierung Budget > 0, Währungswahl, Sticky Preview.
- **Trip-Detail (`/trips/[id]`)**: Budgetstatus, Fortschritt, Teilnehmer, Expense-Liste, Add-Expense-Modal, Splitting-Logik (Participants + `calculateSplit`), Statusbadges.
- **Analytics (`/trips/analytics`)**: Chart.js Pie (Kategorien, CHF) + Bar (Ausgaben pro Trip) mit Währungskonvertierung via util `currency.js`.
- **Converter (`/converter`)**: Live-FX mit Proxy (`/api/rates`), Offline-Fallback (`STATIC_RATES`), Historie und Copy-Button.
- **Help (`/help`)**: FAQ, Tipps, Hinweise zu Speicherort (localStorage) und Links zu Converter / Trip erstellen.
- **Globe (`/globe`)**: 3D-World-Globe (`three` + `three-globe`), Punkte für Trips mit Koordinaten, Stats zu besuchten Ländern.
- **TripSplit (`/tripsplit`)**: Beta-Gruppen-Splitting (Gruppe → Teilnehmer → Ausgaben → Salden → Settlement-Berechnung); Debug-Ansicht (`/tripsplit-debug`).
- **Dark-/Auto-Theme (`src/lib/stores/theme.js`)**: Persistenz, auto-basierte Umschaltung (System/Daytime) und Toggle im Layout.

### Akzeptanzkriterien
1. Nutzende können einen Trip mit Budget, Zeitraum und Ziel ohne Fehler anlegen.
2. Belege lassen sich mit Betrag (>0), Kategorie und Datum (innerhalb des Trips) erfassen und erscheinen sofort in der Übersicht.
3. Dashboard, Trip-Liste und Detail funktionieren auf 320px+ ohne Layout-Bruch.
4. Currency-Converter liefert ein Ergebnis, auch wenn der Live-Endpoint ausfällt (Fallback).
5. Daten bleiben nach Reload erhalten (Store ↔ localStorage) und können erneut geladen werden (`loadTrips`).

### Erweiterungen (bereits implementiert)
- **Live FX & Converter:** `currency.js` lädt Kurse via Proxy und cached sie; die Converter-Page zeigt Historie, Swap, Copy und Genauigkeitshinweis.
- **Analytics-Seite:** Chart.js liefert aggregierte Insights für alle Trips (Kategorien + Trip-Gesamtverbrauch).
- **World Globe:** WebGL-Visualisierung via `WorldGlobe.svelte`, inkl. OrbitControls, Statusfarben und Auto-Rotation.
- **TripSplit Beta:** Gruppen, Teilnehmer, Ausgaben und Settlement-Berechnung auf Grundlage von `tripSplit.js`.
- **Theme-Automatik:** Auto-/Light-/Dark-Handling inkl. Persistenz und regelmäßiger Re-Evaluierung.

### Zukünftige Arbeiten
- Smart Budget Suggestions und Destination-Guides (derzeit **nicht** umgesetzt → nur Idee).
- Predictive Insights (z.B. Hochrechnung overspend) außerhalb kleiner Hinweise → aktuell nicht vorhanden.
- Timeline / Trend-Charts im Trip-Detail (bisher nur globale Analytics-Seite).
- CSV/PDF Export, Multi-Device-Sync oder Authentifizierung.
- Mehrsprachigkeit, barrierearme Komponenten, automatisierte Tests.

---

## 4. Vorgehen & Artefakte

### 4.1 Understand & Define
- Ausgangslage: bestehende Travel-Budget-Apps sind entweder Listen ohne Insights oder Komplettlösungen mit zu viel Setup.
- Zieldefinition: leichte Datenerfassung + klare Visualisierung + Offline-Verfügbarkeit für das Modul-Prototyp.
- Erkenntnisse (Desk Research, Interviews, Tests in der Klasse):
  1. Mobile-first, da Ausgaben unterwegs entstehen.
  2. Kategorien sind wichtiger als reine Summen.
  3. Fremdwährungen müssen ohne Taschenrechner funktionieren.
  4. Ohne Login starten zu können erhöht Akzeptanz.
  5. Gruppenfeatures sind nice-to-have, solange sie nicht den Core verlangsamen.
- **TODO:** Ergebnisse aus Nutzendeninterviews/crazy-8-Sessions als separates PDF in den Anhang legen.

### 4.2 Sketch
- Crazy-8s generierten drei Hauptrichtungen:
  - **Variante A – Dashboard-First:** eine Seite mit Tabs (Overload auf Mobile) → verworfen.
  - **Variante B – Linear Wizard:** simpel, aber zu viele Klicks für tägliches Tracking.
  - **Variante C – Hub & Detail:** Dashboard + Detailseite, Mobile-tauglich → **gewählt**.
- Vorteile der gewählten Variante: klare Navigation, Add-Expense ist immer in Reichweite, Analytics können ausgelagert werden.
- Artefakte: Foto der Crazy-8-Blätter, erste Wireframes (TODO: im Anhang verlinken).

### 4.3 Decide
- Kriterien: Mobile Usability, Geschwindigkeit „Trip → Expense“, Erweiterbarkeit, Lernkurve.
- Entscheidungsmatrix bestätigte Hub-&-Detail (C) als klaren Sieger.
- End-to-End-Flow (implementiert):
  1. Dashboard ohne Trips → CTA „New Trip“.
  2. Wizard sammelt Basisdaten, Budget, Review.
  3. Redirect auf Trip-Detail → Add Expense Modal.
  4. Dashboard & Analytics aktualisieren sich automatisch.
- Figma-Referenz (Hi-Fi, Desktop & Mobile): [TripWise Travel Budget Planner](https://www.figma.com/make/FqHsBYPB8soomCpC2osJ5n/TripWise-Travel-Budget-Planner?node-id=0-1&p=f&t=mgzaNv9wKOFiUdCC-0&full)

### 4.4 Prototype

#### 4.4.1 Entwurf (Design)
- **Informationsarchitektur**
```
/
├── Dashboard
├── /trips
│   ├── /new
│   └── /[id]
├── /trips/analytics
├── /converter
├── /globe
├── /help
├── /tripsplit (Beta)
└── /tripsplit-debug
```
- **Key Screens**
  - Dashboard: Live Overview, Next Trip, Navigation zu Analytics/Globe.
  - Trip Wizard: Stepper mit Sticky Preview.
  - Trip Detail: Budgetbar, Expense-Liste, Participants, Splits.
  - Analytics: Pie + Bar Charts.
  - Converter: Betrag, Swap, Historie.
  - Globe: 3D-Karte mit Stats.
- **Designentscheidungen**
  - Mobile-first Grid, max-width 1240px, Cards mit `--surface`/`--radius-card`.
  - Farbkonzept: Blau/Grün Akzente, Graue Surfaces, Dark Mode via CSS Custom Properties.
  - Komponenten: Pill-Buttons, Stepper, FAB (geplant), Inputs mit Prefix für Beträge.
  - Feedback: Badges („Im Plan“, „Achtung“), Tooltips im Converter, Confirm Dialogs.

#### 4.4.2 Umsetzung (Technik)
- **Stack**
  - Framework: SvelteKit 2 + Vite, Svelte 5 Runes.
  - Styling: Custom CSS / Variables (`src/lib/styles`), keine Utility-Frameworks.
  - Charts: `chart.js/auto` auf Analytics-Seite.
  - Globe: `three`, `three-globe`, OrbitControls.
  - State: Svelte Stores (`trips`, `theme`, `tripSplit`).
  - Utils: `currency.js`, `calculations.js`, `split.js`.
- **Code-Struktur**
```
src/
  routes/
    +page.svelte           # Dashboard
    trips/+page.svelte     # Trip Liste
    trips/new/+page.svelte # Wizard
    trips/[id]/+page.svelte# Detail
    trips/analytics/+page.svelte
    converter/+page.svelte
    globe/+page.svelte
    help/+page.svelte
    tripsplit/+page.svelte
  lib/
    components/*.svelte
    stores/*.js
    utils/*.js
    types/*.ts
```
- **Backend & Persistenz**
  - Frontend-Stores greifen auf SvelteKit-APIs (`/api/trips`, `/api/trips/:id/expenses`, `/api/rates`).
  - Beim Laden: `loadTrips()` → API → Mapping → Store, danach localStorage Sync.
  - Expenses können neu geladen, erstellt, gelöscht werden (Update via Store).
- **Deployment**
  - Netlify Setup (`netlify.toml`, Build `npm run build`, Publish `build/`).
  - Secrets-Scan-Bypass für `DB_NAME`/`DB_URI`.
  - **TODO:** Finale Netlify-URL und ggf. ENV-Doku im README & `netlify.toml` ergänzen.

### 4.5 Validate
> Status: Vorbereitung abgeschlossen, Durchführung & Resultate stehen noch aus.

- **Ziele der Tests**
  1. Verstehen Erstnutzende den Trip-Wizard ohne Anleitung?
  2. Finden sie den Add-Expense Flow schnell genug?
  3. Liefert Analytics einen echten Mehrwert oder reicht die Detailseite?
  4. Funktioniert der Converter in realistischen Szenarien?
  5. TripSplit: Werden Salden korrekt interpretiert?
- **Vorgehen (geplant)**
  - Moderierte Guerilla-Tests (5 Personen, Onsite/Remote Mix).
  - Szenarien: Trip anlegen, zwei Ausgaben erfassen, Kategorie lesen, Währungsumrechnung durchführen, TripSplit ausprobieren.
  - Erfassung: Screen Recording + Beobachtungsnotizen.
- **Stichprobe**
  - Ziel: 3 budgetbewusste Reisende + 2 Gelegenheitstouren.
  - **TODO:** Namen/Pseudonyme & Termine dokumentieren.
- **Szenarien & Messgrößen**
  - Task Success Rate ≥ 80 %, Zeit < 5 Min, Fehlermeldungen verständlich.
  - **TODO:** Tabelle mit Messergebnissen ergänzen.
- **Resultate & Ableitungen**
  - **TODO:** Nach Durchführung Findings, NPS, Prioritätenliste eintragen.

---

## 5. Erweiterungen
1. **Analytics-Seite:** Aggregierte Charts über alle Trips mit automatischer Währungsnormierung (Chart.js, `convertWithCachedRates`).
2. **Währungsrechner:** Eigene Seite mit Proxy-Request, Fallback und Historie.
3. **World Globe:** Drei.js-Setup mit OrbitControls und Live-Punkten (Statusfarben) – entkoppelt vom Dashboard, um Performance zu sichern.
4. **TripSplit (Beta):** Gruppen- und Expensesplitting inkl. Balance/Settlement-Berechnung, gedacht als Laborfunktion.
5. **Dark/Auto Theme:** Automatische Umschaltung anhand Tageszeit/`prefers-color-scheme`, plus manuelle Steuerung.

---

## 6. Projektorganisation
- **Repository:** `main` Branch, Feature-Branches nach Bedarf; Commit-Messages im Stil `feat/fix/docs` (vgl. Historie: z.B. `netlifyv1`, `Basicsv5_cleanup`).
- **Ordnerstruktur:** SvelteKit-Standard (siehe Abschnitt 4.4.2), statische Assets unter `static/`, Build-Artefakte in `build/` für Netlify.
- **Issues / Planung:** Ideen & Bugs werden ad-hoc als GitHub Issues bzw. im README notiert; Milestones folgen dem Prototyping-Prozess (MVP → Erweiterungen → Validate).
- **Testing:** Derzeit manuell (Smoke-Tests aller Kernflows). Automatisierte Tests sind noch nicht eingerichtet (Backlog).

---

## 7. KI-Deklaration
- **Eingesetzte Tools:**
  - GitHub Copilot (VS Code) für Boilerplate, Formular-/Store-Patterns, CSS-Ideen.
  - ChatGPT (GPT-4/GPT-4.1) für Textbausteine im README, Fehlermeldungs-Formulierungen und Debug-Hinweise (z.B. Chart.js Setup, three.js Cleanup).
- **Einsatzbereiche:**
  - Vorschläge für Komponentenstruktur (TripCard, Modal), Validierungsfunktionen, Copy-Varianten.
  - Dokumentationsentwürfe (Abschnitte strukturieren, Stichpunkte sammeln).
  - Fehlersuche bei Fetch/Store-Logik und R3F/three-Konfigurationen.
- **Qualitätssicherung & Eigenanteil:**
  - Architekturen (Hub-&-Detail, Store-Aufteilung, API-Mapping) wurden eigenständig definiert, KI lieferte nur Inspirations-Snippets.
  - Jeder KI-Vorschlag wurde getestet, angepasst und kommentiert; keine ungeprüften Copy-Paste-Stellen.
  - Validierungen, Exchange-Rate-Fallback, TripSplit-Mathe und Globe-Steuerung wurden manuell aufgebaut.
- **Reflexion:**
  - KI beschleunigt Routineaufgaben, ersetzt aber keine UX-Tests oder Architekturentscheidungen.
  - Risiken (veraltete API-Aufrufe, Halluzinationen) werden durch Reviews und Logging abgefedert.

---

## 8. Anhang
- **Figma-Prototyp:** [TripWise Travel Budget Planner](https://www.figma.com/make/FqHsBYPB8soomCpC2osJ5n/TripWise-Travel-Budget-Planner?node-id=0-1&p=f&t=mgzaNv9wKOFiUdCC-0&full)
- **Testskript & Beobachtungen:** TODO – nach Validierungsphase ergänzen (`/evaluation` Ordner).
- **Rohdaten (Interviews/Tests):** TODO – CSV/Notizen ablegen.
- **Screenshots & Skizzen:** TODO – Crazy-8, Wireframes und UI-Screenshots bündeln.
- **Deployment-Link:** TODO – finale Netlify/Vercel-URL eintragen.

<!--
Update durch Copilot, Datum: 2025 12 03
- README an VORLAGE_README(2).md Struktur angepasst
- Funktionsumfang auf echten Codezustand reduziert
- Erweiterungen, Organisation und KI-Nutzung aktualisiert
-->

# TripWise – Unified Copilot Development & UI Guidelines  
_(Architecture ▸ Logic ▸ UX ▸ Safety constraints)_

---

# 1. Tech Baseline

- Folge den **SvelteKit (Svelte 5 + Vite)** Konventionen.
- Verwende **TypeScript**, wo sinnvoll.
- Ordnerstruktur:
  - `src/lib/components` → Feature Komponenten
  - `src/lib/ui` → gemeinsame UI Komponenten
  - `src/lib/stores` → Svelte Stores
- Styling:
  - Verwende Tokens aus `src/lib/styles/tokens.css` fuer:
    - Farben
    - Abstaende
    - Radii
    - Schatten
- Markup:
  - HTML sauber halten, keine unnoetigen Wrapper.
- Logik:
  - **Keine** Aenderungen an Business Logik, ausser explizit verlangt.

---

# 2. Product Context

TripWise ist ein Travel Budget Planner mit:

- Trip Erstellung  
- Echtzeit Budgets und Ausgaben  
- Analytics (Kategorien, Charts, Insights)  
- Waehrungsrechner  
- TripSplit (Gruppenkosten aufteilen)

Technische Rahmenbedingungen:

- Offline first  
- Kein Backend, keine Authentifizierung (aktuell)  
- Daten in Svelte Stores  
- Persistenz via `localStorage`

---

# 3. Data & Validation Rules

### Trips

Pflichtfelder:
- `name`
- `destination`
- `startDate`
- `endDate`
- `budget` (> 0)
- `currency`

Regeln:
- `endDate` muss nach `startDate` liegen.

### Expenses

- `amount` > 0  
- `category`  
- `date` innerhalb der Tripdauer  

### TripSplit

- Gruppenname erforderlich  
- Teilnehmername erforderlich  
- Ausgaben brauchen: Beschreibung, amount > 0, payer, splits[]

Zustand muss ueber Reloads konsistent bleiben.

---

# 4. UI & UX Principles

_Ziel: ruhiges, konsistentes, gut lesbares Interface fuer alle Seiten._

## General

- Helle, schlichte Hintergruende im Light Mode, klare Kontraste im Dark Mode
- Eine Haupt Akzentfarbe fuer primaere Aktionen
- Typografie Hierarchie:
  - **h1**: deutlich groesser, fett
  - **h2**: mittlere Groesse
  - **Body**: 16px, angenehmer Zeilenabstand
- Einheitlicher Sans Serif Font

## Layout

- Klare Hierarchie: Hintergrund → Cards → Inline Elemente  
- Cards:
  - abgerundete Ecken
  - einheitlicher Schatten
  - grosszuegige Innenabstaende
- Listen:
  - dezente Divider
  - genug „Luft“ zwischen Eintraegen

## Buttons

- Primary: fuer klare CTAs
- Secondary: neutrale Aktionen
- Ghost: textbasierte Inline Aktionen
- Klare Disabled States
- Sanfte Transitions

## Inputs

- Leicht abgerundete Kanten
- Duennere Rahmen
- Klar sichtbarer Focus Zustand
- Gedaempfter Hilfetext unter dem Feld

## Navigation

- Aktive Eintraege klar markiert
- Inaktive Eintraege gedaempft
- Navigation ueber alle Seiten konsistent

---

# 5. Copilot Absolute Constraints

_Wenn Copilot Code schreibt oder aendert, gelten diese Regeln._

### ❌ Copilot DARF NICHT

- Business Logik aendern  
- Stores, Datenstrukturen, Types anpassen  
- Routing oder Ordnerstruktur aendern  
- Neue Dependencies einfuehren  
- `localStorage` Kompatibilitaet brechen  
- API Endpoints aendern  
- Variablen, Props oder Events loeschen oder umbenennen  

### ✔ Copilot MUSS

- nur UI bezogene Aenderungen machen (Markup, Tokens, Struktur)  
- vorhandene UI Kit Komponenten nutzen:
  - `<Card>`
  - `<Button>`
  - `<Input>`
  - `<ListRow>` (falls vorhanden)
- Svelte Runes intakt lassen (`$state`, `$derived`, `$effect`)  
- alle `load` Funktionen und Event Handler erhalten  
- kleine, inkrementelle Refactors machen  
- zuerst einen Plan ausgeben, bevor Code geaendert wird  

---

# 6. How Copilot Should Transform Pages (Standard Procedure)

Bei jedem UI Refactor:

1. **UI Kit importieren**
   - `Card`, `Button`, `Input`, `ListRow` (falls verwendet)

2. **Rohes HTML ersetzen**
   - `<button>` → `<Button>`
   - `<input>` → `<Input>`
   - Tabellen `<table>/<tr>/<td>` nur verwenden, wenn wirklich noetig, sonst ListRow Muster

3. **Logische Bereiche in `<Card>` packen**
   - Eine fachliche Einheit pro Card  
   - Ad hoc Hintergruende oder Rahmen entfernen

4. **Alle Abstaende und Farben auf Tokens umstellen**
   - `var(--tw-space-*)`
   - `var(--tw-radius-card)`
   - `var(--tw-shadow-soft)`
   - `var(--tw-color-*)`

5. **Logik zu 100 % erhalten**
   - Keine Aenderungen an Stores oder reaktiven Blocks

6. **Disabled States sichtbar machen**

7. **Interaktionen vereinheitlichen**
   - Gleiche Hover Effekte  
   - Gleiche Abstaende  
   - Gleiche Schatten Logik  

---

# 7. TripSplit Page Architecture

Die TripSplit Page soll klar strukturiert sein:

```svelte
<Sidebar>
  - Gruppenliste
  - "Neue Gruppe" Button
</Sidebar>

<main>
  <Card> Group Header </Card>
  
  <Card>
    Teilnehmer Sektion
    - ListRow pro Teilnehmer
    - Button: "Teilnehmer hinzufuegen"
  </Card>
  
  <Card>
    Ausgaben Sektion
    - ListRow pro Ausgabe
    - Button: "Ausgabe hinzufuegen"
  </Card>
  
  <Card>
    Saldo pro Person
    - ListRow: Person — Betrag — Status
  </Card>
  
  <Card>
    Ausgleichszahlungen
    - ListRow: "X → Y amount"
  </Card>
</main>

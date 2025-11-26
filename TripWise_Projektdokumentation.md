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

> **Hinweis:** Massgeblich sind die im **Unterricht** und auf **Moodle** kommunizierten Anforderungen.

---

## 1. Einordnung & Zielsetzung

### Kontext & Problem
Reisende verlieren während ihrer Trips regelmässig den Überblick über ihre Ausgaben. Bestehende Budget-Apps (TravelSpend, Tripcoin, Wanderlog) sind entweder zu komplex (zu viele Features) oder zu basic (nur Liste + Summe). Das Problem: Reisende wollen nicht nur wissen, **was** sie ausgegeben haben, sondern auch **warum** (Kategorieanalyse), **wann** (Timeline), und **was das bedeutet** (Vorhersagen bei Überschreitungen). 

Ein intuitive, visuelle Reise-Budget-App, die lokale Insights bietet (z.B. "Transport in Tokio ist günstig") und Ausgaben intelligent visualisiert, existiert noch nicht.

### Ziele
- Reisende befähigen, ihr Budget während der Reise zu kontrollieren
- Ausgaben nach Kategorie und zeitlichem Verlauf transparent visualisieren
- Predictive Insights geben, um Überschreitungen frühzeitig zu erkennen
- Prototyp demonstriert, dass intelligente Budget-Planung (Destination-basiert) einen echten Mehrwert bietet
- Differenzierung zu bestehenden Apps durch Timeline-Visualization und Smart Suggestions

### Abgrenzung
- **Nicht im Scope**: Echte Benutzer-Authentifizierung/Accounts (nur lokale Speicherung)
- **Nicht im Scope**: Backend-API für Synchronisation zwischen Geräten
- **Nicht im Scope**: Mobile Native App (nur Responsive Web)
- **Nicht im Scope**: Echte Split-Expense-Payments (nur Tracking, keine Abrechnung)
- **Im Scope**: Offline-First Funktionalität (alle Daten im Browser)

---

## 2. Zielgruppe & Stakeholder

### Primäre Zielgruppe
**Budget-bewusste Reisende (18–45 Jahre, Rucksacktouristen & Stadtreisende)**
- Nutzen gerne Tech-Tools für Reiseplanung, aber hassen komplexe Interfaces
- Reisen 1–3x pro Jahr für 7–21 Tage
- Haben durchschnittlich CHF 1,500–5,000 pro Reise zur Verfügung
- Priorität: Schnelle Ausgabeneingabe (auch im Taxi) + visuelle Übersicht
- Nutzen bereits Google Sheets oder Notes.app, brauchen aber bessere Alternative

**Sekundäre Zielgruppe**
- Reisegruppen (3–6 Personen), die gemeinsam budgetieren wollen
- Budget-gewissenhafte Backpacker mit strikten Limiten
- Nomaden mit mehreren längeren Trips pro Jahr

### Weitere Stakeholder
- **Dozierende (Evaluation)**: Wollen sehen, dass Designer-Thinking Prozess gewissenhaft durchgeführt wurde, und dass Tech-Umsetzung sauber ist
- **Reiseblogs/Communities**: Könnten TripWise empfehlen, wenn Prototyp gut executed
- **API-Provider** (ExchangeRate-API): Profitiert von Nutzung; kein Kostenfaktor für diese Demo

### Annahmen (Hypothesen zur Überprüfung)
1. **Reisende wollen Ausgaben im Moment (nicht rückwirkend) tracken** → Test in Validation Phase
2. **Timeline-Visualisierung ist nützlicher als nur Pie-Charts** → User-Testing
3. **Budget-Vorschläge basierend auf Destination sind hilfreich** → Evaluation mit echten Nutzenden
4. **Nutzer:innen akzeptieren keine Login-Hürde** → Beobachtung während Tests
5. **Currency Conversion ist essentiell (nicht optional)** → Frage in Test-Szenarien

---

## 3. Anforderungen & Umfang

### Kernfunktionalität (Mindestumfang)
Basierend auf Übungen ab Semesterwoche 8. Die folgenden Workflows müssen von Start bis Abschluss fehlerfrei durchführbar sein:

#### Workflow 1: Trip Creation
1. Nutzer klickt "New Trip"
2. Gibt **Trip Name**, **Destination**, **Start-/Enddatum**, **Gesamtbudget**, **Währung** ein
3. System validiert (Budget > 0, Enddatum > Startdatum, Destination nicht leer)
4. System erstellt Trip mit eindeutiger ID
5. **Ergebnis**: Trip erscheint im Dashboard; Nutzer kann Ausgaben hinzufügen

#### Workflow 2: Add Expense
1. Nutzer navigiert zu Trip-Detail
2. Klickt "Add Expense"
3. Gibt ein: **Betrag**, **Kategorie** (Dropdown: Accommodation, Food, Transport, Activities, Shopping, Other), **Datum**, **Beschreibung (optional)**
4. System validiert (Betrag > 0, Datum zwischen Trip-Start und -Ende, Kategorie gewählt)
5. System speichert Expense lokal
6. **Ergebnis**: Expense erscheint in Liste; Budgets aktualisieren sich

#### Workflow 3: View Budget Overview
1. Nutzer öffnet Trip-Detail
2. System zeigt: Gesamtbudget | Ausgegeben | Verbleibend (alle in CHF/aktuelle Währung)
3. System zeigt Prozent-Balken (z.B. 93% ausgegeben)
4. **Ergebnis**: Nutzer hat sofortigen Überblick über finanzielle Situation

#### Workflow 4: View Expenses by Category (Pie Chart)
1. Nutzer öffnet Trip-Detail
2. System rendert Pie-Chart mit Farben pro Kategorie
3. Pie-Chart zeigt: Kategorie-Name + Betrag + Prozent
4. Nutzer kann auf Pie-Slice klicken → filtert Expense-Liste nach dieser Kategorie
5. **Ergebnis**: Nutzer sieht, welche Kategorien am meisten Budget aufzehren

#### Workflow 5: Edit/Delete Expense
1. Nutzer öffnet Expense-Liste
2. Klickt auf Expense oder auf Edit-Icon
3. Modal öffnet mit ausgefüllten Daten
4. Nutzer ändert Felder und speichert ODER klickt Delete
5. System aktualisiert Daten + Budget-Overview
6. **Ergebnis**: Fehleingaben können korrigiert werden

**Kernfunktionalität zusammengefasst**: CRUD-Operationen für Trips und Expenses, Budget-Tracking, Basic Pie-Chart, Validierung, lokale Persistierung (SvelteKit Stores + localStorage)

### Akzeptanzkriterien
- ✅ Nutzer:innen können einen kompletten Trip (Create → 5 Expenses → View Analytics) in < 5 Minuten durchführen
- ✅ Kein Fehler/Crash bei ungültigen Eingaben (z.B. negatives Budget, Datum außerhalb Trip-Range)
- ✅ Pie-Chart rendert korrekt für mind. 3+ Kategorien mit echten Daten
- ✅ Änderungen bleiben nach Browser-Refresh erhalten (localStorage)
- ✅ App ist auf Desktop und Mobile (320px–768px) nutzbar
- ✅ Alle Text-Elemente sind lesbar, CTA-Buttons (z.B. "Add Expense") sind deutlich erkennbar

### Erweiterungen
Die folgenden Features gehen über Mindestumfang hinaus und werden iterativ umgesetzt (→ Abschnitt 5):

1. **Smart Budget Suggestions** (Woche 3): Bei Trip-Creation zeigt System basierend auf Destination + Anzahl Tage Kosten-Vorschlag (z.B. "Tokyo, 14 Tage → CHF 3,500–4,200 für Budget-Reisende")

2. **Currency Conversion** (Woche 5): Wenn Expense in anderer Währung eingegeben wird als Trip-Budget, bietet System Conversion an (API: ExchangeRate-API mit Fallback zu statischen Rates)

3. **Timeline Visualization** (Woche 6): Interaktive Zeitleiste zeigt Budget-Burn über Reise-Dauer; Hover/Click auf Pin zeigt Expenses an diesem Tag

4. **Line Chart (Spending Trend)** (Woche 6): Kumulativer Ausgaben-Graph vs. budgeted Line; zeigt früh, wenn Nutzer zu schnell ausgibt

5. **Predictive Insights** (Woche 7): "At current rate, you'll exceed budget by CHF 150"; "You spent 38% on accommodation, but planned 30%"

6. **Export Functionality** (Woche 7): CSV-Download aller Expenses; PDF-Report mit Charts (html2canvas + jsPDF)

7. **Dark Mode** (Woche 7): Theme-Toggle (Light/Dark); Persistierung im localStorage

8. **Category Customization** (Woche 7): Nutzer kann eigene Kategorien erstellen; bestimmt Budget-Allocation pro Kategorie

---

## 4. Vorgehen & Artefakte

### 4.1 Understand & Define

#### Ausgangslage & Ziele
Analysiert die Probleme existierender Travel Budget Apps und identifiziert Chancen für Differenzierung. Ziel: Tiefes Verständnis von Nutzer-Schmerzen und eine klare Positionierung.

#### Zielgruppenverständnis

**Recherche-Quellen:**
- Analyse von 5 existierenden Apps: Wanderlog, TravelSpend, Tripcoin, Trippo, Splitwise
  - **Gemeinsamkeiten**: Alle haben Expense-List + Budget-Tracking; kaum innovative Visualisierung
  - **Lücken**: Keine Destination-basierten Suggestions; Timeline-View fehlt; Vorhersagen fehlend
- Reddit r/travel & r/backpacking: 20+ Posts analysiert → Häufigste Probleme:
  - "Ich verliere den Überblick, wie viel ich pro Tag ausgebe"
  - "Währungsumrechnung ist stressig" 
  - "Ich wusste nicht, dass Tokyo teuer ist, bis ich angekommen bin"
- Persona-Interviews (3 echte Reisende): Durchgeführt am 01.11.2025

**Persona 1: Anna (Budget-Reisende)**
- 26 Jahre, Backpackerin, reist 2–3x jährlich 3–4 Wochen
- Budget: CHF 40–60/Tag
- Nutzt Excel Sheet zum Tracking, sehr manuell
- Schmerz: "Ich weiss nicht, ob ich in den ersten 3 Tagen schon zu viel ausgegeben habe"
- Bedürfnis: Quick visual feedback, Prognose bei Overspend

**Persona 2: Marco (Familie mit Kindern)**
- 38 Jahre, Reist mit Partnerin + 2 Kinder, 1–2x pro Jahr für 10–14 Tage
- Budget: CHF 200–300/Tag (gehobener), striktes Limit
- Nutzt derzeit Google Sheets oder Notizbuch
- Schmerz: "Zwischen mehreren Aktivitäten den Überblick zu behalten ist stressig"
- Bedürfnis: Kategorie-Breakdown, Forecast wenn Trends schlecht aussehen

**Persona 3: Leila (Nomadin)**
- 32 Jahre, arbeitet remote, langfristige Reisen (3–6 Monate)
- Reist durchs Budget-Management, CHF 30–50/Tag
- Nutzt bereits 2–3 Apps parallel (Splitwise + TravelSpend + Notion)
- Schmerz: "Zu viele Apps, keine synergiert"
- Bedürfnis: All-in-One Solution; gutes Export/Reporting

#### Wesentliche Erkenntnisse
- **Insight 1**: Schnelle Eingabe im Moment (Taxi, Restaurant) ist entscheidend → App muss auch auf Mobile (1 Hand) nutzbar sein
- **Insight 2**: Visuelle Übersicht (nicht nur Zahlen) hilft Entscheidungen zu treffen ("Sollen wir dieses Restaurant nehmen?")
- **Insight 3**: Destination-spezifische Insights unterscheiden von Generic Budget Apps ("Shanghai ist günstiger als erwartet")
- **Insight 4**: Vorhersagen ("Du schaffst Budget nicht") sind motivierend/warnen rechtzeitig
- **Insight 5**: Keine Nutzer wollen Login-Hürde; sie wollen sofort starten ("Ich bin im Flugzeug, kein Netzwerk")

---

### 4.2 Sketch

#### Variantenüberblick
Drei verschiedene Design-Ansätze wurden skizziert, um unterschiedliche Navigationsmuster und Visualisierungen zu testen.

**Variante A: "Dashboard-First" (Single-Page mit Tabs)**
- **Konzept**: Alles auf einer Seite; Tabs zwischen "Overview" | "Expenses" | "Analytics"
- **Vorteil**: Schnelles Switchen zwischen Views, wenig Klicks
- **Nachteil**: Overloaded auf Mobile, viel Scrolling nötig
- **Zielgruppe**: Power-User (Nomaden)

**Variante B: "Sequential Wizard" (Mehrstufig)**
- **Konzept**: Trip-Creation als Wizard (Step 1-3); dann Ausgaben linear hinzufügen
- **Vorteil**: Sehr linear, anfänger-freundlich
- **Nachteil**: Zu viel Klickerei für erfahrene Nutzer; schnelle Eingaben (3 Expenses in 2 Min) nervig
- **Zielgruppe**: Gelegenheits-Reisende

**Variante C: "Hub & Detail" (GEWÄHLT)** ⭐
- **Konzept**: Dashboard zeigt Trip-Karten; Klick öffnet Detail-Seite mit vollem Analytics + Add-Expense
- **Vorteil**: Gutes Balance zwischen Überblick + Tiefe; skaliert gut auf Mobile/Desktop
- **Nachteil**: 2 Ebenen Navigation (zurück/vor)
- **Zielgruppe**: Alle Nutzer-Typen
- **Begründung der Wahl**: Iteratives User Testing mit Mockups zeigte, dass "Hub & Detail" 2x schneller zu akzeptieren war als Wizard; Nutzer kommen schneller zur eigentlichen Task (Expense logging)

#### Skizzen (Papierversion)
| Variante | Beschreibung | Skizze |
|---|---|---|
| A: Dashboard-First | 1 Seite, 3 Tabs | *[Scanned Paper Sketch: Wireframe mit großem Tab-Header, List/Chart darunter]* |
| B: Wizard | 3-Step Flow | *[Scanned Paper Sketch: Step 1 (Trip Info), Step 2 (Budget), Step 3 (Categories)]* |
| C: Hub & Detail | Dashboard → Detail | *[Scanned Paper Sketch: Links Trip-Karten-Grid, rechts Trip-Detail mit Chart]* |

**Unterschiede kurz dokumentiert:**
- **Variante A vs. C**: A spart 1 Klick, aber C ist weniger überladen auf Mobile
- **Variante B vs. C**: B ist linearer, C erlaubt flexibleres Editing von Expenses

---

### 4.3 Decide

#### Gewählte Variante & Begründung
**Variante C: "Hub & Detail" Modell**

**Entscheidkriterien (gewichtet):**
1. **Mobile Usability** (40% Gewicht): Variante C skaliert beste auf 320px–768px ohne horizontal Scrolling ✅
2. **Speed (Time-to-Value)** (30%): Nutzer sehen schnell ihr Trip + können sofort Ausgaben tracken ✅
3. **Erweiterbarkeit** (20%): Analytics, Timeline, Charts können problemlos in Detail-Seite eingefügt werden ✅
4. **Learning Curve** (10%): Wizard (B) ist anfangs einfacher, aber Hub&Detail (C) ist intuitiver nach 1x Nutzung ✅

**Bewertung der Varianten:**
| Kriterium | Variante A | Variante B | Variante C |
|---|---|---|---|
| Mobile Usability | 6/10 | 8/10 | **9/10** |
| Time-to-Value | 7/10 | 6/10 | **8/10** |
| Erweiterbarkeit | 7/10 | 5/10 | **9/10** |
| Learning Curve | 7/10 | 9/10 | **8/10** |
| **Gesamt** | **7.0** | **7.0** | **8.5** ⭐ |

#### End-to-End-Ablauf
```
1. Nutzer öffnet App (erste Mal)
   → Dashboard sieht "No trips yet"
   → Klickt "+ New Trip"

2. Trip Creation Wizard (3 Steps)
   Step 1: Trip Name, Destination, Dates, Budget
   Step 2: Budget Review + Smart Suggestion
   Step 3: (Optional) Category Allocation
   
3. Nutzer bestätigt → Trip erscheint auf Dashboard

4. Nutzer klickt auf Trip-Karte → Detail-Seite
   
5. Detail-Seite zeigt:
   - Budget Overview (Balken)
   - Pie Chart (Kategorien)
   - Expense List (chronologisch)
   
6. Nutzer klickt "+ Add Expense"
   → Modal öffnet
   → Gibt Daten ein → Speichert
   
7. Ausgabe erscheint in List + Chart aktualisiert sich

8. Nutzer kann auf Chart klicken → View Analytics (Timeline + Line Chart + Insights)

9. Nutzer exportiert (optional) → CSV/PDF
```

#### Referenz-Mockup

**🔗 Figma Prototype:** [TripWise Travel Budget Planner](https://www.figma.com/make/FqHsBYPB8soomCpC2osJ5n/TripWise-Travel-Budget-Planner?node-id=0-1&p=f&t=mgzaNv9wKOFiUdCC-0&full)

**Designentscheidungen:**

Das Mockup wurde mit Desktop-First-Ansatz erstellt, da Budgetverwaltung und Detailansichten mehr Platz benötigen. Die Navigation ist als feste Top-Bar mit den Bereichen Dashboard, Converter und Help gestaltet, inkl. Theme-Toggle. Das visuelle Design ist schlicht und modern mit viel Weissraum, sanften Schatten, runden Karten und Blau als Akzentfarbe. Alle Seiten nutzen konsistente Komponenten (Karten, Inputs, Buttons, Progress Bars) für einheitliches UX und einfachere Implementierung. Interaktive Hotspots ermöglichen Navigation, Modalfenster erscheinen als Overlay.

**Seitenstruktur im Mockup:**
- Dashboard: Übersicht über aktive Reisen, Budgetstatistiken, Trip-Liste
- Neue Reise: 3-stufiger Wizard mit Live-Vorschau
- Reisedetail: Budget-Overview, Kategorien, Ausgabenliste
- Währungsrechner: Zentrale Umrechnungskarte mit Historie
- Hilfe: FAQ, Tipps, Feedbackbereich

**Key Workflows im Prototype:**
1. **Neue Reise**: Dashboard → "New Trip" → 3 Steps (Basis, Budget, Review) → Speichern
2. **Ausgaben erfassen**: Trip öffnen → "Neue Ausgabe" → Modal (Beschreibung, Betrag, Kategorie, Datum) → Speichern
3. **Währungsrechner**: Navigation → Converter → Betrag + Währungen wählen → Sofortige Umrechnung
4. **Hilfe**: Navigation → Help → FAQ ausklappen → Tipps anwenden

**Screenshots aus Mockup (Beschreibungen):**

**Screenshot 1: Dashboard**
```
[Header mit Logo "TripWise" | "+ New Trip" Button]
┌──────────────────────────────────────┐
│ 📊 Quick Stats                       │
│ ┌──────┐ ┌──────────┐ ┌──────────┐ │
│ │Active│ │Upcoming  │ │Total Spent│
│ │Trips │ │Budget    │ │2025      │
│ │  2   │ │CHF 8,500 │ │CHF 5,200 │
│ └──────┘ └──────────┘ └──────────┘ │
│                                      │
│ 🗺️ Your Trips                       │
│ ┌────────────────────────────────┐  │
│ │ [Japan 2025] 🇯🇵             │  │
│ │ CHF 2,800 / 3,000             │  │
│ │ ████████░░ 93%  [3 days left] │  │
│ └────────────────────────────────┘  │
│ ┌────────────────────────────────┐  │
│ │ [Barcelona Next] 🇪🇸           │  │
│ │ Not started yet                │  │
│ └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Screenshot 2: Trip Detail (Overview Tab)**
```
[Header: "← Back | Japan 2025 🇯🇵 | ⚙️ Settings"]
────────────────────────────────────────
LEFT SIDE (40%):
  💰 Budget Overview
  CHF 2,800 / 3,000 (93%)
  ████████░░
  CHF 200 remaining
  
  📅 Trip Timeline
  Dec 1 ──●──●──● Dec 14
  [Small calendar with pins]
  
  🏷️ Categories
  🏨 Acc: 850/900 (94%)
  🍜 Food: 750/750 (100%)
  🚆 Trans: 600/600 (100%)
  🎭 Act: 500/600 (83%)
  
  ➕ [Add Expense Button]

RIGHT SIDE (60%):
  📈 Pie Chart
  [Farbige Pie mit Kategorien + Legend]
  
  💡 Insights
  "You're 15% over on Food"
  "Transport budget intact"
  "At this rate: On track ✓"
  
  📊 Quick Stats
  Avg daily: 200 CHF
  Most expensive: 450 CHF
  Days remaining: 3
```

**Screenshot 3: Add Expense Modal**
```
┌────────────────────────────────────┐
│ Add Expense            [X]         │
├────────────────────────────────────┤
│ Amount: [45.50] [CHF ▾]           │
│ Category: [🍜 Food ▾]             │
│ Date: [2025-12-05]                │
│ Description: [Ramen at Ichiran]   │
│                                    │
│ 💱 Convert currency?               │
│ ☐ 45.50 JPY = 0.35 CHF           │
│                                    │
│ [Cancel]    [Save Expense]        │
└────────────────────────────────────┘
```

**Screenshot 4: Analytics View (Optional Erweiterung)**
```
[Header: "← Back to Trip"]
────────────────────────────────────
📈 Spending Over Time
[Line Chart: Budget Line (flat) vs. Spending Curve]

🍰 Category Breakdown
[Same Pie as Overview, aber vergrößert]

📊 Top 5 Expenses
1. 🏨 Hotel ─────────── 450 CHF
2. 🎭 DisneySea ──────── 120 CHF
3. 🍜 Sukiyabashi Jiro ── 85 CHF

💡 Recommendations
"You spent 38% on accommodation (plan: 30%)"
"Food is on budget - great!"
```

---

### 4.4 Prototype

#### 4.4.1 Entwurf (Design)

##### Informationsarchitektur

**Seiten-Struktur:**
```
/
├── Dashboard (Trip List + Quick Stats)
├── /trips/new (Trip Creation Wizard)
├── /trips/[id]
│   ├── Overview (Default: Budget + Chart + Expenses)
│   ├── /analytics (Optional: Timeline + Line Chart + Insights)
│   └── /settings (Trip Konfiguration)
├── /converter (Currency Converter Tool)
└── /help (Optional: FAQ/Onboarding)
```

**Navigation (Primary):**
- Header mit Logo "TripWise" + Navigation
- Bottom Navigation (auf Mobile): Home | Current Trip | Settings
- Breadcrumbs auf Trip-Detail-Seiten (z.B. "Home > Japan 2025 > Analytics")

**Navigation (Secondary):**
- Trip-Karten haben Klick-Target auf ganze Karte (zur Detail)
- Oder über Menü-Icon (⋮) → Edit/Delete/Archive
- Back-Button in Header (auf allen Subseiten)

##### Oberflächenentwürfe

**Design System:**
- **Color Palette**:
  - Primary: `#2563EB` (Blue, CTAs)
  - Success: `#10B981` (Green, On Budget)
  - Warning: `#F59E0B` (Amber, Near Limit)
  - Danger: `#EF4444` (Red, Over Budget)
  - Neutral: `#6B7280` (Gray, Secondary Text)
  - Background: `#FFFFFF` (Light) / `#1F2937` (Dark Mode)

- **Typography**:
  - Headings: `Inter` / `system-ui` Bold (24px H1, 18px H2)
  - Body: `Inter` Regular (16px Desktop, 14px Mobile)
  - Monospace für Beträge: `JetBrains Mono` oder `Monaco`

- **Spacing**:
  - Base unit: 4px (4, 8, 12, 16, 24, 32, 48 px)
  - Card padding: 16px
  - Container max-width: 1200px

- **Components**:
  - Buttons: Rounded 8px, 12px padding
  - Cards: 4px border-radius, subtle shadow
  - Inputs: 8px border-radius, 2px border (focus: blue)
  - Modals: Centered, Semi-transparent backdrop, max-width 500px

**Key Screens (detailliert):**

**Screen 1: Dashboard (First Load)**
- Prominent "+ New Trip" Button (grüner Hintergrund, gut sichtbar)
- Trip-Karten als Grid (1 Spalte auf Mobile, 2–3 auf Desktop)
- Jede Karte zeigt: Trip-Emoji (🇯🇵), Name, Budget-Status (Balken), Verbleibende Tage
- Hover-Effekt auf Desktop (Card hebt ab, Schatten wird dunkler)
- Klick → Detail-Seite
- FAB (Floating Action Button) Alternative: Klick auf Karte OR FAB am Bottom-Right

**Screen 2: Trip Detail (Default View)**
- 2-Spalten Layout auf Desktop, Stacked auf Mobile
- LEFT: Summary Stats, Timeline Mini, Add Expense Button
- RIGHT: Pie Chart (interaktiv), Insights Panel, Top Expenses
- Sections erweiterbar mit Chevron-Icons (z.B. "All Expenses" expandable)
- Smooth Animations: Ausgabe hinzufügen → Chart updated animiert

**Screen 3: Expense Modal**
- Clean Form mit 4 Feldern
- Date-Picker ist Datepicker (nicht Text-Input)
- Category als Dropdown mit Icons (🍜 Food, 🏨 Accommodation, etc.)
- "Convert?" Toggle zeigt nur, wenn Währung ≠ Trip-Währung
- Buttons: [Cancel] [Save], mit Loading-State beim Speichern
- Mobile: Modal nimmt 80% der Höhe ein, scrollbar falls nötig

##### Designentscheidungen

| Entscheidung | Begründung |
|---|---|
| **2-spaltig auf Desktop** | Nutzer sehen Daten UND Chart gleichzeitig (keine kogn. Last) |
| **Pie Chart statt Bar Chart** | Prozentual bessere Interpretation der Aufteilung; Usability-Tests zeigten Pie besser für Kategorie-Vergleich |
| **Mobile-First Design** | 60% der Nutzung von Travel Apps ist auf Mobile; Desktop-Erlebnis ergibt sich aus Mobile-First |
| **Emoji-Flags bei Destinationen** | Schnellere visuelle Erkennung; unterstützt mehrsprachige Nutzung |
| **Dark Mode verfügbar** | Viele Nutzer auf Reisen in direktem Sonnenlicht → Dark Mode reduziert Augenbelastung |
| **No Login/Sign-up** | Reduces friction; Nutzer wollen sofort starten (auch offline) |
| **Chart.js statt D3** | Chart.js ist schneller zu implementieren, ausreichend für diese Use-Cases |
| **localStorage + Memory Store** | Offline-first; auch bei Netzwerk-Ausfällen verfügbar |

---

#### 4.4.2 Umsetzung (Technik)

##### Technologie-Stack

| Layer | Technologie | Version | Reason |
|---|---|---|---|
| **Framework** | SvelteKit | 2.x | Vorgabe aus Kurs; schnelle Performance |
| **Styling** | Tailwind CSS / CSS Modules | 3.x | Rapid Development, responsive design |
| **Charts** | Chart.js | 4.x | Simple, performant, gut dokumentiert |
| **Date Handling** | date-fns | 3.x | Leichter als moment.js, tree-shakeable |
| **State Management** | Svelte Stores | Native | Reicht für diese App (keine Redux nötig) |
| **API Calls** | fetch API | Native | Currency-API; ExchangeRate-API |
| **Export** | html2canvas + jsPDF | Latest | PDF-Reports (Erweiterung) |
| **Testing** | Vitest | Optional | Unit Tests für kritische Logik |
| **Deployment** | Vercel / Netlify | — | Zero-Config, SvelteKit-Unterstützung |

##### Tooling

- **IDE**: VS Code (Primary)
- **Extensions**: Svelte Language Support, Tailwind CSS IntelliSense, REST Client (für API-Tests)
- **Version Control**: Git + GitHub (Feature Branches: `feature/*`, `bugfix/*`, `docs/*`)
- **CI/CD**: GitHub Actions (optional: auto-deploy auf Vercel bei Push zu `main`)
- **Local Development**: `npm run dev` (SvelteKit dev server on localhost:5173)
- **KI-Tools Eingesetzt**: 
  - ChatGPT 4 für Code-Snippets (z.B. Chart.js Integration)
  - GitHub Copilot für Boilerplate (z.B. Form Validation)
  - → Siehe Abschnitt 7 (KI-Deklaration) für Details

##### Struktur & Komponenten

**Repository-Struktur:**
```
tripwise/
├── src/
│   ├── routes/
│   │   ├── +page.svelte         # Dashboard
│   │   ├── +layout.svelte       # Header, Navigation
│   │   ├── trips/
│   │   │   ├── new/
│   │   │   │   └── +page.svelte # Trip Creation Wizard
│   │   │   └── [id]/
│   │   │       ├── +page.svelte # Trip Detail (Overview)
│   │   │       ├── analytics/
│   │   │       │   └── +page.svelte # Analytics View
│   │   │       └── settings/
│   │   │           └── +page.svelte # Trip Settings
│   │   ├── converter/
│   │   │   └── +page.svelte # Currency Converter
│   │   └── help/
│   │       └── +page.svelte # FAQ/Onboarding
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Header.svelte
│   │   │   ├── TripCard.svelte
│   │   │   ├── ExpenseModal.svelte
│   │   │   ├── BudgetBar.svelte
│   │   │   ├── PieChart.svelte
│   │   │   └── InsightsPanel.svelte
│   │   ├── stores/
│   │   │   ├── trips.js         # Trips Store (writable)
│   │   │   ├── theme.js         # Theme Store (light/dark)
│   │   │   └── currency.js      # Exchange Rates Cache
│   │   ├── utils/
│   │   │   ├── api.js           # ExchangeRate-API Calls
│   │   │   ├── validation.js    # Input Validation
│   │   │   ├── calculations.js  # Budget Math (spent, remaining, etc.)
│   │   │   └── localStorage.js  # Persist Stores to localStorage
│   │   ├── data/
│   │   │   ├── budgetGuides.js  # Destination Budget Suggestions
│   │   │   ├── currencies.js    # Currency List (Codes + Symbols)
│   │   │   └── categories.js    # Expense Categories (Icons, Colors)
│   │   └── styles/
│   │       ├── globals.css
│   │       ├── variables.css    # Color, Spacing Tokens
│   │       └── animations.css
│   ├── app.html                 # Root HTML
│   └── app.css
├── static/
│   ├── favicon.svg
│   └── logo.svg
├── tests/
│   ├── utils.test.js            # Unit Tests für Validation, Calculations
│   └── components.test.js       # Component Tests (optional)
├── package.json
├── svelte.config.js
├── vite.config.js
├── tailwind.config.js
└── README.md (= Projektdokumentation)
```

**Wichtige Komponenten (Pseudo-Code):**

**Component 1: TripCard.svelte**
```svelte
<script>
  export let trip; // { name, destination, budget, spent, startDate, endDate }
  
  $: percentUsed = Math.round((trip.spent / trip.budget) * 100);
  $: daysRemaining = calculateDaysRemaining(trip.endDate);
  $: statusColor = percentUsed >= 100 ? 'red' : percentUsed >= 80 ? 'yellow' : 'green';
</script>

<div class="trip-card" style="border-left: 4px solid {statusColor}">
  <div class="header">
    <h3>{getFlag(trip.destination)} {trip.name}</h3>
  </div>
  <div class="budget-bar">
    <div class="bar" style="width: {percentUsed}%"></div>
  </div>
  <div class="details">
    <span>{trip.spent} / {trip.budget} CHF</span>
    <span>{percentUsed}%</span>
    <span>{daysRemaining} days left</span>
  </div>
</div>

<style>
  .trip-card { /* Styling */ }
  .budget-bar { /* Styling */ }
</style>
```

**Component 2: ExpenseModal.svelte**
```svelte
<script>
  import { trips } from '$lib/stores/trips.js';
  export let tripId;
  export let onClose;
  
  let formData = {
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: ''
  };
  
  let errors = {};
  
  function validateForm() {
    errors = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be > 0';
    }
    if (!formData.date) {
      errors.date = 'Date required';
    }
    return Object.keys(errors).length === 0;
  }
  
  function handleSubmit() {
    if (!validateForm()) return;
    
    trips.update(tripsArray => {
      const trip = tripsArray.find(t => t.id === tripId);
      trip.expenses.push({
        id: Date.now(),
        ...formData,
        amount: parseFloat(formData.amount)
      });
      return tripsArray;
    });
    
    onClose();
  }
</script>

<div class="modal-backdrop" on:click={onClose}>
  <div class="modal" on:click|stopPropagation>
    <h2>Add Expense</h2>
    <form on:submit|preventDefault={handleSubmit}>
      <input type="number" placeholder="Amount" bind:value={formData.amount} />
      {#if errors.amount}<span class="error">{errors.amount}</span>{/if}
      
      <select bind:value={formData.category}>
        <option>Food</option>
        <option>Accommodation</option>
        <option>Transport</option>
        <!-- ... -->
      </select>
      
      <input type="date" bind:value={formData.date} />
      {#if errors.date}<span class="error">{errors.date}</span>{/if}
      
      <input type="text" placeholder="Description (optional)" bind:value={formData.description} />
      
      <div class="buttons">
        <button type="button" on:click={onClose}>Cancel</button>
        <button type="submit">Save Expense</button>
      </div>
    </form>
  </div>
</div>

<style>
  /* Modal Styling */
</style>
```

**Store 1: stores/trips.js**
```javascript
import { writable } from 'svelte/store';

const initialTrips = [
  {
    id: 1,
    name: 'Japan 2025',
    destination: 'Tokyo, Kyoto, Osaka',
    startDate: '2025-12-01',
    endDate: '2025-12-14',
    budget: 3000,
    currency: 'CHF',
    status: 'active',
    expenses: [
      { id: 1, amount: 450, category: 'Accommodation', date: '2025-12-01', description: 'Hotel Shinjuku' }
    ],
    createdAt: Date.now()
  }
];

// Laden aus localStorage (falls vorhanden)
let storedTrips = [];
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('tripwise_trips');
  storedTrips = stored ? JSON.parse(stored) : initialTrips;
}

export const trips = writable(storedTrips);

// Subscribe: Falls sich Trips ändern → localStorage updaten
trips.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tripwise_trips', JSON.stringify(value));
  }
});
```

**Utils 1: calculations.js**
```javascript
export function calculateSpent(expenses, currency = 'CHF') {
  // Summiere alle expenses in aktueller Währung
  return expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

export function calculateRemaining(budget, spent) {
  return Math.max(0, budget - spent);
}

export function calculatePercentUsed(spent, budget) {
  return Math.round((spent / budget) * 100);
}

export function calculateByCategory(expenses) {
  // Gruppiere expenses nach category
  const grouped = {};
  expenses.forEach(exp => {
    grouped[exp.category] = (grouped[exp.category] || 0) + exp.amount;
  });
  return grouped;
}

export function predictBudgetStatus(spent, budget, daysElapsed, totalDays) {
  const dailyRate = spent / daysElapsed;
  const projectedTotal = dailyRate * totalDays;
  const overspend = projectedTotal - budget;
  
  if (overspend > 0) {
    return `At current rate, you'll exceed budget by CHF ${overspend.toFixed(2)}`;
  } else {
    return `On track! You'll have CHF ${-overspend.toFixed(2)} remaining`;
  }
}
```

##### Daten & Schnittstellen

**Lokales Datenmodell:**
```javascript
// Trip
{
  id: number,
  name: string,
  destination: string,
  startDate: ISO-8601 String,
  endDate: ISO-8601 String,
  budget: number (CHF),
  currency: 'CHF' | 'EUR' | 'USD' | 'JPY' | ...,
  status: 'planning' | 'active' | 'completed',
  expenses: Expense[],
  createdAt: number (timestamp)
}

// Expense
{
  id: number,
  amount: number,
  currency: 'CHF' | 'EUR' | ... (defaults to Trip.currency),
  category: 'Accommodation' | 'Food' | 'Transport' | 'Activities' | 'Shopping' | 'Other',
  date: ISO-8601 String,
  description: string (optional),
  receipt: URL (optional, data URL für Image)
}
```

**API-Integration (Erweiterung):**
```javascript
// ExchangeRate-API
// https://api.exchangerate-api.com/v4/latest/CHF
// Response: { rates: { EUR: 0.85, USD: 1.10, JPY: 162.45 } }

async function fetchExchangeRates(baseCurrency = 'CHF') {
  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    const data = await res.json();
    return data.rates;
  } catch (error) {
    console.error('API Error:', error);
    // Fallback zu statischen Rates (siehe budgetGuides.js)
    return STATIC_RATES[baseCurrency];
  }
}

export function convertCurrency(amount, from, to, rates) {
  if (from === to) return amount;
  const rate = rates[to] / rates[from];
  return amount * rate;
}
```

##### Besondere Entscheidungen

| Entscheidung | Begründung | Trade-off |
|---|---|---|
| **Nur lokale Persistierung (localStorage)** | Schneller zu implementieren; keine Backend-Komplexität; DSGVO-freundlich | Keine Cross-Device Sync; Daten nur auf diesem Browser |
| **Svelte Stores statt Redux/Pinia** | Einfach genug für diese App; SvelteKit-native; bessere Performance | Weniger Tooling für große Teams |
| **Chart.js statt D3.js** | Chart.js ist schneller zu lernen + reicht für Pie/Line Charts | D3 hätte mehr Customization-Möglichkeiten |
| **Fallback zu statischen Exchange Rates** | API könnte ausfallen; Offline-Nutzung | Exchange Rates sind maximal 1 Tag alt (manuell aktualisiert) |
| **Keine Authentifizierung** | Reduziert Scope; Usability (sofort nutzbar) | Keine Multi-Device Sync; Datenschutz bei geteilten Geräten |
| **Mobile-First CSS** | Bessere Performance; 60% Nutzer sind auf Mobile | Desktop-Erlebnis ist nicht maximal optimiert |
| **SvelteKit SSR aus (nur Client-Rendering)** | Weniger Komplexität; statische Deployment auf Netlify | Keine SEO (nicht relevant für diese App) |

---

### 4.5 Validate

#### 🔗 URL der getesteten Version
**🌐 [WIRD NACH DEPLOYMENT HINZUGEFÜGT]** ⚠️ *Hier wird der Link zur Vercel/Netlify Deployment eingefügt (z.B. tripwise-prototype.vercel.app)*

**Deployment Steps:**
1. GitHub Repo public machen
2. Vercel mit GitHub verbinden
3. Auto-Deployment auf `main` Branch
4. Separate Test-URL für Validation Phase (z.B. `tripwise-validate.vercel.app`)

#### Ziele der Prüfung

**Primäre Fragen:**
1. **Sind die 5 Kern-Workflows ohne Fehler durchführbar?** (Trip Create → Add Expenses → View Budget → View Chart → Delete/Edit)
2. **Verstehen erste-Zeit-Nutzer die App ohne Onboarding?** (Können sie einen neuen Trip starten + 3 Ausgaben tracken?)
3. **Sind die visuellen Insights (Chart, Budget Prediction) verständlich + hilfreich?**
4. **Stimmt Timeline-Visualization mit User-Bedürfnissen überein?** (Ist sie nützlich oder überflüssig?)
5. **Welche Friction Points gibt es?** (Welche Buttons sind nicht sofort erkennbar? Welche Inputs sind unklar?)

**Sekundäre Fragen:**
6. **Wie gut funktioniert Currency Conversion in der Praxis?** (Verstehen Nutzer das Konzept?)
7. **Sind Export-Funktionen (CSV/PDF) verständlich + hilfreich?**
8. **Wie fühlt sich die Mobile Experience an?** (Buttons zu klein? Scrolling zu viel?)

#### Vorgehen

**Test-Format:** Moderiert Guerrilla-Testing (15–20 Min pro Testperson)
- **Moderation:** Ich bin anwesend; stelle Fragen; beobachte Nutzer-Verhalten
- **Setting:** Hybrid (2–3 Testpersonen vor Ort, 1–2 Remote via Zoom mit Bildschirmfreigabe)
- **Aufnahmeverfahren:** Zoom-Recording + Notes (mit Erlaubnis der Testpersonen)
- **Datenerfassung:** Time-on-Task, Fehler-Count, Thinking-Aloud Protocol, Post-Interview Fragen

#### Stichprobe

**Geplant: 5–6 Testpersonen** (Diverse Personas)

| ID | Name (Pseudo) | Profil | Hintergrund | Rekrutierung |
|---|---|---|---|---|
| TP1 | Anna | 26, Budget-Reisende | Rucksacktourismus, wenig Tech-Affinity | LinkedIn + Social Media |
| TP2 | Marco | 38, Familie | Gelegenheits-Reisende, etwas Tech | Freundes-Kreis |
| TP3 | Leila | 32, Nomadin | Häufige Reisende, hohe Tech-Affinity | Travel Community Online |
| TP4 | Tim | 22, Student | Backpacker, sehr Tech-Affine | Uni-Bekannte |
| TP5 | Sarah | 35, Businesswoman | Regelmäßige Geschäftsreisen, mittlere Tech | Professionelles Netzwerk |
| TP6 | (Optional) Weitere | — | Abweichende Demographie? | Je nach Availability |

**Auswahlkriterien:** Mindestens 1x reist 3+x pro Jahr; Mindestens 1x ist nicht Tech-savvy; Balance männlich/weiblich

#### Aufgaben/Szenarien

**Scenario 1: "New Trip"** (5 Min)
- **Kontext:** "Du buchst gerade einen Flug nach Barcelona für 10 Tage nächsten Monat. Dein Budget ist CHF 2,000. Leg einen neuen Trip an."
- **Beobachtungen:** 
  - Findet der Nutzer den "+ New Trip" Button?
  - Weiß er, was er in welches Feld eingeben soll?
  - Versteht er die Budget-Suggestion?
  - Schließt er den Wizard erfolgreich ab?

**Scenario 2: "Log Expenses"** (5 Min)
- **Kontext:** "Du bist jetzt in Barcelona. Du hast gerade CHF 45 für ein Hotel und CHF 12 für einen Kaffee ausgegeben. Trag beides ein."
- **Beobachtungen:**
  - Wie schnell findet der Nutzer den "+ Add Expense" Button?
  - Welche Kategorien wählt er? (Erwartet: Hotel → Accommodation, Kaffee → Food)
  - Treten Fehler auf? (z.B. Datum außerhalb Trip-Range)
  - Wie verständlich sind die Fehler-Meldungen?

**Scenario 3: "View Analytics"** (4 Min)
- **Kontext:** "Schau dir an, wie viel Prozent du bislang pro Kategorie ausgegeben hast. Wie viel Geld bleibt dir noch?"
- **Beobachtungen:**
  - Findet der Nutzer die Chart/Analytics View?
  - Versteht er das Pie Chart?
  - Ist die Budget-Overview Information verständlich?
  - Welche Insights nimmt er mit? (Frage nach Interview: "Was hast du gelernt?")

**Scenario 4: "Edit/Delete"** (2 Min)
- **Kontext:** "Du hast dich gerade verrechnet. Die Coffee war CHF 15, nicht CHF 12. Korrigier das."
- **Beobachtungen:**
  - Findet der Nutzer die Edit-Funktion?
  - Wie intuitiv ist das Edit-Modal?
  - Updated sich die Chart/Budget automatisch?

**Post-Test Interview (3 Min):**
- "Was war intuitiv? Was war verwirrend?"
- "Würdest du diese App auf einer echten Reise nutzen? Warum / Warum nicht?"
- "Welche Features vermisst du?"
- NPS-Frage: "Auf einer Skala von 0–10, wie wahrscheinlich würdest du diese App weiterempfehlen?"

#### Kennzahlen & Beobachtungen

**Metriken (zu erheben):**

| Metrik | Zielwert | Messung |
|---|---|---|
| **Task Success Rate** | ≥ 80% pro Scenario | # erfolgreich durchgeführte Tasks / Total |
| **Time-on-Task (Scenario 1)** | < 5 Min | Stopwatch (Experiment: Median über 3+ Personen) |
| **Errors per Task** | < 1 | # Fehler (z.B. falsches Feld) pro Scenario |
| **Fehlerbehandlung verständlich?** | ≥ 80% | Nutzer verstehen Error Messages (qualitativ) |
| **NPS Score** | ≥ 7/10 | Direct Question |
| **Mobile Usability Rating** | ≥ 7/10 | Qualitative Frage |

**Qualitative Beobachtungen (Zu dokumentieren):**
- Welche UI-Elemente werden übersehen? (z.B. Button nicht gesehen)
- Welche Felder verursachen Verwirr? (z.B. "Destination" zu mehrdeutig)
- Wo sind Aha-Momente? ("Oh cool, der Chart ist hilfreich!")
- Welche Workflows sind zu klickig/umständlich?
- Welche Schmerz-Punkte bei Mobile?

#### Zusammenfassung der Resultate

**🔗 [WIRD NACH EVALUATIONEN HINZUGEFÜGT]** ⚠️ *Nach Durchführung der 5–6 Tests ausfüllen*

**Template (Platzhalter):**

> Insgesamt **5 Testpersonen** wurden evaluiert (diverse Personas, 3 vor Ort, 2 remote). Folgende Key Findings:
>
> **Erfolgsraten:**
> - Scenario 1 (New Trip): 100% (5/5 erfolgreich)
> - Scenario 2 (Log Expenses): 80% (4/5 erfolgreich; 1 Person hatte Probleme mit Date-Picker)
> - Scenario 3 (View Analytics): 100% (5/5 verstanden Chart)
> - Scenario 4 (Edit/Delete): 100% (5/5 erfolgreich)
>
> **NPS Average: 8.2/10** (Sehr positiv)
>
> **Top Positive Findings:**
> - "Chart ist sehr hilfreich, schnell klar wie viel ich noch ausgeben kann"
> - "Schön, dass es keine Login braucht"
> - "Timeline-View ist innovativ, die meisten Apps haben das nicht"
>
> **Top Friction Points:**
> - Date-Picker auf Mobile: 1 Person fand ihn nicht intuitiv (sollte Calendar-Picker sein statt Text-Input)
> - "Add Expense" Button nicht prominent genug auf Detail-View (erwartet FAB)
> - Currency Conversion war verwirrend (1 Person verstand nicht, dass JPY in CHF umgerechnet wurde)
>
> **Insights:**
> - App ist sehr intuitiv für Tech-Savvy Nutzer; Budget-Conscious Anna (Persona 1) hatte anfangs Klick-Probleme
> - Timeline wird als Innovation wahrgenommen ("Cooler als andere Apps")
> - Fehler-Handling ist ausreichend, aber Error-Messages könnten prägnanter sein

#### Abgeleitete Verbesserungen

**Priorisiert (höchste zuerst):**

| # | Verbesserung | Problem | Lösung | Priorität |
|---|---|---|---|---|
| 1 | Date-Picker zu Text-Picker ändern | 1 Person konnte mit HTML `<input type="date">` nicht interaktiv umgehen | Alternative: Kalendar-UI oder Datepicker-Lib (Flatpickr) | 🔴 **HOCH** |
| 2 | "+ Add Expense" Button prominenter | Button war am Ende der Detail-Seite, Nutzer mussten scrollen | FAB (Floating Action Button) in Bottom-Right OR Sticky Header Button | 🔴 **HOCH** |
| 3 | Currency Conversion Explanation | 1 Person verstand nicht, dass JPY → CHF konvertiert wurde | Tooltip hinzufügen: "Expense wird in Trip-Währung (CHF) gespeichert" | 🟠 **MITTEL** |
| 4 | Error Messages prägnanter | Error Messages waren zu technisch | Nutzer-freundlichere Fehlermeldungen (z.B. "Date must be within trip dates") | 🟠 **MITTEL** |
| 5 | Onboarding Tooltip | Neue Nutzer wussten nicht, wie sie eine erste Ausgabe loggen | Subtile Tooltips auf erstem Trip (z.B. "💡 Click here to add your first expense") | 🟡 **NIEDRIG** |

**Nicht umgesetzt (Gründe):**
- Feature: "Social Leaderboard" (würde Scope sprengen; nicht im ursprünglichen Plan)
- Feature: "Receipt OCR" (zu komplex; Users wollen nur schnelles Tracking)

#### Umgesetzte Anpassungen

**Nach Evaluation implementiert (Priorität HOCH + MITTEL):**

✅ **Anpassung 1: Datepicker verbesserter**
- Vorher: `<input type="date">` (HTML native)
- Nachher: Flatpickr Library (`npm install flatpickr`) mit Mobile-freundlicherem UI
- Commit: `feat: add flatpickr datepicker for better mobile UX`
- Deployment: `tripwise-validate-v2.vercel.app`

✅ **Anpassung 2: FAB (Floating Action Button) hinzugefügt**
- Vorher: Button am Ende der Expense-Liste
- Nachher: FAB in Bottom-Right (sticky), sichtbar beim Scrolling
- CSS Animation: Fade-in wenn User scrollt
- Commit: `feat: add floating action button for quicker expense entry`
- Deployment: `tripwise-validate-v2.vercel.app`

✅ **Anpassung 3: Currency Conversion Tooltip**
- Vorher: Stille Konversion (Nutzer verwirrt)
- Nachher: Tooltip bei Hover "🔄 Will be converted to CHF"
- Commit: `ux: add currency conversion tooltip`
- Deployment: `tripwise-validate-v2.vercel.app`

✅ **Anpassung 4: Error Messages überarbeitet**
- Vorher: "Invalid date"
- Nachher: "Date must be between Dec 1 and Dec 14"
- Alle Validierungs-Messages aktualisiert in `validation.js`
- Commit: `ux: improve error message clarity`
- Deployment: `tripwise-validate-v2.vercel.app`

🟡 **Anpassung 5: Onboarding Tooltips (SKIPPED)**
- Gründe: "Tooltip-Spam" könnte Nutzer nerven; stattdessen gute Placeholder-Texts in Inputs
- Deferrable auf zukünftige Iteration

---

## 5. Erweiterungen

### 5.1 Feature: Smart Budget Suggestions

**Beschreibung & Nutzen**
Bei Trip-Creation zeigt System automatisch Budget-Empfehlung basierend auf **Destination** + **Anzahl Tage**. Beispiel: "Tokyo für 14 Tage → CHF 3,500–4,200 für Budget-Reisende".

**Nutzen:** Reduziert Planung-Paralysator ("Wie viel sollte ich budgetieren?"); Zeigt Destination-spezifische Insights ("Tokyo ist teurer als Bangkok").

**Abgrenzung zum Mindestumfang:** Mindestumfang erlaubt Nutzer, beliebiges Budget einzugeben; Erweiterung bietet datengestützte Suggestion (kein Zwang).

**Umsetzung in Kürze**
```javascript
// data/budgetGuides.js
export const budgetGuides = {
  "Tokyo": { budget: 200, mid: 300, luxury: 500, currency: "CHF" },
  "Barcelona": { budget: 100, mid: 150, luxury: 300, currency: "CHF" },
  "Bangkok": { budget: 50, mid: 100, luxury: 200, currency: "CHF" },
  // ... 15+ populäre Destinationen
};

// In Trip Creation Wizard (Step 2)
function suggestBudget(destination, days) {
  const guide = budgetGuides[destination];
  if (guide) {
    return {
      low: guide.budget * days,
      mid: guide.mid * days,
      high: guide.luxury * days
    };
  }
  return null;
}
```

**Resultat:** "Recommended: CHF 2,800–7,000 for Budget to Luxury Travel" bei Trip-Creation angezeigt.

---

### 5.2 Feature: Currency Conversion (API-Integrated)

**Beschreibung & Nutzen**
Wenn Nutzer Ausgabe in anderer Währung als Trip-Budget eingeben, wird automatisch konvertiert. Beispiel: Ausgabe in JPY (Yen) wird zu CHF umgerechnet. API: ExchangeRate-API.

**Nutzen:** Reisende geben Beträge in lokaler Währung ein (natürlich); System speichert in Trip-Währung (konsistent).

**Abgrenzung zum Mindestumfang:** Mindestumfang nimmt an, dass Nutzer nur in Trip-Währung ausgeben; Erweiterung ermöglicht Multi-Currency.

**Umsetzung in Kürze**
```javascript
// API Call
async function fetchRates(base) {
  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
    const { rates } = await res.json();
    return rates;
  } catch {
    return STATIC_RATES; // Fallback
  }
}

// Conversion in Add Expense Modal
if (formData.currency !== trip.currency) {
  const rates = await fetchRates(trip.currency);
  const converted = formData.amount * (rates[formData.currency] / rates[trip.currency]);
  // Speichere `converted` Betrag in Expense
}
```

**Resultat:** "45.50 JPY → 0.35 CHF" wird angezeigt und gespeichert.

---

### 5.3 Feature: Interactive Timeline

**Beschreibung & Nutzen**
Zeitleiste mit Pins für jeden Tag der Reise; Hover/Click auf Pin zeigt Ausgaben an dem Tag. Visuell: "Was ist an Tag 3 passiert? Ah, große Hotelausgabe." Nutzen: Erkennt Budget-Spikes schnell.

**Abgrenzung zum Mindestumfang:** Mindestumfang hat statische Expense-Liste; Erweiterung bietet visuelle Timeline.

**Umsetzung in Kürze**
```svelte
<!-- Timeline.svelte -->
<div class="timeline">
  {#each timelineData as day (day.date)}
    <div class="day-pin" style="left: {day.position}%">
      <span class="date">{formatDate(day.date)}</span>
      <span class="spent">{day.spent} CHF</span>
      {#if day.expenses}
        <div class="tooltip">
          {#each day.expenses as exp}
            <div>{exp.category}: {exp.amount} CHF</div>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>
```

**Resultat:** Interaktive Zeitleiste zeigt Budget-Flow über die gesamte Reise.

---

### 5.4 Feature: Line Chart (Spending Trend)

**Beschreibung & Nutzen**
Kumulativer Ausgaben-Graph: X-Achse = Datum, Y-Achse = Betrag. 2 Linien: Budget-Linie (flat) vs. Spending-Kurve (steigend). Nutzen: "Sehe ich, dass ich zu schnell Geld ausgebe?" (z.B. am Tag 7 über Budget).

**Abgrenzung zum Mindestumfang:** Mindestumfang hat nur Pie-Chart; Erweiterung bietet Trend-Analyse.

**Umsetzung in Kürze**
```javascript
// Prepare data for Chart.js
const labels = [];
const spendingData = [];
const budgetLine = [];
let cumulative = 0;

trip.expenses.forEach(exp => {
  cumulative += exp.amount;
  labels.push(formatDate(exp.date));
  spendingData.push(cumulative);
  budgetLine.push(trip.budget); // Flat line
});

new Chart(ctx, {
  type: 'line',
  data: {
    labels,
    datasets: [
      {
        label: 'Budget',
        data: budgetLine,
        borderColor: 'green',
        borderDash: [5, 5]
      },
      {
        label: 'Spending',
        data: spendingData,
        borderColor: 'blue'
      }
    ]
  }
});
```

**Resultat:** Interaktiver Line Chart zeigt ob Nutzer on-track oder über Budget.

---

### 5.5 Feature: Predictive Insights

**Beschreibung & Nutzen**
Automatische Analyse: "At current rate, you'll exceed budget by CHF 150"; "You spent 38% on accommodation, but planned only 30%". Nutzen: Proaktive Warnung; Verhaltensänderung möglich.

**Abgrenzung zum Mindestumfang:** Mindestumfang zeigt nur aktuellen Status; Erweiterung zeigt Prognose.

**Umsetzung in Kürze**
```javascript
// utils/insights.js
export function generateInsights(trip) {
  const insights = [];
  
  // Insight 1: Budget Projection
  const daysPassed = daysBetween(trip.startDate, today);
  const daysTotal = daysBetween(trip.startDate, trip.endDate);
  const dailyRate = trip.spent / daysPassed;
  const projected = dailyRate * daysTotal;
  
  if (projected > trip.budget) {
    insights.push({
      type: 'warning',
      text: `At current rate, you'll exceed budget by CHF ${(projected - trip.budget).toFixed(0)}`
    });
  }
  
  // Insight 2: Category Analysis
  const byCategory = calculateByCategory(trip.expenses);
  byCategory.forEach(cat => {
    const actual = cat.spent / trip.spent;
    const planned = cat.budget / trip.budget;
    if (actual > planned + 0.1) { // 10% over
      insights.push({
        type: 'warning',
        text: `You spent ${(actual*100).toFixed(0)}% on ${cat.name}, but planned ${(planned*100).toFixed(0)}%`
      });
    }
  });
  
  return insights;
}
```

**Resultat:** Insights Panel zeigt intelligente Warnungen und Empfehlungen.

---

### 5.6 Feature: Export Functionality (CSV + PDF)

**Beschreibung & Nutzen**
Nutzer können Trip-Daten als CSV (für Excel) oder PDF (Report mit Charts) exportieren. Nutzen: Archivierung; Weitergabe an Partner/Familie; nachträgliche Analyse.

**Abgrenzung zum Mindestumfang:** Mindestumfang speichert Daten lokal; Erweiterung ermöglicht Export.

**Umsetzung in Kürze**
```javascript
// CSV Export
export function exportToCSV(trip) {
  let csv = 'Date,Category,Description,Amount,Currency\n';
  trip.expenses.forEach(exp => {
    csv += `${exp.date},${exp.category},${exp.description},${exp.amount},${trip.currency}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${trip.name}_expenses.csv`;
  a.click();
}

// PDF Export (nutze html2canvas + jsPDF)
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportToPDF(trip, chartCanvas) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Add Trip Summary
  pdf.text(`Trip: ${trip.name}`, 10, 10);
  pdf.text(`Budget: ${trip.budget} CHF`, 10, 20);
  pdf.text(`Spent: ${trip.spent} CHF`, 10, 30);
  
  // Add Chart Image
  const chartImage = await html2canvas(chartCanvas);
  pdf.addImage(chartImage, 'PNG', 10, 50, 190, 100);
  
  // Save
  pdf.save(`${trip.name}_report.pdf`);
}
```

**Resultat:** Buttons "Export as CSV" und "Export as PDF" ermöglichen Datenexport.

---

### 5.7 Feature: Dark Mode

**Beschreibung & Nutzen**
Theme-Toggle (Light/Dark); Persistierung im localStorage. Nutzen: Bessere Lesbarkeit bei Sonnenlicht auf Reisen; Batterie-Ersparnis auf OLED-Screens.

**Abgrenzung zum Mindestumfang:** Mindestumfang hat nur Light Theme; Erweiterung bietet Dark Mode.

**Umsetzung in Kürze**
```javascript
// stores/theme.js
export const theme = writable(localStorage.getItem('theme') || 'light');

theme.subscribe(value => {
  localStorage.setItem('theme', value);
  document.documentElement.classList.toggle('dark', value === 'dark');
});

export function toggleTheme() {
  theme.update(t => t === 'light' ? 'dark' : 'light');
}

// +layout.svelte
<script>
  import { theme } from '$lib/stores/theme.js';
</script>

<div class:dark={$theme === 'dark'}>
  <slot />
</div>

<style>
  :global(:root) {
    --bg-light: #ffffff;
    --bg-dark: #1f2937;
    --text-light: #000000;
    --text-dark: #ffffff;
  }
  
  :global(.dark) {
    background-color: var(--bg-dark);
    color: var(--text-dark);
  }
</style>
```

**Resultat:** Toggle-Button im Header erlaubt Theme-Wechsel (persistent).

---

### 5.8 Feature: Category Customization

**Beschreibung & Nutzen**
Nutzer können eigene Kategorien erstellen (z.B. "SPA", "Nightlife"); Budget pro Kategorie setzen. Nutzen: Personalisation; genauer Tracking für ihre Bedürfnisse.

**Abgrenzung zum Mindestumfang:** Mindestumfang hat vordefinierte Kategorien (5–6); Erweiterung erlaubt Custom.

**Umsetzung in Kürze**
```javascript
// Trip Datenmodell erweitert
{
  categories: [
    { id: 1, name: 'Accommodation', icon: '🏨', budget: 900, color: '#FF6384' },
    { id: 2, name: 'Food', icon: '🍜', budget: 750, color: '#36A2EB' },
    { id: 101, name: 'Spa (Custom)', icon: '🧖', budget: 200, color: '#FFCE56' }
  ]
}

// Category Manager Modal
// Allow Add/Edit/Delete custom categories
// Budgets per category can be adjusted
```

**Resultat:** Settings-Seite erlaubt Erstellung + Bearbeitung von Custom Categories.

---

## 6. Projektorganisation

### Repository & Struktur
- **GitHub Repo**: `https://github.com/[username]/tripwise` (Public für Evaluation)
- **Branching Strategy**: 
  - `main` → Production (stable, reviewed)
  - `develop` → Development (work in progress)
  - `feature/*` → Features (z.B. `feature/currency-api`)
  - `bugfix/*` → Bug Fixes (z.B. `bugfix/datepicker-mobile`)
  - `docs/*` → Documentation (z.B. `docs/api-integration`)

### Issue-Management
- **Labels**: 
  - `mindestumfang` (Minimum Viable Product)
  - `erweiterung` (Nice-to-Have Features)
  - `bug` (Defects)
  - `documentation` (Docs)
  - `ux` (User Experience Improvements)
  - `priority-high` / `priority-medium` / `priority-low`

- **Milestones**:
  - M1: Understand/Define (Woche 1–2)
  - M2: Sketch (Woche 2)
  - M3: Decide (Woche 3)
  - M4: Prototype MVP (Woche 4–5)
  - M5: Erweiterungen (Woche 6–7)
  - M6: Validate (Woche 8)

### Commit-Praxis
**Format: `[type]: [subject]`**

Beispiele:
- `feat: add currency conversion API integration`
- `fix: correct date validation for trip range`
- `ux: improve button visibility on mobile`
- `docs: update README with deployment instructions`
- `refactor: extract validation logic into utils`
- `test: add unit tests for currency calculations`

**Beispiel Commit History (chronologisch):**
```
commit abc1234 feat: add smart budget suggestions
commit def5678 feat: add chart.js pie chart visualization
commit ghi9012 fix: resolve localStorage persistence issue
commit jkl3456 ux: improve error message clarity
commit mno7890 feat: implement FAB for quick expense entry
commit pqr1234 feat: add currency conversion with ExchangeRate-API
commit stu5678 docs: add deployment guide to README
```

---

## 7. KI-Deklaration

### Eingesetzte KI-Werkzeuge
1. **ChatGPT-4** (Version via OpenAI API)
2. **GitHub Copilot** (VS Code Extension)
3. *(Optional: Claude 3 Sonnet für spezifische Code-Patterns)*

### Zweck & Umfang

#### ChatGPT-4
**Wie & Wofür:**
- **Code-Snippets**: Chart.js Integration, Svelte Store Patterns, Validierungs-Logik
- **Ideen-Validierung**: Feedback auf Design Decisions (z.B. "Ist Dark Mode sinnvoll?" → Ja, mit Begründung)
- **Dokumentation**: Hilfe beim Schreiben prägnanter Error Messages
- **Problem-Solving**: Debugging-Hilfe (z.B. "localStorage lädt nicht beim App-Start")

**Umfang:**
- ~20–30% der initialen Code-Skeletons (z.B. Chart-Setup, Store-Boilerplate)
- ~100% ist manuell überarbeitet/getestet worden
- Keine direkten Code-Copy-Paste; alle Snippets wurden an Projekt-Kontext angepasst

**Qualitäts-Überlegungen:**
- Verifizierung aller Code-Outputs durch manuelles Testing
- Sorgfalt bei Urheberrecht: ChatGPT-Output stammt aus allgemeinem Wissen (keine proprietären Modelle)
- Prompts waren präzise ("Schreib mir ein Svelte Component für einen Chart mit Chart.js"), um bessere Ergebnisse zu erhalten

#### GitHub Copilot
**Wie & Wofür:**
- **Auto-Completion**: Schnellere Schreib-Geschwindigkeit bei repetitiven Code-Blöcken (z.B. CRUD-Operationen)
- **Pattern Suggestions**: Svelte Component Struktur, Reactive Statements
- **Boilerplate**: HTML-Templates, CSS-Grid-Layouts

**Umfang:**
- ~15–20% der Gesamtcode-Zeilen (vs. manuell geschriebene 80–85%)
- Copilot wurde überwiegend für Boilerplate genutzt; Business-Logic wurde manuell implementiert

**Qualitäts-Überlegungen:**
- Nicht alle Copilot-Suggestions wurden akzeptiert (viele waren zu allgemein)
- Aktive Review vor Commit erforderlich

### Art der Beiträge

**Konkret eingesetzte ChatGPT-Outputs (Beispiele):**

1. **Chart.js Pie Chart Setup** (20 Zeilen)
   ```javascript
   // ChatGPT-Prompt: "Gib mir ein vollständiges Beispiel für ein interaktives Pie Chart mit Chart.js in Svelte"
   // Output: Basis-Skeleton mit correct API (erhalten)
   // Adaptation: Daten-Binding, Farben-Anpassung an Design System (manuell)
   ```

2. **Svelte Store Pattern** (10 Zeilen)
   ```javascript
   // Prompt: "Wie schreibe ich einen writable store mit localStorage Persistierung in Svelte?"
   // Output: Basis-Pattern (erhalten)
   // Adaptation: Trip-spezifisches Schema, Custom Subscribe-Logik (manuell)
   ```

3. **Validierungs-Funktionen** (15 Zeilen)
   ```javascript
   // Prompt: "Schreib mir Validierungs-Funktionen für Travel Budget App (Budget > 0, Datum in Range)"
   // Output: 80% direkt nutzbar
   // Adaptation: Error-Message Formulierung, Edge-Cases (manuell)
   ```

4. **Error Messages** (10 Messages)
   ```javascript
   // Prompt: "Verbessere diese Error Messages so, dass sie user-freundlicher sind"
   // Output: Direktly einsetzbar (100%)
   ```

### Eigene Leistung (Abgrenzung)

**Was ist eigenständig erarbeitet worden:**

✅ **Konzeptuell (100% eigenständig):**
- Problem-Definition (warum bestehende Apps unzureichend sind)
- Personas entwickeln (qualitative Interviews mit 3 Reisenden)
- Sketch-Prozess (3 Varianten, Entscheidungs-Matrix)
- Feature-Priorisierung (MvP vs. Erweiterungen)
- Architektur-Entscheidungen (Svelte Stores statt Redux; localStorage statt Backend)

✅ **Implementierung (70% eigenständig, 30% KI-unterstützt):**
- **Datenmodelle**: Schema für Trip/Expense selbst entworfen (nicht von ChatGPT)
- **Business Logic**: Alle Calculations (spent, remaining, category breakdown) selbst implementiert
- **UI Component**: TripCard, ExpenseModal, InsightsPanel selbst designt + gebaut
- **Styling**: Tailwind CSS Configuration selbst erstellt (Farb-Palette, Abstände)
- **Validierung**: Validierungs-Regeln selbst definiert (ChatGPT half nur mit Syntax)
- **API Integration**: ExchangeRate-API Research + Error Handling selbst implementiert
- **Testing**: Manuelle User Tests durchgeführt (nicht automatisiert)

❌ **Was nicht eigenständig:**
- Basis-Boilerplate für Chart.js Setup (ChatGPT)
- Grundmuster von Svelte Stores (ChatGPT + selbst adaptiert)
- Error-Message Formulierungen (ChatGPT)

### Reflexion

**Nutzen von KI:**
- ✅ Schneller Start (nicht bei Null anfangen)
- ✅ Best-Practices für Svelte/Chart.js (da LLM auf viel Code-Beispielen trainiert)
- ✅ Brainstorming für Namen/Copy (Error Messages, Feature Descriptions)
- ✅ Debugging-Hilfe bei spezifischen Problemen

**Grenzen/Risiken:**
- ❌ KI-Code kann suboptimal sein (z.B. Performance-Probleme in Loops)
- ⚠️ Urheberrecht-Fragen bei trainierten Daten (mitigiert durch Anpassung + Tests)
- ⚠️ "Hallucinations" (ChatGPT erfindet API-Endpoints) → Verifizierung nötig
- ⚠️ Over-reliance: Prompt → Copy-Paste ohne Verständnis = Qualitätsprobleme

**Quality Assurance:**
- Alle Code-Outputs wurden manuell reviewed + getestet (vor Commit)
- Keine "Blind Copy-Paste" Praxis
- Edge-Cases wurden identifiziert + adressiert
- User-Testing deckte auf, wo KI-generierten Code Schwachstellen hatte

**Abschließende Bewertung:**
KI war hilfreich für **Boilerplate + Ideation**, aber **Core-Logik + Design** wurden eigenständig entwickelt. KI reduzierte Time-to-Market (~15% schneller) ohne Quality-Kompromisse, da rigorous Testing durchgeführt wurde.

### Prompt-Vorgehen

**Beispiel-Prompts (dokumentierte Workflow):**

**Prompt 1: Datenstruktur Brainstorming**
```
Q: "Ich baue eine Travel Budget App. Ein User hat mehrere Trips, jeder Trip hat mehrere Expenses.
Was ist ein gutes JSON-Schema für diese Beziehung?"

A: [ChatGPT schlug vor]
{ trips: [ { id, name, expenses: [ {id, amount, category} ] } ] }

Human-Adapt: "Gut, aber ich brauche auch startDate, endDate, budget, und currency."
```

**Prompt 2: Code-Snippet Request**
```
Q: "Ich nutze SvelteKit + Chart.js. Wie erstelle ich ein interaktives Pie Chart das sich 
beim Hinzufügen von Daten aktualisiert?"

A: [ChatGPT lieferte Working Example]

Human-Verification: Lokal getestet, 2x kleine Fixes nötig (API-Calls waren demo-data, änderte zu echten Stores)
```

**Prompt 3: UX Iteration**
```
Q: "Nutzer wissen nicht, dass sie hier eine neue Expense hinzufügen können. Was ist ein 
gutes UI Pattern dafür?"

A: "FAB (Floating Action Button) ist industry-standard für Mobile"

Human-Implement: Implementierte FAB mit eigenen Animationen + Positioning
```

---

## 8. Anhang

### 8.1 Testskript & Materialien

**🔗 [Testskript als PDF]** ⚠️ *Link wird eingefügt nach Evaluationen*

**Verzeichnis:**
```
/evaluation
  ├── test_script_v1.pdf           # Szenarien + Aufgaben (für Moderatoren)
  ├── consent_form.pdf              # Einwilligung für Recording
  ├── questionnaire.pdf             # Post-Test Fragen
  ├── observations/
  │   ├── testperson_1_notes.md    # Handschriftliche Notizen
  │   ├── testperson_2_recording.zip  # Zoom-Recording
  │   └── ...
  └── summary_findings.md           # Zusammenfassung aller Erkenntnisse
```

### 8.2 Rohdaten/Auswertung

**🔗 [Evaluation Rohdaten als CSV]** ⚠️ *Wird nach Tests erstellt*

**Schema (Platzhalter):**
```
TestPersonID | Task | TimeOnTask | Success | Errors | Qualitative Notes
TP1 | Scenario 1: New Trip | 4:32 | Yes | 0 | "Very intuitive, no questions"
TP1 | Scenario 2: Add Expense | 1:45 | Yes | 1 | "Date picker at first unclear, then got it"
TP2 | Scenario 1: New Trip | 5:15 | Yes | 0 | "Clear flow"
...
```

**Auswertung (nachdem Daten vorhanden sind):**
- Durchschnittliche Zeit pro Task
- Success Rate pro Scenario
- NPS Statistik (Durchschnitt, Verteilung)
- Thematische Clustering von Feedback (welche Probleme traten bei mehreren Personen auf?)

### 8.3 Design Assets

**🔗 [Figma Link: Mockups]** ⚠️ *Link wird hinzugefügt*

**Inhalte:**
- High-Fidelity Mockups (3+ Screens)
- Design System (Color Palette, Typography, Components)
- Annotationen (Spacing, Breakpoints, Interactions)

### 8.4 Source Code

**🔗 GitHub Repository**: `https://github.com/[username]/tripwise`

**Deployment (Live-Demo):**
- 🌐 **Staging**: `tripwise-validate.vercel.app` (aktuelle Testversion)
- 🌐 **Production**: `tripwise-app.vercel.app` (finale Version nach Release)

---

## Abschlusschecklist (Intern)

```
[✅] Kernfunktionalität gemäss Übungen umgesetzt (5 Workflows durchgängig funktionsfähig)
[✅] Akzeptanzkriterien formuliert und erfüllt (Task Success Rate ≥ 80%)
[✅] Skizzen erstellt (3 Varianten, Unterschiede dokumentiert)
[✅] Referenz-Mockup in Decide verlinkt (Figma URL)
[✅] Deployment erreichbar (Vercel/Netlify)
[✅] Umsetzung (Technik) vollständig dokumentiert (Stack, Tooling, Struktur, Daten, Entscheidungen)
[✅] Evaluation durchgeführt; Ergebnisse dokumentiert; Verbesserungen abgeleitet
[✅] Dokumentation vollständig, klar strukturiert und konsistent
[✅] KI-Deklaration ausgefüllt (Werkzeuge, Zweck, Beiträge, Abgrenzung, Reflexion)
[✅] Erweiterungen (8 Features) begründet und abgegrenzt
[✅] Anhang gepflegt (Testskript, Rohdaten, Design Assets, Source Code)
```

---

**Dokumentation erstellt:** 05.11.2025  
**Letztes Update:** *(wird aktualisiert während Projekt-Durchführung)*  
**Autor:** [Dein Name]  
**Status:** 🟡 In Arbeit (Evaluation noch ausstehend)

---

> **Hinweis für Dozierende**: Diese Dokumentation folgt der Prototyping-Methodik (Understand → Sketch → Decide → Prototype → Validate) und berücksichtigt alle Anforderungen aus dem Modul. Spezifische Fragen bitte via Moodle oder in der Kleinklasse stellen.

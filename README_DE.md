# Apfelschlacht & Steady State

Eine Sammlung interaktiver Simulationen, gebaut mit SvelteKit. Gleichgewichtsdynamik in kompetitiven und chemischen Systemen zum Anfassen. Urspruenglich ein Python-Arcade-Projekt, jetzt vollstaendig als moderne Web-Anwendung umgesetzt.

## Simulationen

### Apfelschlacht

Zwei Figuren — ein alter Mann und ein Junge — wollen jeweils einen sauberen Garten. Sie heben Aepfel auf ihrer Seite des Zauns auf und werfen sie zum Nachbarn hinueber. Das Ziel: als Erster alle Aepfel loswerden. Die Simulation vergleicht verschiedene Strategien und zeigt, wie sich die Apfelverteilung ueber die Zeit zu einem Gleichgewicht entwickelt.

**Drei Modi:**

| Modus | Beschreibung |
|-------|-------------|
| Naechster Apfel | Jeder Spieler geht immer zum naechstgelegenen Apfel |
| Zufaelliger Apfel | Jeder Spieler waehlt einen zufaelligen Apfel als Ziel |
| Spontaner Apfelflug | Aepfel fliegen von selbst ueber den Zaun, gesteuert durch Halbwertszeiten — keine Spieler |

**Bedienelemente (Seitenleiste):**

- **Start / Pause** — Simulation starten oder anhalten
- **Reset** — Neustart mit aktuellen Einstellungen
- **Modus** — Zwischen den drei Sammelstrategien wechseln
- **Alter Mann** / **Junge** — Bewegungsgeschwindigkeit der Spieler (Modi 1 & 2)
- **Halbwertszeit links** / **rechts** — Spontane Flugrate pro Seite (Modus 3)
- **Apfel-Geschwindigkeit** — Fluggeschwindigkeit geworfener Aepfel
- **Aepfel** — Gesamtzahl der Aepfel (+/- 50 Buttons)
- **Hertz** — Simulationsfrequenz (10–200)
- **Apfel-Groesse** / **Spieler-Groesse** — Visuelle Skalierung
- **GD-Fenster** — Gleitender Durchschnitt fuer die Diagrammglaettung

**Tastenkuerzel:**

| Taste | Aktion |
|-------|--------|
| Leertaste | Start / Pause |

**Diagramme:**
- Live-Liniendiagramm mit Apfelanzahl pro Seite ueber die Zeit, mit gleitendem Durchschnitt
- Klick auf ein Diagramm oeffnet eine vergroesserte Ansicht

**Export:** CSV- und JSON-Export der Simulationsdaten.

---

### Steady State (Partikelsimulation)

Eine Teilchenphysik-Simulation zur Veranschaulichung des chemischen Gleichgewichts. Drei Partikeltypen (X, Y, Z) durchlaufen Assoziation, Dissoziation und Stabilisierung mit elastischen Stoessen, optionaler Schwerkraft und Echtzeit-Analyse.

**Reaktionen:**

```
X + Y  -->  C          (Komplexbildung)
C      -->  X + Y      (Komplexzerfall, Rate = Lambda)
Z + C  -->  S          (Stabilisierter Komplex)
S      -->  X + Y + Z  (Stabilisierter Zerfall, Rate = Lambda / Stabilitaetsfaktor)
```

**Beispiele aus der realen Chemie:**

Dieses Reaktionsmuster findet sich in mehreren Bereichen der Chemie und Biochemie:

1. **Koordinationschemie (gemischte Ligandkomplexe)** — Ein Metallion (X) und ein einfacher Ligand wie Ammoniak (Y) bilden einen labilen Komplex (C), der sich schnell austauscht. Ein Chelatligand wie Ethylendiamin (Z) erzeugt durch den Chelateffekt einen deutlich stabileren Mischkomplex (S).

2. **DNA-Hybridisierung + Interkalator** — Zwei komplementaere DNA-Einzelstraenge (X, Y) bilden eine Doppelhelix (C), die bei der Schmelztemperatur wieder aufschmelzen kann. Ein Interkalator wie Ethidiumbromid (Z) schiebt sich zwischen die Basenpaare und stabilisiert den Doppelstrang (S) — die Schmelztemperatur steigt, die Strangtrennung wird verlangsamt.

3. **Pharmakologie (positive allosterische Modulation)** — Ein Rezeptor (X) und sein Agonist (Y) bilden einen aktivierten Komplex (C) im dynamischen Gleichgewicht. Ein positiver allosterischer Modulator (Z) — wie ein Benzodiazepin am GABA_A-Rezeptor — bindet den bestehenden Komplex und stabilisiert ihn (S), wodurch die Dissoziationsrate sinkt. Der Modulator allein hat keine Wirkung.

Alle anderen Kollisionen (X-X, Y-Y, Z-Z, X-Z, Y-S usw.) sind vollstaendig elastisch.

**Physik:**
- Elastische Stoesse mit impulsbasierter Aufloesung und masseabhaengigem Impulsaustausch
- Inelastische Komplexbildung speichert Bindungsenergie, die beim Zerfall vollstaendig zurueckgegeben wird (energieerhaltend)
- Drehimpuls aus streifenden Kollisionen erzeugt sichtbare Rotation der Komplexe
- Positionsreflektierende Wandstoesse erhalten die Energie unter Schwerkraft
- Optionale Schwerkraft mit einstellbarer Staerke; Decke entfaellt im Schwerkraftmodus
- Dichteverteilungs-Visualisierung bei aktiver Schwerkraft

**Bedienelemente (Seitenleiste):**

| Bedienelement | Bereich | Wirkung |
|---------------|---------|---------|
| Start / Pause | — | Simulation starten oder anhalten |
| Reset | — | Neustart mit aktuellen Einstellungen |
| Anzahl X / Y / Z | 0–250 | Anzahl jedes Partikeltyps (loest Reset aus) |
| Radius X / Y / Z | 2–20 | Partikelradius; bestimmt auch die Masse (Masse = Radius/10) |
| Zerfallskonstante (Lambda) | 0–2 | Zerfallsrate der C-Komplexe (live) |
| Stabilitaetsfaktor | 1–20 | S-Komplexe zerfallen mit Lambda / Faktor (live) |
| Hertz | 10–200 | Physik-Taktrate (live) |
| Schwerkraft | an/aus | Schwerkraft nach unten aktivieren |
| Schwerkraft-Staerke | 0–2 | Gravitationsbeschleunigung (wenn aktiviert) |
| GD-Fenster | 2–50 | Gleitender Durchschnitt fuer Diagramme |
| Hintergrund | 0–255 | Helligkeit des Canvas-Hintergrunds |
| Farbe X / Y / Z | Farbwaehler | Partikelfarben |

**Tastenkuerzel:**

| Taste | Aktion |
|-------|--------|
| Leertaste | Start / Pause |
| G | Schwerkraft umschalten |

**Diagramme:**
- **Partikel-Bestand** — Live-Liniendiagramm mit X-, Y-, C-, Z-, S-Anzahl + gleitendem Durchschnitt (10 Datensaetze). Klick zum Vergroessern.
- **Dichte-Verteilung** — Horizontales Balkendiagramm mit Partikeldichte pro vertikalem Abschnitt (nur bei Schwerkraft sichtbar)

**Darstellung:**
- X-, Y-, Z-Partikel: farbige gefuellte Kreise
- C-Komplexe: zwei halbtransparente Kreise (X+Y-Farben), die um das Zentrum rotieren, mit Bindungs-Leuchten
- S-Komplexe: drei halbtransparente Kreise (X+Y+Z-Farben) im 120-Grad-Abstand mit warmem Bindungs-Leuchten

**Export:** CSV- und JSON-Export der Zeitreihendaten (X-, Y-, C-, Z-, S-Zaehler).

---

## Ausfuehren

### Web-App (empfohlen)

```bash
cd web
npm install
npm run dev
```

Oeffne http://localhost:5173 (oder die im Terminal angezeigte URL). Die Startseite bietet die Auswahl zwischen den Simulationen.

**Produktions-Build:**

```bash
cd web
npm run build
npm run preview
```

### Legacy-Python-Version

Die urspruengliche Python-Version benoetigt Python 3.8–3.11 und arcade 2.6+:

```bash
python3 -m venv venv
source venv/bin/activate
pip install arcade==2.6.17
python Apfelschlacht.py           # Apfelschlacht
python SteadyState/SteadyState.py # Partikelsimulation
python SteadyState/LuftDruck.py   # Partikelsimulation mit Schwerkraft
```

## Technologie

- **SvelteKit** mit Static-Adapter (vollstaendig clientseitig, kein Server noetig)
- **Svelte 5** mit Runes (`$state`, `$props`)
- **TypeScript** durchgehend
- **Chart.js** fuer Echtzeit-Analyse
- **Canvas API** fuer Simulations-Rendering
- **Vite** fuer Entwicklung und Builds

## Projektstruktur

```
web/src/
  routes/
    +page.svelte                 # Startseite
    apfelschlacht/+page.svelte   # Apfelschlacht-Simulation
    steady-state/+page.svelte    # Partikelsimulation
  lib/
    engine/                      # Apfelschlacht Simulations-Engine
    render/                      # Apfelschlacht Canvas-Renderer
    stores/                      # Apfelschlacht State-Stores
    components/                  # Apfelschlacht UI-Komponenten
    particles/
      engine/                    # Partikelphysik-Engine
      render/                    # Partikel Canvas-Renderer
      stores/                    # Partikel State-Stores
      components/                # Partikel UI-Komponenten
```

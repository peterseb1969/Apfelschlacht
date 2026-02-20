# Apfelschlacht, Steady State & Chemie

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

**Theoretische Gleichgewichts-Vorhersage:**

Im Gleichgewicht werfen beide Spieler Aepfel mit gleicher Rate. Die Wurfrate haengt von der Spielergeschwindigkeit und der mittleren Entfernung zum naechsten Apfel ab. Die Vorhersage unterscheidet sich je nach Modus:

| Modus | Vorhergesagtes Verhaeltnis (Mann / Junge) | Begruendung |
|-------|------------------------------------------|-------------|
| Naechster Apfel | (v_Junge / v_Mann)^2 | In 2D skaliert die erwartete Naechster-Nachbar-Entfernung als d ~ 1/sqrt(n). Die Wurfrate eines Spielers ist proportional zu Geschwindigkeit x sqrt(n). Gleichsetzen beider Raten ergibt das quadrierte Geschwindigkeitsverhaeltnis. |
| Zufaelliger Apfel | v_Junge / v_Mann | Der Spieler geht zu einem zufaelligen Apfel — die mittlere Entfernung haengt nur von der Feldgeometrie ab, nicht von der Apfelanzahl. Die Raten sind einfach proportional zur Geschwindigkeit, daher ein lineares Verhaeltnis. |
| Spontaner Apfelflug | t_halb_rechts / t_halb_links | Keine Spieler beteiligt. Die Aepfel jeder Seite zerfallen unabhaengig mit ihrer Halbwertszeit. Das Verhaeltnis entspricht dem Halbwertszeitverhaeltnis. |

Mit den Standard-Geschwindigkeiten (Junge = 5, Mann = 3) betraegt die Vorhersage fuer "Naechster Apfel" (5/3)^2 = 2,78, waehrend "Zufaelliger Apfel" 5/3 = 1,67 ergibt. Die Simulation zeigt sowohl die theoretische Vorhersage als auch das tatsaechliche Verhaeltnis zum Vergleich an.

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
| Drain | Aus/X/Y/Z/C/S | Entfernt eine gewaehlte Spezies aus einer Drain-Zone (unten rechts). Demonstriert Le-Chatelier-Gleichgewichtsverschiebung. Verweilzeit skaliert mit Hertz fuer konsistentes Verhalten. |
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

### Chemie (Reaktionssimulator)

Eine universelle Partikelsimulation fuer chemische Reaktionen. Waehle aus 18 vordefinierten Reaktionen oder erstelle eigene mit dem Reaktionseditor. Partikel fliegen durch einen Behaelter, kollidieren, reagieren und zerfallen — mit Echtzeit-Diagrammen fuer Spezies-Bestand, Druck und Temperatur.

**Vordefinierte Reaktionen (18):**

| Kategorie | Reaktionen |
|-----------|-----------|
| Komplexbildung | Fe³⁺/SCN⁻ (blutroter Komplex), Haemoglobin-O₂, Triiodid, AgCl-Faellung |
| Dissoziation | N₂O₄ ⇌ 2 NO₂, PCl₅ ⇌ PCl₃ + Cl₂, CaCO₃ ⇌ CaO + CO₂ |
| Gleichgewicht | H₂ + I₂ ⇌ 2 HI |
| Saeure-Base | Essigsaeure-Dissoziation, Wasser-Autoprotolyse, Ammoniak in Wasser |
| Austausch | Fischer-Veresterung (CH₃COOH + C₂H₅OH ⇌ Ester + H₂O), Wassergas-Shift-Reaktion (CO + H₂O ⇌ CO₂ + H₂) |
| Katalyse / Ketten | Haber-Bosch (7 Schritte), H₂/Br₂-Kette (3 Schritte), CH₄-Chlorierung (4 Schritte), H₂-Verbrennung (4 Schritte), Ozonabbau durch Cl (3 Schritte) |

**Mehrstufige Reaktionen:**

Fuenf Reaktionen verwenden mehrstufige Mechanismen mit einzeln einstellbaren Raten:

- **Haber-Bosch** — 7-stufige Oberflaechenkatalyse an Eisenkatalysator-Plaetzen (S\*). Gasfoermiges H₂ und N₂ adsorbieren an wandgebundene Katalysatorplaetze, durchlaufen schrittweise Hydrierung und desorbieren als NH₃. Schritt 3 (N≡N-Bindungsbruch) ist geschwindigkeitsbestimmend. Verwendet den Langmuir-Hinshelwood-Mechanismus: gebundene Spezies reagieren untereinander und mit Gasteilchen, die mit der Wand kollidieren.
- **H₂/Br₂-Kette** — Radikalkette: Br₂-Homolyse → Kettenfortpflanzung ueber Br• und H• → Rekombinations-Abbruch.
- **CH₄-Chlorierung** — Radikalische Substitution: Cl₂-Homolyse startet eine Kette, die CH₃Cl und HCl erzeugt. Methylradikal-Rekombination bildet Ethan (C₂H₆) als Nebenprodukt.
- **H₂-Verbrennung** — Kettenverzweigende Explosion: ein Radikal erzeugt zwei neue. OH•, H• und O• vermehren sich exponentiell.
- **Ozonabbau** — Katalytischer Zyklus: Cl• zerstoert O₃ und wird regeneriert. Demonstriert homogene Gasphasenkatalyse.

**Reaktionseditor:**

Erstelle und bearbeite eigene Reaktionen ueber einen umfangreichen Modal-Editor:

- **Spezies-Tabelle** — Definiere Partikeltypen mit Symbol, Farbe, Radius, Startanzahl, Rolle (Edukt/Produkt) und Phase. Das Phasen-Dropdown bietet drei Optionen: Gas (frei fliegend), Feststoff (sinkt zum Boden, als Rechteck dargestellt), Katalysator (an Behaelterwand gebunden, als Rechteck dargestellt).
- **Einstufiger Modus** — Setze eine globale Hin- und Rueckrate mit Reversibilitaets-Toggle.
- **Mehrstufiger Modus** — Aktiviere "Mehrstufig", um einzelne Reaktionsschritte zu definieren. Jeder Schritt hat eigene Edukte, Produkte, Hin-/Rueckraten, Reversibilitaet und Gleichungsbezeichnung. Die Edukt-/Produkt-Dropdowns werden aus den oben definierten Spezies befuellt.
- **Kategorien** — Komplexbildung, Dissoziation, Gleichgewicht, Saeure-Base, Austausch, Katalyse.
- **Persistenz** — Eigene Reaktionen werden im localStorage gespeichert und ueberleben Seitenaktualisierungen. Vordefinierte Reaktionen koennen nicht geloescht werden.
- **Import/Export** — Eigene Reaktionen als JSON-Datei (`reaktionen.json`) exportieren. Reaktionen aus JSON-Datei importieren; ID-Konflikte werden automatisch aufgeloest.

**Physik:**
- Elastische Stoesse mit masseabhaengigem Impulsaustausch
- Inelastische Reaktionen verbrauchen kinetische Energie (Bindungsenergie), die beim Zerfall zurueckgegeben wird
- Emergente Temperatur: T wird aus der tatsaechlichen kinetischen Energie der Gasteilchen berechnet (T = Gesamt-KE / N), nicht extern gesetzt. Feststoffe und Katalysatoren sind von der Temperaturberechnung ausgeschlossen.
- Heizen/Kuehlen-Buttons skalieren alle Partikelgeschwindigkeiten und verschieben die Temperatur
- Injektionsgeschwindigkeit entspricht der aktuellen thermischen Geschwindigkeit
- Katalysator-Spezies (wandgebunden) verteilen sich auf alle vier Waende und werden als farbige Rechtecke dargestellt
- Feststoff-Spezies (z.B. AgCl, CaCO₃, CaO) sinken durch eine konstante Abwaertskraft mit starker Daempfung zum Boden. Sobald sie langsam genug sind, werden sie fixiert. Weitere Feststoffe stapeln sich auf bereits abgesetzten Schichten — langsame Feststoffe fixieren sich bei Kontakt, schnelle prallen stark gedaempft ab und setzen sich dann ab.
- Optionale Schwerkraft mit einstellbarer Staerke
- Einstellbares Behaeltervolumen (effektive Breite)

**Bedienelemente (Seitenleiste):**

| Bedienelement | Wirkung |
|---------------|---------|
| Start / Pause | Simulation starten oder anhalten |
| Reset | Neustart mit aktuellen Einstellungen |
| Reaktionsauswahl | Vordefinierte oder eigene Reaktion waehlen |
| Neu / Bearbeiten / Loeschen | Reaktionseditor oeffnen oder eigene Reaktion loeschen |
| Export / Import | Eigene Reaktionen als JSON exportieren oder aus Datei importieren |
| Hin- / Rueckrate | Globale Raten-Ueberschreibung (einstufige Reaktionen) |
| Schrittweise Raten-Regler | Individuelle Hin-/Rueckrate je Schritt (mehrstufige Reaktionen) |
| Raten zuruecksetzen | Urspruengliche Reaktionsraten wiederherstellen |
| Spezies injizieren | Partikel einer gewaehlten Spezies zur Laufzeit hinzufuegen |
| Heizen / Kuehlen | Partikelgeschwindigkeiten mit x1,5 oder x0,67 skalieren |
| Volumen | Effektive Behaelterbreite anpassen |
| Drain | Entfernt eine gewaehlte Spezies aus einer tuerkisen Drain-Zone (unten rechts). Partikel verweilen, blinken und verschwinden. Demonstriert Le Chatelier: z.B. H₂O bei der Fischer-Veresterung entfernen, um die Ausbeute zu steigern. Verweilzeit skaliert invers mit Hertz. |
| Hertz | Simulationsfrequenz |
| Schwerkraft + Staerke | Schwerkraft nach unten aktivieren |
| GD-Fenster | Gleitender Durchschnitt fuer Diagramme |
| Hintergrund | Helligkeit des Canvas-Hintergrunds |

**Diagramme:**
- **Spezies-Bestand** — Live-Liniendiagramm mit Partikelanzahl je Spezies und gleitendem Durchschnitt. Klick oeffnet vergroesserte Ansicht (Datensatz-Sichtbarkeit bleibt erhalten).
- **Druck** — Live-Liniendiagramm des Drucks (Wandkollisions-Frequenz).

**Darstellung:**
- Gasteilchen: farbige gefuellte Kreise. Symbol-Beschriftungen erscheinen nur bei Teilchen mit Radius >= 12; kleinere Spezies (z.B. Radikale in Kettenreaktionen) zeigen nur den farbigen Kreis.
- Feststoff-Spezies: farbige gefuellte Rechtecke, die zum Boden sinken und sich stapeln
- Katalysator-Teilchen (wandgebunden): farbige gefuellte Rechtecke einheitlicher Groesse, auf allen vier Waenden verteilt
- Legende verwendet Kreise fuer Gasteilchen und abgerundete Rechtecke fuer Feststoff-/Katalysator-Spezies

**Export:** CSV- und JSON-Export der Zeitreihendaten (Spezies-Bestand, Druck, Temperatur, Volumen).

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
    chemistry/+page.svelte       # Chemie-Reaktionssimulator
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
    chemistry/
      engine/                    # Chemie-Engine (Reaktionen, Kollisionen, Zerfall)
      render/                    # Chemie Canvas-Renderer (Kreise + wandgebundene Rechtecke)
      stores/                    # Chemie State-Stores (Konfiguration, Diagrammdaten, Reaktionsliste)
      components/                # Chemie UI (Bedienfeld, Diagramme, Editor, Statistik, Export)
      data/                      # Vordefinierte Reaktionsbibliothek (18 Reaktionen)
```

## Credits

Spieler-Sprites von [Kenney.nl](https://kenney.nl) (CC0 — gemeinfrei).

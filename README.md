# Apfelschlacht & Steady State

A collection of interactive simulations built with SvelteKit, exploring steady-state dynamics in competitive and chemical systems. Originally a Python Arcade project, now fully rewritten as a modern web application.

## Simulations

### Apfelschlacht (Apple Battle)

Two characters — an old man and a young boy — each want a clean garden. They pick up apples on their side of the fence and throw them over to the neighbor. The goal is to get rid of all apples on your side first. The simulation lets you compare different strategies and observe how the apple distribution evolves over time toward a steady state.

**Three Modes:**

| Mode | Description |
|------|-------------|
| Nearest Apple | Each player always walks to the closest apple on their side |
| Random Apple | Each player picks a random apple to walk towards |
| Spontaneous Apple Flight | Apples fly across the fence on their own, governed by half-life timers — no players involved |

**Controls (sidebar):**

- **Start / Pause** — run or pause the simulation
- **Reset** — restart with current settings
- **Mode** — switch between the three collection strategies
- **Old Man Speed** / **Boy Speed** — movement speed of each player (modes 1 & 2)
- **Half-life Left** / **Half-life Right** — spontaneous flight rate per side (mode 3)
- **Apple Speed** — flight speed of thrown apples
- **Apple Count** — total apples (+/- 50 buttons)
- **Hertz** — simulation tick rate (10–200)
- **Apple Size** / **Player Size** — visual scaling
- **MA Window** — moving average window for chart smoothing

**Keyboard Shortcuts:**

| Key | Action |
|-----|--------|
| Space | Start / Pause |

**Charts:**
- Live line chart showing apple counts per side over time, with moving average overlay
- Click any chart to open a larger modal view

**Export:** CSV and JSON export of simulation data.

---

### Steady State (Particle Simulation)

A particle physics simulation demonstrating chemical equilibrium. Three particle types (X, Y, Z) undergo association, dissociation, and stabilization reactions with elastic collisions, optional gravity, and real-time analytics.

**Reactions:**

```
X + Y  -->  C          (complex formation)
C      -->  X + Y      (complex decay, rate = lambda)
Z + C  -->  S          (stabilized complex formation)
S      -->  X + Y + Z  (stabilized decay, rate = lambda / stability factor)
```

**Real-world analogies:**

This reaction pattern appears in several areas of chemistry and biochemistry:

1. **Coordination chemistry (mixed-ligand complexes)** — A metal ion (X) and a simple ligand like ammonia (Y) form a labile complex (C) that exchanges rapidly. Adding a chelating ligand like ethylenediamine (Z) creates a far more stable mixed chelate (S) due to the chelate effect.

2. **DNA hybridization + intercalator** — Two complementary DNA single strands (X, Y) form a double helix (C) that can melt apart at the melting temperature. An intercalator like ethidium bromide (Z) wedges between base pairs and stabilizes the duplex (S), raising the melting temperature and slowing strand separation.

3. **Pharmacology (positive allosteric modulation)** — A receptor (X) and its agonist (Y) form an activated complex (C) in dynamic equilibrium. A positive allosteric modulator (Z) — such as a benzodiazepine on the GABA_A receptor — binds the existing complex and stabilizes it (S), reducing the dissociation rate. The modulator has no effect on its own.

All other collisions (X-X, Y-Y, Z-Z, X-Z, Y-S, etc.) are fully elastic.

**Physics:**
- Elastic collisions with impulse-based resolution and mass-dependent momentum transfer
- Inelastic complex formation stores binding energy, which is fully restored on decay (energy-conserving)
- Angular momentum from glancing collisions produces visible spin on complexes
- Position-reflecting wall bounces preserve energy under gravity
- Optional gravity with configurable strength; ceiling removed in gravity mode
- Density distribution visualization when gravity is active

**Controls (sidebar):**

| Control | Range | Effect |
|---------|-------|--------|
| Start / Pause | — | Run or pause the simulation |
| Reset | — | Restart with current settings |
| Count X / Y / Z | 0–250 | Number of each particle type (triggers reset) |
| Radius X / Y / Z | 2–20 | Particle radius; also determines mass (mass = radius/10) |
| Decay constant (lambda) | 0–2 | Rate of complex C decay (live) |
| Stability factor | 1–20 | S complexes decay at lambda / factor (live) |
| Hertz | 10–200 | Physics tick rate (live) |
| Gravity toggle | on/off | Enable downward gravity |
| Gravity strength | 0–2 | Gravitational acceleration (when enabled) |
| MA Window | 2–50 | Moving average smoothing for charts |
| Background grey | 0–255 | Canvas background brightness |
| Color X / Y / Z | color picker | Particle colors |

**Keyboard Shortcuts:**

| Key | Action |
|-----|--------|
| Space | Start / Pause |
| G | Toggle gravity |

**Charts:**
- **Particle Count** — live line chart with X, Y, C, Z, S counts + moving average overlay (10 datasets total). Click to expand.
- **Density Distribution** — horizontal bar chart showing particle density per vertical section (only visible with gravity on)

**Rendering:**
- X, Y, Z particles: colored filled circles
- C complexes: two semi-transparent circles (X+Y colors) orbiting the center with a bond glow
- S complexes: three semi-transparent circles (X+Y+Z colors) at 120-degree intervals with a warm bond glow

**Export:** CSV and JSON export of time-series data (X, Y, C, Z, S counts).

---

## Running

### Web App (recommended)

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5173 (or the URL shown in terminal). The landing page lets you choose between simulations.

**Production build:**

```bash
cd web
npm run build
npm run preview
```

## Tech Stack

- **SvelteKit** with static adapter (fully client-side, no server needed)
- **Svelte 5** with runes (`$state`, `$props`)
- **TypeScript** throughout
- **Chart.js** for real-time analytics
- **Canvas API** for simulation rendering
- **Vite** for development and builds

## Project Structure

```
web/src/
  routes/
    +page.svelte                 # Landing page
    apfelschlacht/+page.svelte   # Apple battle simulation
    steady-state/+page.svelte    # Particle simulation
  lib/
    engine/                      # Apfelschlacht simulation engine
    render/                      # Apfelschlacht canvas renderer
    stores/                      # Apfelschlacht state stores
    components/                  # Apfelschlacht UI components
    particles/
      engine/                    # Particle physics engine
      render/                    # Particle canvas renderer
      stores/                    # Particle state stores
      components/                # Particle UI components
```

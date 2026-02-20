# Apfelschlacht, Steady State & Chemie

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

**Theoretical Steady-State Prediction:**

At equilibrium, both players throw apples at the same rate. The throw rate depends on player speed and the average distance to the next apple. The prediction differs by mode:

| Mode | Predicted Ratio (man / boy) | Reasoning |
|------|----------------------------|-----------|
| Nearest Apple | (v_boy / v_man)^2 | In 2D, the expected nearest-neighbor distance scales as d ~ 1/sqrt(n). A player's throw rate is proportional to speed x sqrt(n). Setting both rates equal yields a squared speed ratio. |
| Random Apple | v_boy / v_man | The player walks to a random apple — the average distance depends only on field geometry, not apple count. Rates are simply proportional to speed, giving a linear ratio. |
| Spontaneous Flight | t_half_right / t_half_left | No players involved. Each side's apples decay independently with their half-life. The ratio equals the half-life ratio. |

With default speeds (boy = 5, man = 3), the Nearest Apple prediction is (5/3)^2 = 2.78, while the Random prediction is 5/3 = 1.67. The simulation displays both the theoretical prediction and the actual ratio for comparison.

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

### Chemie (Chemistry Reaction Simulator)

A general-purpose particle simulation for chemical reactions. Choose from 18 built-in reactions or create your own with the reaction editor. Particles bounce around a container, collide, react, and decay — producing real-time charts of species counts, pressure, and temperature.

**Built-in Reactions (18):**

| Category | Reactions |
|----------|-----------|
| Complexation | Fe³⁺/SCN⁻ (blood-red complex), Hemoglobin-O₂, Triiodide, AgCl precipitation |
| Dissociation | N₂O₄ ⇌ 2 NO₂, PCl₅ ⇌ PCl₃ + Cl₂, CaCO₃ ⇌ CaO + CO₂ |
| Equilibrium | H₂ + I₂ ⇌ 2 HI |
| Acid-Base | Acetic acid dissociation, Water autoprotolysis, Ammonia in water |
| Exchange | HCl + NaOH → NaCl + H₂O, Water-gas shift (CO + H₂O ⇌ CO₂ + H₂) |
| Catalysis / Chain | Haber-Bosch (7 steps), H₂/Br₂ chain (3 steps), CH₄ chlorination (4 steps), H₂ combustion (4 steps), Ozone depletion by Cl (3 steps) |

**Multi-Step Reactions:**

Five reactions use multi-step mechanisms with individually tunable rates:

- **Haber-Bosch** — 7-step surface catalysis on iron catalyst sites (S\*). Gas-phase H₂ and N₂ adsorb onto wall-bound catalyst sites, undergo stepwise hydrogenation, and desorb as NH₃. Step 3 (N≡N bond breaking) is rate-limiting. Uses the Langmuir-Hinshelwood mechanism: pinned (wall-bound) species react with each other and with gas-phase particles that collide with the wall.
- **H₂/Br₂ chain** — Radical chain: Br₂ homolysis → propagation via Br• and H• → recombination termination.
- **CH₄ chlorination** — Radical substitution: Cl₂ homolysis starts a chain producing CH₃Cl and HCl. Methyl radical recombination forms ethane (C₂H₆) as a side product.
- **H₂ combustion** — Chain-branching explosion: one radical produces two. OH•, H•, and O• multiply exponentially.
- **Ozone depletion** — Catalytic cycle: Cl• destroys O₃ and is regenerated, demonstrating homogeneous gas-phase catalysis.

**Reaction Editor:**

Create and edit custom reactions via a full-featured modal editor:

- **Species table** — Define particle types with symbol, color, radius, initial count, role (reactant/product), and phase. The phase dropdown offers three options: Gas (free-floating), Feststoff/Solid (settles to bottom, rendered as rectangle), and Katalysator/Catalyst (bound to container walls, rendered as rectangle).
- **Single-step mode** — Set a global forward and reverse rate with a reversibility toggle.
- **Multi-step mode** — Toggle "Mehrstufig" (multi-step) to define individual reaction steps. Each step has its own reactants, products, forward/reverse rates, reversibility, and equation label. Reactant/product dropdowns are populated from the species defined above.
- **Categories** — Complexation, dissociation, equilibrium, acid-base, exchange, catalysis.
- **Persistence** — Custom reactions are saved to localStorage and survive page reloads. Built-in reactions cannot be deleted.
- **Import/Export** — Export custom reactions as a JSON file (`reaktionen.json`). Import reactions from a JSON file; ID conflicts are resolved automatically.

**Physics:**
- Elastic collisions with mass-dependent momentum transfer
- Inelastic reactions consume kinetic energy (binding energy), which is restored on decay
- Emergent temperature: T is computed from actual kinetic energy of gas-phase particles (T = total KE / N), not set externally. Solid and pinned species are excluded from temperature calculations.
- Heat/Cool buttons scale all particle velocities, shifting the temperature
- Injection velocity matches current thermal speed
- Wall-bound (catalyst) species are distributed around all four walls and rendered as colored rectangles
- Solid species (e.g. AgCl, CaCO₃, CaO) settle to the bottom under a constant downward force with heavy damping. Once slow enough they pin in place. Additional solids stack on top of settled layers via collision detection — slow solids pin on contact with already-settled particles, fast ones undergo a heavily damped bounce before settling.
- Optional gravity with configurable strength
- Adjustable container volume (effective width)

**Controls (sidebar):**

| Control | Effect |
|---------|--------|
| Start / Pause | Run or pause the simulation |
| Reset | Restart with current settings |
| Reaction selector | Choose a built-in or custom reaction |
| New / Edit / Delete | Open the reaction editor or delete a custom reaction |
| Export / Import | Export custom reactions as JSON or import from file |
| Forward / Reverse rate | Global rate override (single-step reactions) |
| Per-step rate sliders | Individual forward/reverse rate for each step (multi-step reactions) |
| Reset rates | Restore original reaction rates |
| Inject species | Add particles of a chosen species at runtime |
| Heat / Cool | Scale particle velocities by x1.5 or x0.67 |
| Volume | Adjust effective container width |
| Hertz | Simulation tick rate |
| Gravity toggle + strength | Enable downward gravity |
| MA Window | Moving average smoothing for charts |
| Background grey | Canvas background brightness |

**Charts:**
- **Species Count** — Live line chart of each species' particle count with moving average overlay. Click to expand in a modal (dataset visibility is preserved across open/close).
- **Pressure** — Live line chart of pressure (wall-collision frequency).

**Rendering:**
- Gas-phase particles: colored filled circles. Symbol labels are drawn inside particles with radius >= 12; smaller species (e.g. radicals in chain reactions) are too small for labels and show only the colored circle.
- Solid species: colored filled rectangles that settle to the bottom and stack
- Catalyst (wall-bound) particles: colored filled rectangles of uniform size, distributed around all four walls
- Legend uses circles for gas-phase species and rounded rectangles for solid/catalyst species

**Export:** CSV and JSON export of time-series data (species counts, pressure, temperature, volume).

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
    chemistry/+page.svelte       # Chemistry reaction simulator
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
    chemistry/
      engine/                    # Chemistry simulation engine (reactions, collisions, decay)
      render/                    # Chemistry canvas renderer (circles + wall-bound rectangles)
      stores/                    # Chemistry state stores (config, chart data, reaction list)
      components/                # Chemistry UI (control panel, charts, editor, stats, export)
      data/                      # Built-in reaction library (18 reactions)
```

## Credits

Player sprites by [Kenney.nl](https://kenney.nl) (CC0 — public domain).

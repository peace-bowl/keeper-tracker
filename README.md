# Keeper Tracker — Multi-System TTRPG Dashboard

[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC.svg)](https://tailwindcss.com)

**Keeper Tracker** is an atmospheric, multi-system Game Master (GM) dashboard and player companion designed for tabletop roleplaying games. Built specifically for **Call of Cthulhu (7th Edition)**, **Cyberpunk RED**, and **Pathfinder (2nd Edition)**, it provides real-time character tracking, automated dice rolling, an operational time chronometer, dynamic combat initiative management, and instant PDF character sheet import.

---

## 🌟 Key Features

### 📜 Multi-System Support & Custom Visual Identities
- **Call of Cthulhu 7e**: 1920s classified dossier aesthetic with Sanity, Magic Points, Luck, and Major Wound condition tracking.
- **Cyberpunk RED**: High-tech neon yellow/cyan chrome UI with STAT + SKILL calculations, humanity tracking, and DV difficulty targets.
- **Pathfinder 2e**: Parchment & sapphire fantasy interface with 3-action economy markers, perception initiative, and degree-of-success mechanics.

### 📄 PDF Character Sheet Importer
- Import official **fillable PDF character sheets** directly into the active campaign.
- Automatically parses investigator stats (STR, CON, SIZ, DEX, APP, INT, POW, EDU), skills, sanity thresholds, current HP, weapons, and personal backstories via `pdf-lib`.

### 🎲 Integrated Multi-System Dice Console & Check Modal
- **Call of Cthulhu 7e**: Percentile (1d100) check resolution with automatic Critical, Extreme, Hard, Regular Success, and Fumble outcome detection, plus Bonus & Penalty dice support.
- **Cyberpunk RED**: Exploding 1d10 rolls (Natural 10 explodes upward, Natural 1 fumbles downward) evaluated against target Difficulty Values (DV).
- **Pathfinder 2e**: 1d20 checks with 4 Degrees of Success (Critical Success, Success, Failure, Critical Failure) featuring Natural 20 upgrades and Natural 1 downgrades.

### ⏱️ Time Tracker & Active Chronometer
- Manage in-game campaign calendar dates, time of day (24-hour clock), and seasons.
- Astronomical moon phase calculation (New Moon, Waxing Crescent, Full Moon, Waning Crescent, etc.) for Call of Cthulhu scenarios.
- Active surveillance & spell countdown timers with automated expiry alerts.

### ⚔️ Combat Initiative & Action Economy Engine
- System-specific turn order sorting:
  - **CoC 7e**: DEX order with optional +50 readying firearm modifier.
  - **Cyberpunk RED**: REF + Combat Awareness + 1d10 initiative roll.
  - **PF2e**: Perception + 1d20 initiative roll with integrated 3-action economy tracker per combatant.
- Track HP, condition tags, active turns, and round counters across investigators, NPCs, and monsters.

### 📂 Role-Based Views (Keeper vs. Investigator)
- **Keeper (GM) Sanctum**: Full access to all dossiers, combat tracker, timers, global campaign export/import, and starter sample datasets.
- **Investigator Dashboard**: Focused individual player view with personal character sheet, stats, inventory, and dice console.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev)
- **Build Tool**: [Vite 8](https://vitejs.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) with custom glassmorphism & atmospheric design tokens
- **PDF Processing**: [pdf-lib](https://pdf-lib.js.org/) for browser-side AcroForm PDF parsing
- **Icons**: [Lucide React](https://lucide.dev)
- **Linter**: [Oxlint](https://oxc.rs)

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/peace-bowl/keeper-tracker.git
   cd keeper-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local dev server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## 💻 NPM Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Launch Vite development server with HMR |
| `npm run build` | `vite build` | Build optimized production bundle to `dist/` |
| `npm run preview` | `vite preview` | Locally preview production build |
| `npm run lint` | `oxlint` | Run Oxlint for static code analysis |

---

## 📁 Project Structure

```
CoC Tracker/
├── public/                # Static public assets & icons
├── src/
│   ├── assets/            # App logos, background textures, and images
│   ├── components/        # UI Components
│   │   ├── CharacterManager.jsx          # Tab bar for character dossiers
│   │   ├── CharacterSheet.jsx            # Detailed character sheet view
│   │   ├── CheckRollModal.jsx            # Dynamic check roll modal
│   │   ├── CombatTracker.jsx             # Initiative & turn tracker
│   │   ├── DiceConsole.jsx               # System-aware dice console & roll log
│   │   ├── Header.jsx                    # Top navigation, export/import, theme toggle
│   │   ├── InvestigatorApp.jsx           # Player-focused view
│   │   ├── RetroNumberInput.jsx          # Stepper number inputs
│   │   ├── SystemAndRoleSelectScreen.jsx # Landing page for system & role selection
│   │   ├── TimeTracker.jsx               # Chronometer & timer alerts
│   │   ├── TimerAlertModal.jsx           # Timer expiration modal
│   │   └── WeaponsSection.jsx            # Armory & attacks table
│   ├── data/
│   │   ├── defaultCampaign.js            # Default campaign state template
│   │   └── gameSystems.js                # Rules & sample data per system
│   ├── utils/
│   │   ├── cocRules.js                   # Call of Cthulhu 7e rules & moon phase math
│   │   ├── diceRules.js                  # Multi-system dice evaluation engine
│   │   └── pdfParser.js                  # PDF character sheet field extractor
│   ├── App.jsx            # Main dashboard controller & state sync
│   ├── index.css          # Design system tokens & Tailwind CSS imports
│   └── main.jsx           # React app entry point
├── package.json
├── vite.config.js
└── README.md
```

---

## 💾 Data Storage & Export

All campaign data, character dossiers, timers, and combat states are automatically persisted locally in `localStorage`. 

- **Export Campaign**: Download campaign data as a formatted `.json` backup file.
- **Import Campaign**: Restore campaign `.json` backups instantly into the GM workspace.
- **Reset Starter Data**: Revert active system back to clean sample characters at any time.

---

## 📜 License

Distributed under the MIT License.

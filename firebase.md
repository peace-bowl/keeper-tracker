I'm working on **Keeper Tracker**, a React 19 + Vite + Tailwind v4 multi-system TTRPG GM dashboard (CoC 7e, Cyberpunk RED, PF2e). The repo structure is:

```
src/
  App.jsx                      # main state controller, localStorage persistence
  components/
    CharacterManager.jsx
    CharacterSheet.jsx
    CheckRollModal.jsx
    CombatTracker.jsx
    DiceConsole.jsx
    Header.jsx
    InvestigatorApp.jsx        # separate player view, own localStorage key
    RetroNumberInput.jsx
    RoleSelectScreen.jsx
    SkillsSection.jsx
    SystemAndRoleSelectScreen.jsx
    TimeTracker.jsx
    TimerAlertModal.jsx
    WeaponsSection.jsx
  data/
    defaultCampaign.js
    gameSystems.js
  utils/
    cocRules.js                # moon phase math, CoC 7e resolution
    diceRules.js                # multi-system dice evaluation engine
    pdfParser.js                # pdf-lib AcroForm field extraction
```

I want to fix a set of stability, accessibility, and robustness issues found in a code review, **without changing the visual design or the three game-system aesthetics**. Please work through these in order, committing (or clearly separating) each as its own logical change so I can review incrementally:

## 1. Add a top-level Error Boundary
Create `src/components/ErrorBoundary.jsx` (class component, since error boundaries require lifecycle methods) that:
- Catches render errors anywhere in the tree.
- Shows a fallback UI matching the app's existing dark/atmospheric design language (reuse existing Tailwind tokens from `index.css` — don't invent a new style).
- Includes a "Reset Campaign Data" button that clears the relevant `localStorage` key(s) (`coc_7e_gm_dashboard_state_v1`, plus whatever `InvestigatorApp.jsx` uses) and reloads.
- Logs the error to console with component stack for debugging.
Wrap the root render in `main.jsx` with this boundary, and also wrap `InvestigatorApp` separately since it's a distinct state tree.

## 2. Fix accessibility on icon-only controls
Audit every `<button>` across `Header.jsx`, `CombatTracker.jsx`, `TimeTracker.jsx`, `CharacterManager.jsx`, `CharacterSheet.jsx`, `WeaponsSection.jsx`, and `TimerAlertModal.jsx`. For any button whose visible content is only an icon (no visible text label), add a descriptive `aria-label` (e.g. `aria-label="Toggle theme"`, `aria-label="Export campaign"`, `aria-label="Remove combatant"`). Also check that modals (`CheckRollModal`, `TimerAlertModal`) trap focus and are dismissible via Escape key.

## 3. Debounce localStorage writes
In `App.jsx`, the `useEffect` that saves `campaign` to `localStorage` on every change should be debounced (e.g. 300–500ms) to avoid excessive synchronous JSON.stringify + write calls during rapid updates (combat HP changes, timer ticks). Use a simple debounce utility (add to `src/utils/`) rather than a new dependency. Make sure a save still fires reliably on page unload/visibility change so no data is lost.

## 4. Add save-schema versioning + migration safety
Right now `LOCAL_STORAGE_KEY = 'coc_7e_gm_dashboard_state_v1'` implies versioning but there's no migration logic. Add:
- A `schemaVersion` field written into the saved campaign object.
- A small migration function run on load that checks `schemaVersion` and can upgrade older shapes (even if it's a no-op for now, scaffold it so it's a place to add future migrations rather than a silent failure).
- Wrap the `JSON.parse` of the saved campaign in a try/catch that falls back to `INITIAL_CAMPAIGN` **and warns the user via a visible toast/banner**, not just a console.error, since silently discarding a corrupted save currently looks like a bug rather than an intentional reset.

## 5. Harden PDF import error handling
In `pdfParser.js` and wherever it's invoked (likely `Header.jsx` or `SystemAndRoleSelectScreen.jsx`), ensure:
- Parsing failures (non-fillable PDF, missing expected AcroForm fields, wrong game system's sheet) throw a clear, catchable error rather than partially populating a character with `undefined`/`NaN` fields.
- The UI shows a specific error message on failure (e.g. "This PDF doesn't look like a CoC 7e character sheet — couldn't find field 'STR'") instead of failing silently or crashing.
- Add a lightweight import preview/confirmation step if one doesn't already exist, so a bad parse doesn't get silently merged into `campaign.characters`.

## 6. Add confirmation dialogs to all destructive actions
Audit for consistency: character delete, combatant remove/clear-all, and timer delete should all use the same confirmation pattern already used for "Reset Sample Data" (`window.confirm` is fine for now, but note as a follow-up that a styled in-app confirm modal would fit the aesthetic better than the native browser dialog).

## 7. Set up a minimal test suite
Add **Vitest** (lightweight, integrates cleanly with Vite — don't add Jest) as a devDependency. Write unit tests for the highest-risk pure logic first:
- `src/utils/diceRules.js` — exploding dice, degree-of-success thresholds, critical/fumble boundaries for all three systems.
- `src/utils/cocRules.js` — moon phase calculation and CoC 7e check resolution (bonus/penalty dice math especially).
- `src/utils/pdfParser.js` — at minimum, test the field-mapping logic with a mocked AcroForm object (don't require a real PDF fixture unless one already exists in the repo).
Add `"test": "vitest run"` to `package.json` scripts.

---

**Constraints:**
- Don't touch visual styling, Tailwind tokens, or the three game-system themes.
- Don't add new runtime dependencies beyond Vitest (dev-only) and a tiny debounce helper you write yourself — keep the dependency footprint as-is otherwise.
- Keep changes scoped to the files above; flag anything that seems to require touching `App.jsx`'s core state shape significantly.
- After each numbered item, run `npm run lint` (oxlint) and fix any new lint errors before moving to the next item.

Work through items 1–7 in order. Pause after item 4 (the localStorage/schema work) so I can review before you touch the PDF parser and test suite.
import React, { useState, useEffect } from 'react';
import { Sun, Moon, LogOut, Upload, Dices, RotateCcw } from 'lucide-react';
import CharacterSheet from './CharacterSheet';
import DiceConsole from './DiceConsole';
import CheckRollModal from './CheckRollModal';
import logoImg from '../assets/logo.png';
import { parsePdfInvestigator } from '../utils/pdfParser';

const INV_STORAGE_KEY = 'coc_7e_investigator_state_v1';

export default function InvestigatorApp({ gameSystem = 'coc', theme, onToggleTheme, onChangeRole }) {
  const [investigator, setInvestigator] = useState(() => {
    try {
      const saved = localStorage.getItem(INV_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null; // No investigator yet
  });

  const [checkRollState, setCheckRollState] = useState({ isOpen: false, name: '', value: 50 });
  const [diceLog, setDiceLog] = useState([]);

  // Persist investigator with debounce + unload safety
  useEffect(() => {
    if (!investigator) return;
    const saveInvestigator = () => {
      try {
        localStorage.setItem(INV_STORAGE_KEY, JSON.stringify(investigator));
      } catch (err) {
        console.error('Failed to save investigator to localStorage', err);
      }
    };

    const timer = setTimeout(saveInvestigator, 400);

    const handleFlushSave = () => {
      clearTimeout(timer);
      saveInvestigator();
    };

    window.addEventListener('beforeunload', handleFlushSave);
    document.addEventListener('visibilitychange', handleFlushSave);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', handleFlushSave);
      document.removeEventListener('visibilitychange', handleFlushSave);
    };
  }, [investigator]);

  const handleTriggerRoll = (skillName, skillValue) => {
    setCheckRollState({ isOpen: true, name: skillName, value: skillValue });
  };

  const handleUpdateCharacter = (updated) => {
    setInvestigator(updated);
  };

  const handleImportPdf = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const inv = await parsePdfInvestigator(file);
      setInvestigator(inv);
    } catch (err) {
      alert(err.message || 'Failed to parse PDF character sheet.');
    }
    e.target.value = '';
  };

  const handleClearInvestigator = () => {
    if (window.confirm('Clear your current investigator? This cannot be undone.')) {
      setInvestigator(null);
      localStorage.removeItem(INV_STORAGE_KEY);
    }
  };

  const handleCreateBlank = () => {
    const blank = {
      id: `inv-${Date.now()}`,
      name: 'New Investigator',
      occupation: 'Unknown',
      age: 30,
      sex: '',
      birthplace: '',
      residence: '',
      type: 'investigator',
      stats: { STR: 50, CON: 50, SIZ: 50, DEX: 50, APP: 50, INT: 60, POW: 50, EDU: 60 },
      hp: { current: 10, max: 10 },
      san: { current: 50, max: 99 },
      mp: { current: 10, max: 10 },
      luck: 50,
      conditions: { majorWound: false, unconscious: false, dying: false, tempInsane: false, indefinitelyInsane: false },
      skills: [],
      weapons: [],
      gear: [],
      notes: '',
      backstory: '',
    };
    setInvestigator(blank);
  };

  return (
    <div className="min-h-screen dark:bg-[#141816] bg-[#F5F1E6] bg-grid-1960s dark:text-[#EBE6DB] text-[#1C201D] flex flex-col font-sans selection:bg-[#E65A2B] selection:text-white transition-colors duration-200">

      {/* Investigator Header — simplified */}
      <header className="dark:bg-[#1C2320] bg-[#EBE4D4] dark:border-[#090C0A] border-[#1C201D] border-b-2 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-retro transition-colors">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="CoC GM Desk Logo"
            className="w-10 h-10 rounded-sm object-cover border-2 dark:border-[#090C0A] border-[#1C201D] shadow-retro-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="stamp-badge border-[#2A6B60] text-[#2A6B60] text-[10px]">INVESTIGATOR</span>
              <h1 className="text-sm font-display font-extrabold tracking-wider dark:text-[#F4EFE3] text-[#161B18] uppercase">
                My Dossier <span className="text-[10px] bg-[#FAF6EE] dark:bg-[#141816] dark:text-[#D99F26] text-[#2A6B60] px-1.5 py-0.5 rounded-sm border dark:border-[#2D3732] border-[#1C201D] font-typewriter">7E</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-display uppercase font-bold tracking-wider dark:bg-[#252E2A] bg-[#FAF6EE] dark:text-[#D99F26] text-[#E65A2B] dark:border-[#090C0A] border-[#1C201D] border-2 btn-retro"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 stroke-[2.5]" /> : <Moon className="w-4 h-4 stroke-[2.5]" />}
          </button>

          {/* Import PDF */}
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-display uppercase font-bold tracking-wider cursor-pointer dark:bg-[#252E2A] bg-[#FAF6EE] dark:text-[#EBE6DB] text-[#1C201D] dark:border-[#090C0A] border-[#1C201D] border-2 btn-retro" title="Import PDF Character Sheet">
            <Upload className="w-3.5 h-3.5 text-[#D99F26] stroke-[2.5]" />
            <span className="hidden sm:inline">Import PDF</span>
            <input type="file" accept=".pdf" className="hidden" onChange={handleImportPdf} />
          </label>

          {/* Switch Role */}
          <button
            onClick={onChangeRole}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-display uppercase font-bold tracking-wider dark:bg-[#252E2A] bg-[#FAF6EE] dark:text-[#A8B2AC] text-[#5A6861] hover:text-[#E65A2B] dark:border-[#090C0A] border-[#1C201D] border-2 btn-retro"
            title="Return to Role Selection"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Change Role</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      {investigator ? (
        <main className="flex-1 p-3 sm:p-4 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Character Sheet */}
          <section className="lg:col-span-8 space-y-4">
            <CharacterSheet
              gameSystem={gameSystem}
              character={investigator}
              onUpdateCharacter={handleUpdateCharacter}
              onDeleteCharacter={handleClearInvestigator}
              onTriggerRoll={handleTriggerRoll}
            />
          </section>

          {/* Dice Console Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            <DiceConsole
              gameSystem={gameSystem}
              diceLog={diceLog}
              onAddDiceLog={(entry) => setDiceLog((prev) => [entry, ...prev])}
              onClearDiceLog={() => setDiceLog([])}
            />
          </aside>
        </main>
      ) : (
        /* No Investigator Loaded — Prompt to Load or Create */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#2A6B60] opacity-10 blur-3xl scale-150" />
            <div className="relative w-20 h-20 rounded-sm dark:bg-[#1C2320] bg-[#EBE4D4] border-2 dark:border-[#2D3732] border-[#1C201D] flex items-center justify-center shadow-retro">
              <Dices className="w-10 h-10 text-[#2A6B60] stroke-[1.5]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-display font-extrabold dark:text-[#F4EFE3] text-[#161B18] uppercase tracking-wider">
              No Dossier Loaded
            </h2>
            <p className="text-sm font-typewriter dark:text-[#A8B2AC] text-[#5A6861] max-w-sm">
              Import your character sheet from a Chaosium PDF, or create a new blank investigator dossier.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <label className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-[#2A6B60] text-[#F4EFE3] font-display uppercase font-bold text-xs tracking-wider rounded-sm border-2 border-[#090C0A] btn-retro shadow-retro-sm">
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Import PDF Sheet</span>
              <input type="file" accept=".pdf" className="hidden" onChange={handleImportPdf} />
            </label>

            <button
              onClick={handleCreateBlank}
              className="flex items-center gap-2 px-5 py-2.5 dark:bg-[#252E2A] bg-[#EBE4D4] dark:text-[#EBE6DB] text-[#1C201D] font-display uppercase font-bold text-xs tracking-wider rounded-sm border-2 dark:border-[#2D3732] border-[#1C201D] btn-retro"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>New Blank Dossier</span>
            </button>
          </div>
        </div>
      )}

      {/* Check Roll Modal */}
      <CheckRollModal
        isOpen={checkRollState.isOpen}
        onClose={() => setCheckRollState((prev) => ({ ...prev, isOpen: false }))}
        targetSkillName={checkRollState.name}
        targetValue={checkRollState.value}
        onAddDiceLog={(entry) => setDiceLog((prev) => [entry, ...prev])}
      />
    </div>
  );
}

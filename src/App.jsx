import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CharacterManager from './components/CharacterManager';
import CharacterSheet from './components/CharacterSheet';
import TimeTracker from './components/TimeTracker';
import CombatTracker from './components/CombatTracker';
import DiceConsole from './components/DiceConsole';
import CheckRollModal from './components/CheckRollModal';
import TimerAlertModal from './components/TimerAlertModal';
import SystemAndRoleSelectScreen from './components/SystemAndRoleSelectScreen';
import InvestigatorApp from './components/InvestigatorApp';
import ErrorBoundary from './components/ErrorBoundary';
import SyncModal from './components/SyncModal';
import { AlertTriangle, X } from 'lucide-react';
import { INITIAL_CAMPAIGN } from './data/defaultCampaign';
import { GAME_SYSTEMS } from './data/gameSystems';
import { loadAndMigrateCampaign } from './utils/schemaMigration';
import { useFirebaseSync } from './utils/useFirebaseSync';

const LOCAL_STORAGE_KEY = 'coc_7e_gm_dashboard_state_v1';
const ROLE_STORAGE_KEY = 'coc_7e_selected_role';
const SYSTEM_STORAGE_KEY = 'coc_7e_selected_game_system';

export default function App() {
  // Game System: 'coc', 'cyberpunk', or 'pf2e'
  const [selectedGameSystem, setSelectedGameSystem] = useState(() => {
    try {
      const savedSys = localStorage.getItem(SYSTEM_STORAGE_KEY);
      if (savedSys && GAME_SYSTEMS[savedSys]) return savedSys;
    } catch (e) {}
    return 'coc';
  });

  // Role: null (show select screen), 'keeper', or 'investigator'
  const [selectedRole, setSelectedRole] = useState(() => {
    try {
      const savedRole = localStorage.getItem(ROLE_STORAGE_KEY);
      if (savedRole === 'keeper' || savedRole === 'investigator') return savedRole;
    } catch (e) {}
    return null;
  });

  const handleSelectGameAndRole = (sys, role) => {
    try {
      localStorage.setItem(SYSTEM_STORAGE_KEY, sys);
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    } catch (e) {}
    setSelectedGameSystem(sys);
    setSelectedRole(role);

    // If campaign character list is empty or doesn't match, load sample characters for that system
    const sysDefaults = GAME_SYSTEMS[sys]?.sampleCharacters;
    if (sysDefaults && (!campaign.characters || campaign.characters.length === 0)) {
      setCampaign((prev) => ({
        ...prev,
        characters: sysDefaults
      }));
      setActiveCharacterId(sysDefaults[0]?.id || null);
    }
  };

  const handleChangeGameSystem = (newSys) => {
    try {
      localStorage.setItem(SYSTEM_STORAGE_KEY, newSys);
    } catch (e) {}
    setSelectedGameSystem(newSys);
    const sysDefaults = GAME_SYSTEMS[newSys]?.sampleCharacters;
    if (sysDefaults && sysDefaults.length > 0) {
      setCampaign((prev) => ({
        ...prev,
        characters: sysDefaults
      }));
      setActiveCharacterId(sysDefaults[0]?.id || null);
    }
  };

  const handleChangeRole = () => {
    try { localStorage.removeItem(ROLE_STORAGE_KEY); } catch (e) {}
    setSelectedRole(null);
  };

  // Sync data-game-system attribute to HTML document root
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-game-system', selectedGameSystem);
    } catch (e) {}
  }, [selectedGameSystem]);

  const [storageNotice, setStorageNotice] = useState(null);

  // Load initial campaign from localStorage with schema migration safety
  const [campaign, setCampaign] = useState(() => {
    const { campaign: loaded, warningMessage } = loadAndMigrateCampaign(
      LOCAL_STORAGE_KEY,
      INITIAL_CAMPAIGN
    );
    if (warningMessage) {
      setTimeout(() => setStorageNotice(warningMessage), 0);
    }
    return loaded;
  });

  const [activeCharacterId, setActiveCharacterId] = useState(() => {
    return campaign.characters?.[0]?.id || null;
  });
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Firestore remote update handler — stable reference via useCallback
  const handleRemoteUpdate = useCallback((remoteData) => {
    setCampaign((prev) => ({
      ...prev,
      ...remoteData,
    }));
  }, []);

  const { syncStatus, roomCode, setRoomCode } = useFirebaseSync(
    campaign,
    handleRemoteUpdate,
    true /* isKeeper */
  );

  const [checkRollState, setCheckRollState] = useState({ isOpen: false, name: '', value: 50 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [diceLog, setDiceLog] = useState([]);
  const [expiredTimers, setExpiredTimers] = useState([]);

  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('coc_7e_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    } catch (e) {}
    return 'dark';
  });

  // Sync theme with html root element
  useEffect(() => {
    try {
      localStorage.setItem('coc_7e_theme', theme);
    } catch (e) {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Auto-save to LocalStorage with debounce + unload/visibility safety
  useEffect(() => {
    const saveCampaign = () => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(campaign));
      } catch (err) {
        console.error('Failed to save campaign to localStorage', err);
      }
    };

    const timer = setTimeout(saveCampaign, 400);

    const handleFlushSave = () => {
      clearTimeout(timer);
      saveCampaign();
    };

    window.addEventListener('beforeunload', handleFlushSave);
    document.addEventListener('visibilitychange', handleFlushSave);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', handleFlushSave);
      document.removeEventListener('visibilitychange', handleFlushSave);
    };
  }, [campaign]);

  // Handle Time Advancement
  const handleAdvanceTime = (minutesToAdvance) => {
    const currentMs = new Date(campaign.timeState.isoDate).getTime();
    const newMs = currentMs + (minutesToAdvance * 60 * 1000);
    const newIsoDate = new Date(newMs).toISOString();

    const newlyExpired = [];

    const updatedTimers = (campaign.timers || []).map((timer) => {
      const remaining = timer.remainingMinutes - minutesToAdvance;
      if (remaining <= 0 && timer.remainingMinutes > 0) {
        newlyExpired.push({ ...timer, remainingMinutes: 0 });
      }
      return {
        ...timer,
        remainingMinutes: Math.max(0, remaining)
      };
    });

    setCampaign((prev) => ({
      ...prev,
      timeState: {
        ...prev.timeState,
        isoDate: newIsoDate
      },
      timers: updatedTimers
    }));

    if (newlyExpired.length > 0) {
      setExpiredTimers((prev) => [...prev, ...newlyExpired]);
    }
  };

  const handleSetDateTime = (newIsoDate, season) => {
    setCampaign((prev) => ({
      ...prev,
      timeState: {
        ...prev.timeState,
        isoDate: newIsoDate,
        ...(season ? { season } : {})
      }
    }));
  };

  const handleAddTimer = (newTimer) => {
    setCampaign((prev) => ({
      ...prev,
      timers: [...(prev.timers || []), newTimer]
    }));
  };

  const handleDeleteTimer = (timerId) => {
    setCampaign((prev) => ({
      ...prev,
      timers: (prev.timers || []).filter(t => t.id !== timerId)
    }));
    setExpiredTimers((prev) => prev.filter(t => t.id !== timerId));
  };

  const handleExtendTimer = (timerId, extraMins) => {
    setCampaign((prev) => ({
      ...prev,
      timers: (prev.timers || []).map(t => t.id === timerId ? { ...t, remainingMinutes: extraMins, durationMinutes: extraMins } : t)
    }));
    setExpiredTimers((prev) => prev.filter(t => t.id !== timerId));
  };

  const handleDismissTimerAlert = (timerId) => {
    setExpiredTimers((prev) => prev.filter(t => t.id !== timerId));
  };

  const handleUpdateCharacter = (updatedChar) => {
    setCampaign((prev) => ({
      ...prev,
      characters: prev.characters.map(c => c.id === updatedChar.id ? updatedChar : c)
    }));
  };

  const handleAddCharacter = (newChar) => {
    setCampaign((prev) => ({
      ...prev,
      characters: [...prev.characters, newChar]
    }));
    setActiveCharacterId(newChar.id);
  };

  const handleDeleteCharacter = (charId) => {
    setCampaign((prev) => {
      const remaining = prev.characters.filter(c => c.id !== charId);
      return {
        ...prev,
        characters: remaining
      };
    });
    if (activeCharacterId === charId) {
      const nextChar = campaign.characters.find(c => c.id !== charId);
      setActiveCharacterId(nextChar ? nextChar.id : null);
    }
  };

  const handleUpdateCombatant = (combatantId, updates) => {
    setCampaign((prev) => ({
      ...prev,
      combat: {
        ...prev.combat,
        combatants: prev.combat.combatants.map(c => c.id === combatantId ? { ...c, ...updates } : c)
      }
    }));
  };

  const handleNextTurn = () => {
    setCampaign((prev) => {
      const total = prev.combat.combatants.length;
      if (total === 0) return prev;
      let nextIdx = (prev.combat.activeTurnIndex || 0) + 1;
      let nextRound = prev.combat.round || 1;
      if (nextIdx >= total) {
        nextIdx = 0;
        nextRound += 1;
      }
      return {
        ...prev,
        combat: {
          ...prev.combat,
          activeTurnIndex: nextIdx,
          round: nextRound
        }
      };
    });
  };

  const handlePrevTurn = () => {
    setCampaign((prev) => {
      const total = prev.combat.combatants.length;
      if (total === 0) return prev;
      let prevIdx = (prev.combat.activeTurnIndex || 0) - 1;
      let prevRound = prev.combat.round || 1;
      if (prevIdx < 0) {
        prevIdx = Math.max(0, total - 1);
        prevRound = Math.max(1, prevRound - 1);
      }
      return {
        ...prev,
        combat: {
          ...prev.combat,
          activeTurnIndex: prevIdx,
          round: prevRound
        }
      };
    });
  };

  const handleResetCombat = () => {
    setCampaign((prev) => ({
      ...prev,
      combat: {
        ...prev.combat,
        round: 1,
        activeTurnIndex: 0
      }
    }));
  };

  const handleAddCombatant = (newCombatant) => {
    setCampaign((prev) => ({
      ...prev,
      combat: {
        ...prev.combat,
        combatants: [...prev.combat.combatants, newCombatant]
      }
    }));
  };

  const handleRemoveCombatant = (combatantId) => {
    setCampaign((prev) => ({
      ...prev,
      combat: {
        ...prev.combat,
        combatants: prev.combat.combatants.filter(c => c.id !== combatantId)
      }
    }));
  };

  const handleClearAllCombatants = () => {
    setCampaign((prev) => ({
      ...prev,
      combat: {
        round: 1,
        activeTurnIndex: 0,
        combatants: []
      }
    }));
  };

  const handleTriggerRoll = (skillName, skillValue) => {
    setCheckRollState({ isOpen: true, name: skillName, value: skillValue });
  };

  const handleExportCampaign = () => {
    const jsonStr = JSON.stringify(campaign, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TTRPG_Campaign_${selectedGameSystem}_${campaign.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCampaign = (importedData) => {
    if (importedData && importedData.characters) {
      setCampaign(importedData);
      setActiveCharacterId(importedData.characters[0]?.id || null);
    }
  };

  const handleImportPdfInvestigator = (investigator) => {
    setCampaign((prev) => ({
      ...prev,
      characters: [investigator, ...prev.characters]
    }));
    setActiveCharacterId(investigator.id);
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset all campaign data to starter setup for active system?')) {
      const sampleChars = GAME_SYSTEMS[selectedGameSystem]?.sampleCharacters || INITIAL_CAMPAIGN.characters;
      const sampleCamp = { ...INITIAL_CAMPAIGN, characters: sampleChars };
      setCampaign(sampleCamp);
      setActiveCharacterId(sampleChars[0]?.id || null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const activeCharacter = campaign.characters.find(c => c.id === activeCharacterId) || campaign.characters[0];

  // === SYSTEM & ROLE ROUTING ===
  // No role selected → show landing selection screen for game systems and roles
  if (!selectedRole) {
    return (
      <SystemAndRoleSelectScreen
        onSelectGameAndRole={handleSelectGameAndRole}
      />
    );
  }

  // Investigator mode → show investigator-only dashboard
  if (selectedRole === 'investigator') {
    return (
      <ErrorBoundary>
        <InvestigatorApp
          gameSystem={selectedGameSystem}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onChangeRole={handleChangeRole}
          roomCode={roomCode}
        />
      </ErrorBoundary>
    );
  }

  // Keeper / GM mode → full GM dashboard
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      selectedGameSystem === 'cyberpunk'
        ? 'dark:bg-[#090507] bg-[#f4ecee] dark:text-[#f0f6fc] text-[#0d0d0d] bg-cyber-scanline selection:bg-[#e60037] selection:text-white'
        : selectedGameSystem === 'pf2e'
        ? 'dark:bg-[#10141d] bg-[#f4f1ea] dark:text-[#e2e8f0] text-[#1e293b] bg-pf2e-grid selection:bg-[#d4af37] selection:text-black'
        : 'dark:bg-[#141816] bg-[#F5F1E6] bg-grid-1960s dark:text-[#EBE6DB] text-[#1C201D] selection:bg-[#E65A2B] selection:text-white'
    }`}>
      {/* Storage Migration / Fallback Warning Banner */}
      {storageNotice && (
        <div className="bg-[#E65A2B] text-white px-4 py-2.5 flex items-center justify-between text-xs font-typewriter font-bold shadow-retro border-b-2 border-black">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{storageNotice}</span>
          </div>
          <button
            onClick={() => setStorageNotice(null)}
            aria-label="Dismiss warning notice"
            className="p-1 hover:bg-black/20 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* App Header */}
      <Header
        gameSystem={selectedGameSystem}
        campaignName={campaign.name}
        timeState={campaign.timeState}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        onExportCampaign={handleExportCampaign}
        onImportCampaign={handleImportCampaign}
        onImportPdfInvestigator={handleImportPdfInvestigator}
        onResetSampleData={handleResetSampleData}
        onChangeRole={handleChangeRole}
        onChangeGameSystem={handleChangeGameSystem}
        syncStatus={syncStatus}
        onOpenSync={() => setIsSyncModalOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 p-3 sm:p-4 max-w-[1800px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left / Center Main Pane: Character Sheet Manager */}
        <section className={`space-y-4 transition-all ${
          isSidebarOpen ? 'lg:col-span-8 xl:col-span-8' : 'lg:col-span-12'
        }`}>
          {/* Character Manager Tab Bar */}
          <CharacterManager
            gameSystem={selectedGameSystem}
            characters={campaign.characters}
            activeCharacterId={activeCharacterId}
            onSelectCharacter={setActiveCharacterId}
            onAddCharacter={handleAddCharacter}
          />

          {/* Active Character Sheet Interface */}
          <CharacterSheet
            gameSystem={selectedGameSystem}
            character={activeCharacter}
            onUpdateCharacter={handleUpdateCharacter}
            onDeleteCharacter={handleDeleteCharacter}
            onTriggerRoll={handleTriggerRoll}
          />
        </section>

        {/* Right Collapsible Side Panel */}
        {isSidebarOpen && (
          <aside className="lg:col-span-4 xl:col-span-4 space-y-4">
            {/* Multi-System Dice Console */}
            <DiceConsole
              gameSystem={selectedGameSystem}
              diceLog={diceLog}
              onAddDiceLog={(entry) => setDiceLog((prev) => [entry, ...prev])}
              onClearDiceLog={() => setDiceLog([])}
            />

            {/* Time & Calendar Widget */}
            <TimeTracker
              gameSystem={selectedGameSystem}
              timeState={campaign.timeState}
              timers={campaign.timers || []}
              characters={campaign.characters}
              onAdvanceTime={handleAdvanceTime}
              onSetDateTime={handleSetDateTime}
              onAddTimer={handleAddTimer}
              onDeleteTimer={handleDeleteTimer}
            />

            {/* Multi-System Combat Initiative Tracker */}
            <CombatTracker
              gameSystem={selectedGameSystem}
              combatState={campaign.combat || { round: 1, activeTurnIndex: 0, combatants: [] }}
              characters={campaign.characters}
              activeCharacterId={activeCharacterId}
              onSelectCharacter={setActiveCharacterId}
              onUpdateCombatant={handleUpdateCombatant}
              onNextTurn={handleNextTurn}
              onPrevTurn={handlePrevTurn}
              onResetCombat={handleResetCombat}
              onAddCombatant={handleAddCombatant}
              onRemoveCombatant={handleRemoveCombatant}
              onClearAllCombatants={handleClearAllCombatants}
            />
          </aside>
        )}
      </main>

      {/* Pop-up Check Roll Modal */}
      <CheckRollModal
        gameSystem={selectedGameSystem}
        isOpen={checkRollState.isOpen}
        onClose={() => setCheckRollState((prev) => ({ ...prev, isOpen: false }))}
        targetSkillName={checkRollState.name}
        targetValue={checkRollState.value}
        onAddDiceLog={(entry) => setDiceLog((prev) => [entry, ...prev])}
      />

      {/* Expired Timer Notification Modal */}
      <TimerAlertModal
        expiredTimers={expiredTimers}
        onDismiss={handleDismissTimerAlert}
        onExtend={handleExtendTimer}
      />
      {/* Sync Room Code Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        roomCode={roomCode}
        onSetRoomCode={setRoomCode}
        syncStatus={syncStatus}
      />
    </div>
  );
}

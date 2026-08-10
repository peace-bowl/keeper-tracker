import React, { useState } from 'react';
import {
  Swords, ChevronRight, ChevronLeft, Plus, RotateCcw, Trash2,
  Crosshair, Heart, Users
} from 'lucide-react';
import RetroNumberInput from './RetroNumberInput';

// Stable type badge color
function TypeBadge({ type, gameSystem }) {
  const map = {
    investigator: gameSystem === 'cyberpunk' ? 'bg-[#00f0ff] text-[#0d0d0d]' : gameSystem === 'pf2e' ? 'bg-[#3b82f6] text-white' : 'bg-[#2A6B60] text-[#F4EFE3]',
    npc: 'bg-[#D99F26] text-[#141816]',
    monster: gameSystem === 'cyberpunk' ? 'bg-[#ff0055] text-white' : 'bg-[#E65A2B] text-[#F4EFE3]',
  };
  const cls = map[type] || map.npc;
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-sm uppercase font-typewriter font-bold border border-black ${cls}`}>
      {type}
    </span>
  );
}

// HP bar visual
function HpBar({ current, max }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const color = pct > 50 ? 'bg-[#2A6B60]' : pct > 25 ? 'bg-[#D99F26]' : 'bg-[#E65A2B]';
  return (
    <div className="w-full h-1 dark:bg-[#2D3732] bg-[#C8BFB0] rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function CombatTracker({
  gameSystem = 'coc',
  combatState,
  characters = [],
  activeCharacterId,
  onSelectCharacter,
  onUpdateCombatant,
  onNextTurn,
  onPrevTurn,
  onResetCombat,
  onAddCombatant,
  onRemoveCombatant,
  onClearAllCombatants
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState('');
  const [addDex, setAddDex] = useState(50);
  const [addHp, setAddHp] = useState(10);
  const [addSan, setAddSan] = useState(50);
  const [addType, setAddType] = useState('monster');
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // PF2E 3-Action Economy tracker state per combatant ID
  const [actionsRemainingMap, setActionsRemainingMap] = useState({});

  const toggleActionMarker = (combatantId, actionIndex) => {
    setActionsRemainingMap((prev) => {
      const currentActions = prev[combatantId] !== undefined ? prev[combatantId] : 3;
      const newActions = currentActions === actionIndex + 1 ? actionIndex : actionIndex + 1;
      return { ...prev, [combatantId]: newActions };
    });
  };

  // Sort combatants according to active game system
  const sortedCombatants = [...(combatState.combatants || [])].sort((a, b) => {
    if (gameSystem === 'cyberpunk') {
      const initA = (parseInt(a.ref || a.dex || 8, 10)) + (parseInt(a.combatAwareness || 0, 10)) + (parseInt(a.initRoll || 5, 10));
      const initB = (parseInt(b.ref || b.dex || 8, 10)) + (parseInt(b.combatAwareness || 0, 10)) + (parseInt(b.initRoll || 5, 10));
      return initB - initA;
    } else if (gameSystem === 'pf2e') {
      const initA = (parseInt(a.perception || a.dex || 5, 10)) + (parseInt(a.initRoll || 10, 10));
      const initB = (parseInt(b.perception || b.dex || 5, 10)) + (parseInt(b.initRoll || 10, 10));
      return initB - initA;
    } else {
      // CoC 7e: DEX order (+50 for firearm readying)
      const dexA = (parseInt(a.dex, 10) || 0) + (a.readyingFirearm ? 50 : 0);
      const dexB = (parseInt(b.dex, 10) || 0) + (b.readyingFirearm ? 50 : 0);
      return dexB - dexA;
    }
  });

  const activeIndex = combatState.activeTurnIndex || 0;
  const activeCombatant = sortedCombatants[activeIndex];

  // Characters not yet in combat
  const availableInvestigators = characters.filter(ch =>
    !combatState.combatants.some(c => c.characterId === ch.id)
  );

  const handleAddInvestigator = (character) => {
    const newEntry = {
      id: `cmb-${Date.now()}-${character.id}`,
      characterId: character.id,
      name: character.name,
      type: character.type || 'investigator',
      dex: character.stats?.DEX || character.stats?.REF || 50,
      ref: character.stats?.REF || 8,
      perception: character.stats?.WIS || 6,
      readyingFirearm: false,
      hpCurrent: character.hp?.current || 10,
      hpMax: character.hp?.max || 10,
      sanityCurrent: character.sanity?.current || 50,
      sanityMax: character.sanity?.max || 99,
      status: { fightingBack: false, dodging: false, outOfAmmo: false }
    };
    onAddCombatant(newEntry);
  };

  const handleCreateCustom = () => {
    if (!addName.trim()) return;
    const newEntry = {
      id: `cmb-custom-${Date.now()}`,
      characterId: null,
      name: addName.trim(),
      type: addType,
      dex: parseInt(addDex, 10) || 50,
      ref: 8,
      perception: 6,
      readyingFirearm: false,
      hpCurrent: parseInt(addHp, 10) || 10,
      hpMax: parseInt(addHp, 10) || 10,
      sanityCurrent: parseInt(addSan, 10) || 50,
      sanityMax: 99,
      status: { fightingBack: false, dodging: false, outOfAmmo: false }
    };
    onAddCombatant(newEntry);
    setAddName('');
    setShowAddForm(false);
  };

  const handlePopulateAllRoster = () => {
    characters.forEach((ch) => {
      if (!combatState.combatants.some(c => c.characterId === ch.id)) {
        handleAddInvestigator(ch);
      }
    });
    setShowRegenerateConfirm(false);
  };

  return (
    <div className={`p-4 rounded-sm border-2 space-y-4 shadow-retro transition-colors duration-200 ${
      gameSystem === 'cyberpunk'
        ? 'dark:bg-[#0d1117] bg-[#ffffff] dark:text-[#f0f6fc] text-[#0d0d0d] border-[#ffee00] dark:border-[#21262d]'
        : gameSystem === 'pf2e'
        ? 'dark:bg-[#161c28] bg-[#ffffff] dark:text-[#e2e8f0] text-[#1e293b] border-[#d4af37] dark:border-[#1e293b]'
        : 'dark:bg-[#1C2320] bg-[#EBE4D4] dark:text-[#EBE6DB] text-[#161B18] dark:border-[#090C0A] border-[#1C201D]'
    }`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b-2 dark:border-[#090C0A] border-[#1C201D] pb-2.5">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-sm border-2 flex items-center justify-center font-bold shadow-retro-sm ${
            gameSystem === 'cyberpunk'
              ? 'bg-[#ff0055] text-white border-black'
              : gameSystem === 'pf2e'
              ? 'bg-[#3b82f6] text-white border-black'
              : 'bg-[#E65A2B] text-white border-[#090C0A]'
          }`}>
            <Swords className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <h2 className="text-xs font-bold font-display uppercase tracking-wider">
            {gameSystem === 'cyberpunk' ? 'STREET COMBAT TRACKER' : gameSystem === 'pf2e' ? 'PATHFINDER ENCOUNTER TRACKER' : 'TACTICAL COMBAT CONSOLE'}
          </h2>
        </div>

        {/* Round Counter & Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm dark:bg-[#141816] bg-[#FAF6EE] border dark:border-[#2D3732] border-[#1C201D] font-typewriter text-xs">
            <span className="text-[10px] opacity-70 uppercase">ROUND</span>
            <span className="font-bold text-[#D99F26]">{combatState.round || 1}</span>
          </div>

          <button
            onClick={onPrevTurn}
            title="Previous Turn"
            className="p-1 rounded-sm border dark:border-[#090C0A] border-[#1C201D] dark:bg-[#252E2A] bg-[#FAF6EE] hover:bg-[#D99F26] btn-retro cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onNextTurn}
            title="Next Turn"
            className="px-2 py-1 rounded-sm border border-black bg-[#E65A2B] text-white font-bold text-xs uppercase btn-retro flex items-center gap-1 cursor-pointer"
          >
            <span>NEXT</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Roster Auto-Populate Button */}
      {characters.length > 0 && availableInvestigators.length > 0 && (
        <button
          onClick={handlePopulateAllRoster}
          className="w-full py-1.5 px-2 rounded-sm border dark:border-[#2D3732] border-[#1C201D] dark:bg-[#141816] bg-[#FAF6EE] hover:border-[#E65A2B] text-[11px] font-typewriter font-bold flex items-center justify-center gap-1.5 btn-retro cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-[#E65A2B]" />
          <span>ADD ALL UNADDED CHARACTERS TO COMBAT ({availableInvestigators.length})</span>
        </button>
      )}

      {/* Combatants List */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {sortedCombatants.length === 0 ? (
          <div className="text-center py-6 text-xs opacity-60 font-typewriter uppercase border border-dashed rounded-sm">
            No combatants in initiative order. Add characters below.
          </div>
        ) : (
          sortedCombatants.map((c, idx) => {
            const isActive = idx === activeIndex;
            const effDex = (parseInt(c.dex, 10) || 0) + (c.readyingFirearm ? 50 : 0);
            const actionsLeft = actionsRemainingMap[c.id] !== undefined ? actionsRemainingMap[c.id] : 3;

            return (
              <div
                key={c.id}
                onClick={() => c.characterId && onSelectCharacter(c.characterId)}
                className={`p-2.5 rounded-sm border-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-[#E65A2B] dark:bg-[#141816] bg-[#FAF6EE] shadow-[0_0_10px_rgba(230,90,43,0.25)] translate-x-1'
                    : 'dark:border-[#2D3732] border-[#1C201D] dark:bg-[#141816]/50 bg-[#FAF6EE]/50 hover:border-[#D99F26]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Active turn indicator */}
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#E65A2B] animate-pulse' : 'bg-transparent'}`} />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs uppercase font-display">{c.name}</span>
                        <TypeBadge type={c.type} gameSystem={gameSystem} />
                      </div>

                      {/* Initiative Details */}
                      <div className="text-[10px] font-typewriter opacity-70 flex items-center gap-2 mt-0.5">
                        <span>{gameSystem === 'cyberpunk' ? `REF: ${c.dex}` : gameSystem === 'pf2e' ? `PERCEPTION: +${c.dex}` : `DEX: ${effDex}`}</span>
                        {c.readyingFirearm && (
                          <span className="text-[#E65A2B] font-bold">[READIED +50]</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Controls */}
                  <div className="flex items-center gap-2">
                    {/* PATHFINDER 2E 3-ACTION ECONOMY MARKERS */}
                    {gameSystem === 'pf2e' && (
                      <div className="flex items-center gap-1 bg-[#10141d] px-1.5 py-1 rounded border border-[#1e293b]" title="PF2e 3-Action Economy (Click markers to toggle actions spent)">
                        {[0, 1, 2].map((actIdx) => (
                          <button
                            key={actIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleActionMarker(c.id, actIdx);
                            }}
                            className={`w-4 h-4 text-[10px] font-bold rounded flex items-center justify-center transition-all ${
                              actIdx < actionsLeft
                                ? 'bg-[#d4af37] text-black shadow-[0_0_5px_rgba(212,175,55,0.6)]'
                                : 'bg-[#1e293b] text-gray-500 opacity-40'
                            }`}
                          >
                            ◆
                          </button>
                        ))}
                      </div>
                    )}

                    {/* CoC Firearm Readied Toggle */}
                    {gameSystem === 'coc' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateCombatant(c.id, { readyingFirearm: !c.readyingFirearm });
                        }}
                        title="Toggle Readied Firearm (+50 DEX Initiative Boost)"
                        className={`p-1 rounded border text-[10px] font-typewriter font-bold flex items-center gap-1 cursor-pointer ${
                          c.readyingFirearm
                            ? 'bg-[#E65A2B] text-white border-black'
                            : 'dark:bg-[#252E2A] bg-[#EFEAD8] dark:text-[#A8B2AC] text-[#5A6861]'
                        }`}
                      >
                        <Crosshair className="w-3 h-3" />
                      </button>
                    )}

                    {/* Quick HP adjustment */}
                    <div className="flex items-center gap-1 font-typewriter text-xs">
                      <Heart className="w-3 h-3 text-[#E65A2B]" />
                      <RetroNumberInput
                        min={0}
                        max={c.hpMax || 99}
                        value={c.hpCurrent}
                        onChange={(val) => onUpdateCombatant(c.id, { hpCurrent: val })}
                        className="w-12"
                        inputClassName="text-xs py-0 px-1 font-bold"
                      />
                      <span className="text-[10px] opacity-60">/{c.hpMax}</span>
                    </div>

                    {/* Delete Combatant */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCombatant(c.id);
                      }}
                      title="Remove from Combat"
                      className="text-rose-500 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-1.5">
                  <HpBar current={c.hpCurrent} max={c.hpMax} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Combatant Form */}
      {showAddForm ? (
        <div className="p-3 rounded-sm border-2 dark:border-[#2D3732] border-[#1C201D] dark:bg-[#141816] bg-[#FAF6EE] space-y-2.5 font-typewriter text-xs">
          <div className="font-bold uppercase text-[11px] text-[#D99F26]">Add Custom Combatant</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Name..."
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              className="px-2 py-1 rounded-sm dark:bg-[#1C2320] bg-[#EBE4D4] border dark:border-[#2D3732] border-[#1C201D]"
            />
            <select
              value={addType}
              onChange={(e) => setAddType(e.target.value)}
              className="px-2 py-1 rounded-sm dark:bg-[#1C2320] bg-[#EBE4D4] border dark:border-[#2D3732] border-[#1C201D]"
            >
              <option value="monster">Monster / Enemy</option>
              <option value="npc">NPC</option>
              <option value="investigator">Ally / Player</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] block opacity-70">
                {gameSystem === 'cyberpunk' ? 'REF STAT' : gameSystem === 'pf2e' ? 'PERCEPTION MOD' : 'DEX STAT'}
              </label>
              <input
                type="number"
                value={addDex}
                onChange={(e) => setAddDex(e.target.value)}
                className="w-full px-2 py-1 rounded-sm dark:bg-[#1C2320] bg-[#EBE4D4] border dark:border-[#2D3732] border-[#1C201D]"
              />
            </div>
            <div>
              <label className="text-[10px] block opacity-70">MAX HP</label>
              <input
                type="number"
                value={addHp}
                onChange={(e) => setAddHp(e.target.value)}
                className="w-full px-2 py-1 rounded-sm dark:bg-[#1C2320] bg-[#EBE4D4] border dark:border-[#2D3732] border-[#1C201D]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCreateCustom}
              className="flex-1 py-1.5 bg-[#E65A2B] text-white font-bold rounded-sm border border-black btn-retro cursor-pointer"
            >
              ADD TO COMBAT
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="py-1.5 px-3 opacity-70 hover:opacity-100 cursor-pointer"
            >
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex-1 py-1.5 rounded-sm border dark:border-[#2D3732] border-[#1C201D] dark:bg-[#141816] bg-[#FAF6EE] text-xs font-bold uppercase flex items-center justify-center gap-1 btn-retro cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD COMBATANT</span>
          </button>

          <button
            onClick={onClearAllCombatants}
            title="Clear All Combatants"
            className="p-1.5 rounded-sm border dark:border-[#2D3732] border-[#1C201D] dark:bg-[#141816] bg-[#FAF6EE] text-rose-500 hover:text-rose-400 btn-retro cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

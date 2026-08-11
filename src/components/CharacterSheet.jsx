import React, { useState } from 'react';
import { User, Shield, Heart, Zap, Sparkles, Trash2, FileText, Plus, X } from 'lucide-react';
import { getStatBreakdown, getDerivedSecondaryStats, getMovementRate } from '../utils/cocRules';
import SkillsSection from './SkillsSection';
import WeaponsSection from './WeaponsSection';
import RetroNumberInput from './RetroNumberInput';

import { GAME_SYSTEMS } from '../data/gameSystems';

export default function CharacterSheet({
  gameSystem = 'coc',
  character,
  onUpdateCharacter,
  onDeleteCharacter,
  onTriggerRoll,
  mobileTab, // 'sheet' | 'skills' | 'attacks' | 'notes' — set by mobile bottom nav
}) {
  const [activeTab, setActiveTab] = useState('stats');
  const [showAddCustomCond, setShowAddCustomCond] = useState(false);
  const [newCustomCondName, setNewCustomCondName] = useState('');
  const sysConfig = GAME_SYSTEMS[gameSystem] || GAME_SYSTEMS.coc;
  const terms = sysConfig.terms || GAME_SYSTEMS.coc.terms;

  // Mobile bottom-nav overrides the internal activeTab when provided
  const mobileTabMap = { sheet: 'stats', skills: 'skills', attacks: 'weapons', notes: 'notes' };
  const effectiveTab = mobileTab ? (mobileTabMap[mobileTab] ?? 'stats') : activeTab;

  if (!character) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center text-[#A8B2AC] font-typewriter">
        <User className="w-14 h-14 stroke-[1.5] mb-3 text-[#D99F26] opacity-60" />
        <p className="text-sm font-bold uppercase tracking-wider">{terms.noDossierSelected}</p>
        <p className="text-xs text-[#5A6861] mt-1">Select a record above or create a new entry.</p>
      </div>
    );
  }

  const { maxHp, maxMp, maxSan, majorWoundThreshold } = getDerivedSecondaryStats(
    character.stats.CON,
    character.stats.SIZ,
    character.stats.POW,
    character.skills?.find(s => s.name === 'Cthulhu Mythos')?.value || 0
  );

  const mov = getMovementRate(
    character.stats.STR,
    character.stats.SIZ,
    character.stats.DEX,
    character.age
  );

  const handleStatChange = (statKey, val) => {
    const num = Math.max(0, Math.min(99, parseInt(val, 10) || 0));
    onUpdateCharacter({
      ...character,
      stats: {
        ...character.stats,
        [statKey]: num
      }
    });
  };

  const handleSecondaryChange = (field, subField, val) => {
    const num = parseInt(val, 10) || 0;
    if (subField) {
      onUpdateCharacter({
        ...character,
        [field]: {
          ...character[field],
          [subField]: num
        }
      });
    } else {
      onUpdateCharacter({
        ...character,
        [field]: num
      });
    }
  };

  const toggleCondition = (condKey) => {
    onUpdateCharacter({
      ...character,
      conditions: {
        ...character.conditions,
        [condKey]: !character.conditions?.[condKey]
      }
    });
  };

  const handleAddCustomCondition = (e) => {
    if (e) e.preventDefault();
    const trimmed = newCustomCondName.trim();
    if (!trimmed) return;

    const newCond = {
      id: `custom-cond-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      active: true
    };

    onUpdateCharacter({
      ...character,
      customConditions: [...(character.customConditions || []), newCond]
    });

    setNewCustomCondName('');
    setShowAddCustomCond(false);
  };

  const toggleCustomCondition = (condId) => {
    onUpdateCharacter({
      ...character,
      customConditions: (character.customConditions || []).map((c) =>
        c.id === condId ? { ...c, active: !c.active } : c
      )
    });
  };

  const removeCustomCondition = (e, condId) => {
    e.stopPropagation();
    onUpdateCharacter({
      ...character,
      customConditions: (character.customConditions || []).filter((c) => c.id !== condId)
    });
  };

  return (
    <div className={`space-y-4 p-5 relative transition-colors ${
      gameSystem === 'cyberpunk'
        ? 'cyber-panel bg-[#060910] text-[#c8d8e8]'
        : gameSystem === 'pf2e'
        ? 'pf2e-panel bg-[#1e1508] text-[#e8d5b0]'
        : 'dark:bg-[#1C2320] bg-[#EFEAD8] dark:text-[#EBE6DB] text-[#161B18] dark:border-[#090C0A] border-[#1C201D] rounded-sm border-2 shadow-retro'
    }`}>

      {/* ── Compact mobile context bar (shown on non-sheet mobile pages) ── */}
      {mobileTab && mobileTab !== 'sheet' && (
        <div className={`flex items-center justify-between text-xs pb-2 border-b-2 ${
          gameSystem === 'cyberpunk' ? 'border-[#1a2e4a] font-cyber'
          : gameSystem === 'pf2e' ? 'border-[#3d2e1a] font-chronicle'
          : 'dark:border-[#2D3732] border-[#1C201D] font-display'
        }`}>
          <span className={`font-extrabold uppercase tracking-wider ${
            gameSystem === 'cyberpunk' ? 'text-[#00e5ff]'
            : gameSystem === 'pf2e' ? 'text-[#c8a84b]'
            : 'dark:text-[#F4EFE3] text-[#161B18]'
          }`}>
            {character.name}
          </span>
          <span className={`font-typewriter ${
            gameSystem === 'cyberpunk' ? 'text-[#4a6b8a]'
            : gameSystem === 'pf2e' ? 'text-[#7a6040]'
            : 'dark:text-[#A8B2AC] text-[#5A6861]'
          }`}>
            HP <strong className="dark:text-[#F4EFE3] text-[#161B18]" style={{
              color: gameSystem === 'cyberpunk' ? '#00e5ff' : gameSystem === 'pf2e' ? '#c8a84b' : undefined
            }}>{character.hp?.current ?? maxHp}</strong>/{character.hp?.max ?? maxHp}
            {' · '}
            SAN <strong style={{
              color: gameSystem === 'cyberpunk' ? '#00e5ff' : gameSystem === 'pf2e' ? '#c8a84b' : '#D99F26'
            }}>{character.sanity?.current ?? character.san?.current ?? 50}</strong>
          </span>
        </div>
      )}
      {/* ── Full Top Banner (hidden on non-sheet mobile pages) ── */}
      {(!mobileTab || mobileTab === 'sheet') && (
      <div className={`flex flex-wrap items-center justify-between gap-4 p-4 ${
        gameSystem === 'cyberpunk'
          ? 'bg-[#040710] border border-[#1a2e4a] border-l-[#00e5ff] border-l-2'
          : gameSystem === 'pf2e'
          ? 'bg-[#160f04] border border-[#3d2e1a] border-t-[#c8a84b] border-t-2 rounded-sm'
          : 'dark:bg-[#141816] bg-[#E3DAC8] dark:text-[#EBE6DB] text-[#161B18] dark:border-[#090C0A] border-[#1C201D] rounded-sm border-2 shadow-retro-sm'
      }`}>
        <div className="flex items-center gap-3.5">
          {/* Avatar Box */}
          <div className={`w-11 h-11 flex items-center justify-center font-extrabold text-xl uppercase ${
            gameSystem === 'cyberpunk'
              ? 'bg-[#e60037] text-white border border-[#00e5ff] font-cyber shadow-[0_0_10px_rgba(230,0,55,0.5)]'
              : gameSystem === 'pf2e'
              ? 'bg-[#c8a84b] text-[#160f04] border border-[#8b2020] font-chronicle rounded-full shadow-[0_0_8px_rgba(200,168,75,0.4)]'
              : 'rounded-sm bg-[#E65A2B] border-2 dark:border-[#090C0A] border-[#1C201D] text-[#F4EFE3] font-display shadow-retro-sm'
          }`}>
            {character.name ? character.name.substring(0, 2) : 'CC'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={character.name}
                onChange={(e) => onUpdateCharacter({ ...character, name: e.target.value })}
                className={`bg-transparent font-bold text-lg focus:outline-none px-1.5 py-0.5 border border-transparent ${
                  gameSystem === 'cyberpunk'
                    ? 'font-cyber text-[#c8d8e8] focus:bg-[#040710] focus:border-[#00e5ff]'
                    : gameSystem === 'pf2e'
                    ? 'font-chronicle text-[#e8d5b0] focus:bg-[#160f04] focus:border-[#c8a84b] rounded-sm'
                    : 'font-display dark:text-[#F4EFE3] text-[#161B18] dark:focus:bg-[#1C2320] focus:bg-[#FAF6EE] focus:border-[#E65A2B] rounded-sm'
                }`}
              />
              <span className={`text-[10px] px-2 py-0.5 font-bold uppercase border ${
                gameSystem === 'cyberpunk'
                  ? 'font-cyber bg-[#e60037] text-white border-[#00e5ff]'
                  : gameSystem === 'pf2e'
                  ? 'font-chronicle bg-[#c8a84b]/20 text-[#c8a84b] border-[#c8a84b] rounded-sm'
                  : 'font-typewriter rounded-sm bg-[#D99F26] text-[#141816] dark:border-[#090C0A] border-[#1C201D]'
              }`}>
                {character.type === 'investigator' ? terms.playerTitle.toUpperCase() : character.type.toUpperCase()}
              </span>
            </div>
            <div className={`flex items-center gap-3 text-xs mt-0.5 font-semibold ${
              gameSystem === 'cyberpunk' ? 'font-cyber text-[#4a6b8a]'
              : gameSystem === 'pf2e' ? 'font-typewriter text-[#7a6040]'
              : 'font-typewriter dark:text-[#A8B2AC] text-[#5A6861]'
            }`}>
              <span>{character.occupation || terms.playerTitle}</span>
              <span className="opacity-30">•</span>
              <span>AGE {character.age || 30}</span>
              <span className="opacity-30">•</span>
              <span>MOV: <strong style={{
                color: gameSystem === 'cyberpunk' ? '#00e5ff' : gameSystem === 'pf2e' ? '#c8a84b' : '#E65A2B'
              }}>{mov}</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDeleteCharacter(character.id)}
          className={`text-xs font-bold uppercase flex items-center gap-1.5 border-2 px-3 py-1.5 cursor-pointer transition-all ${
            gameSystem === 'cyberpunk'
              ? 'font-cyber bg-[#040710] text-[#4a6b8a] border-[#1a2e4a] hover:border-[#e60037] hover:text-[#e60037]'
              : gameSystem === 'pf2e'
              ? 'font-chronicle bg-[#160f04] text-[#7a6040] border-[#3d2e1a] hover:border-[#8b2020] hover:text-[#8b2020] rounded-sm'
              : 'font-display dark:text-[#A8B2AC] text-[#5A6861] hover:text-[#E65A2B] dark:border-[#2D3732] border-[#1C201D] hover:border-[#E65A2B] rounded-sm btn-retro dark:bg-[#1C2320] bg-[#FAF6EE]'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{terms.purgeDossier}</span>
        </button>
      </div>
      )}

      {/* ── Conditions (hidden on non-sheet mobile pages) ── */}
      {(!mobileTab || mobileTab === 'sheet') && (
      <div className={`flex flex-wrap items-center gap-2 p-2.5 ${
        gameSystem === 'cyberpunk'
          ? 'bg-[#040710] border border-[#1a2e4a]'
          : gameSystem === 'pf2e'
          ? 'bg-[#160f04] border border-[#3d2e1a] rounded-sm'
          : 'dark:bg-[#141816] bg-[#DCD4C2] border-2 dark:border-[#090C0A] border-[#1C201D] rounded-sm'
      }`}>
        <span className={`text-xs font-bold uppercase tracking-wider mr-1 flex items-center gap-1 ${
          gameSystem === 'cyberpunk' ? 'font-cyber text-[#4a6b8a]'
          : gameSystem === 'pf2e' ? 'font-chronicle text-[#7a6040]'
          : 'font-typewriter dark:text-[#EBE6DB] text-[#161B18]'
        }`}>
          <FileText className={`w-3.5 h-3.5 ${
            gameSystem === 'cyberpunk' ? 'text-[#00e5ff]' : gameSystem === 'pf2e' ? 'text-[#c8a84b]' : 'text-[#E65A2B]'
          }`} /> {terms.vitalStatus}:
        </span>
        {['majorWound', 'unconscious', 'dying', 'tempInsane', 'indefinitelyInsane'].map((condKey) => {
          const active = character.conditions?.[condKey];
          const effectiveThresh = majorWoundThreshold || Math.floor((character.hp?.max || 10) / 2);
          const label = condKey === 'majorWound' ? `${terms.majorWoundLabel || 'MAJOR WOUND'} (TH:${effectiveThresh})` : condKey.replace(/([A-Z])/g, ' $1').toUpperCase();
          return (
            <button
              key={condKey}
              type="button"
              onClick={() => toggleCondition(condKey)}
              className={`px-2.5 py-0.5 text-[11px] font-bold border transition-all cursor-pointer ${
                gameSystem === 'cyberpunk'
                  ? `font-cyber ${ active ? 'bg-[#e60037] text-white border-[#00e5ff] shadow-[0_0_6px_rgba(230,0,55,0.5)]' : 'bg-[#040710] text-[#4a6b8a] border-[#1a2e4a] hover:border-[#e60037] hover:text-[#e60037]' }`
                  : gameSystem === 'pf2e'
                  ? `font-chronicle rounded-sm ${ active ? 'bg-[#8b2020] text-[#f5e6c8] border-[#c8a84b]' : 'bg-[#160f04] text-[#7a6040] border-[#3d2e1a] hover:border-[#c8a84b] hover:text-[#c8a84b]' }`
                  : `font-typewriter rounded-sm border-2 ${ active ? 'bg-[#E65A2B] text-[#F4EFE3] border-[#090C0A] shadow-retro-sm scale-105' : 'dark:bg-[#1C2320] bg-[#FAF6EE] dark:text-[#A8B2AC] text-[#5A6861] dark:border-[#2D3732] border-[#1C201D] hover:border-[#E65A2B]' }`
              }`}
            >
              {active ? `[!] ${label}` : label}
            </button>
          );
        })}

        {/* Custom Conditions */}
        {(character.customConditions || []).map((cond) => (
          <div
            key={cond.id}
            onClick={() => toggleCustomCondition(cond.id)}
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-typewriter font-bold border-2 transition-all rounded-sm cursor-pointer select-none ${
              cond.active
                ? 'bg-[#D99F26] text-[#141816] border-[#090C0A] shadow-retro-sm scale-105'
                : 'dark:bg-[#1C2320] bg-[#FAF6EE] dark:text-[#A8B2AC] text-[#5A6861] dark:border-[#2D3732] border-[#1C201D] hover:border-[#D99F26]'
            }`}
          >
            <span>{cond.active ? `[!] ${cond.name.toUpperCase()}` : cond.name.toUpperCase()}</span>
            <button
              type="button"
              onClick={(e) => removeCustomCondition(e, cond.id)}
              title="Remove custom condition"
              className="p-0.5 hover:text-red-500 rounded-xs transition-colors"
            >
              <X className="w-3 h-3 stroke-[3]" />
            </button>
          </div>
        ))}

        {/* Add Custom Condition Form / Button */}
        {showAddCustomCond ? (
          <form onSubmit={handleAddCustomCondition} className="inline-flex items-center gap-1">
            <input
              type="text"
              autoFocus
              placeholder="Condition Name..."
              value={newCustomCondName}
              onChange={(e) => setNewCustomCondName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowAddCustomCond(false);
                  setNewCustomCondName('');
                }
              }}
              className="px-2 py-0.5 text-[11px] font-typewriter font-bold dark:bg-[#1C2320] bg-[#FAF6EE] dark:text-[#F4EFE3] text-[#161B18] border-2 border-[#E65A2B] rounded-sm outline-none w-36"
            />
            <button
              type="submit"
              className="px-2 py-0.5 text-[10px] font-display font-bold uppercase bg-[#E65A2B] text-[#F4EFE3] border border-[#090C0A] rounded-sm btn-retro cursor-pointer"
            >
              ADD
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddCustomCond(false);
                setNewCustomCondName('');
              }}
              className="px-1.5 py-0.5 text-[10px] font-display font-bold uppercase dark:bg-[#1C2320] bg-[#FAF6EE] dark:text-[#A8B2AC] text-[#5A6861] border border-[#1C201D] rounded-sm cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddCustomCond(true)}
            className="px-2 py-0.5 text-[11px] font-typewriter font-bold border-2 border-dashed border-[#D99F26] text-[#D99F26] hover:bg-[#D99F26]/10 rounded-sm cursor-pointer inline-flex items-center gap-1 transition-colors"
            title="Add Custom Condition"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>CUSTOM</span>
          </button>
        )}
      </div>
      )}

      {/* ── Secondary Attributes Meter Row (hidden on non-sheet mobile pages) ── */}
      {(!mobileTab || mobileTab === 'sheet') && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* HP Meter */}
        <div className="dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#EBE6DB] text-[#161B18] p-3 rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] space-y-1.5 shadow-retro-sm">
          <div className="flex items-center justify-between text-xs font-typewriter dark:text-[#A8B2AC] text-[#5A6861]">
            <span className="flex items-center gap-1 font-bold text-[#2A6B60]">
              <Heart className="w-3.5 h-3.5 stroke-[2.5]" /> HEALTH (HP)
            </span>
            <span className="font-bold">MAX: {maxHp}</span>
          </div>
          <div className="flex items-center gap-2">
            <RetroNumberInput
              min={0}
              max={maxHp * 2}
              value={character.hp?.current ?? 10}
              onChange={(val) => handleSecondaryChange('hp', 'current', val)}
              accentColor="teal"
              className="w-full shrink"
              inputClassName="text-base font-bold"
            />
            <span className="dark:text-[#3D4B44] text-[#C8BFB0] font-typewriter font-bold">/</span>
            <RetroNumberInput
              min={1}
              max={99}
              value={character.hp?.max ?? maxHp}
              onChange={(val) => handleSecondaryChange('hp', 'max', val)}
              accentColor="teal"
              className="w-full shrink"
              inputClassName="text-sm font-bold dark:text-[#A8B2AC] text-[#5A6861]"
            />
          </div>
        </div>

        {/* Primary Special Meter (Sanity / Humanity / Hero Points) */}
        <div className="dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#EBE6DB] text-[#161B18] p-3 rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] space-y-1.5 shadow-retro-sm">
          <div className="flex items-center justify-between text-xs font-typewriter dark:text-[#A8B2AC] text-[#5A6861]">
            <span className="flex items-center gap-1 font-bold text-[#D99F26]">
              <Zap className="w-3.5 h-3.5 stroke-[2.5]" /> {terms.sanityMeter}
            </span>
            <span className="font-bold">MAX: {maxSan}</span>
          </div>
          <div className="flex items-center gap-2">
            <RetroNumberInput
              min={0}
              max={maxSan}
              value={character.sanity?.current ?? 50}
              onChange={(val) => handleSecondaryChange('sanity', 'current', val)}
              accentColor="ochre"
              className="w-full shrink"
              inputClassName="text-base font-bold"
            />
            <button
              onClick={() => onTriggerRoll(`${terms.sanityMeter} Check`, character.sanity?.current || 50)}
              className="px-2.5 py-1 bg-[#D99F26] text-[#141816] font-display uppercase font-bold text-xs rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] btn-retro shrink-0 cursor-pointer"
              title="Roll Check"
            >
              Check
            </button>
          </div>
        </div>

        {/* Secondary Magic/Net Meter */}
        <div className="dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#EBE6DB] text-[#161B18] p-3 rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] space-y-1.5 shadow-retro-sm">
          <div className="flex items-center justify-between text-xs font-typewriter dark:text-[#A8B2AC] text-[#5A6861]">
            <span className="flex items-center gap-1 font-bold text-[#2A6B60]">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" /> {terms.magicMeter}
            </span>
            <span className="font-bold">MAX: {maxMp}</span>
          </div>
          <div className="flex items-center gap-2">
            <RetroNumberInput
              min={0}
              max={maxMp * 2}
              value={character.mp?.current ?? 10}
              onChange={(val) => handleSecondaryChange('mp', 'current', val)}
              accentColor="teal"
              className="w-full shrink"
              inputClassName="text-base font-bold"
            />
            <span className="dark:text-[#3D4B44] text-[#C8BFB0] font-typewriter font-bold">/</span>
            <RetroNumberInput
              min={1}
              max={99}
              value={character.mp?.max ?? maxMp}
              onChange={(val) => handleSecondaryChange('mp', 'max', val)}
              accentColor="teal"
              className="w-full shrink"
              inputClassName="text-sm font-bold dark:text-[#A8B2AC] text-[#5A6861]"
            />
          </div>
        </div>

        {/* LUCK / Perception Meter */}
        <div className="dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#EBE6DB] text-[#161B18] p-3 rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] space-y-1.5 shadow-retro-sm">
          <div className="flex items-center justify-between text-xs font-typewriter dark:text-[#A8B2AC] text-[#5A6861]">
            <span className="flex items-center gap-1 font-bold text-[#E65A2B]">
              <Shield className="w-3.5 h-3.5 stroke-[2.5]" /> {terms.luckMeter}
            </span>
            <span className="font-bold">VAL</span>
          </div>
          <div className="flex items-center gap-2">
            <RetroNumberInput
              min={0}
              max={99}
              value={character.luck ?? 50}
              onChange={(val) => handleSecondaryChange('luck', null, val)}
              accentColor="orange"
              className="w-full shrink"
              inputClassName="text-base font-bold"
            />
            <button
              onClick={() => onTriggerRoll(`${terms.luckMeter} Check`, character.luck || 50)}
              className="px-2.5 py-1 bg-[#E65A2B] text-[#F4EFE3] font-display uppercase font-bold text-xs rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] btn-retro shrink-0 cursor-pointer"
              title="Roll Check"
            >
              Roll
            </button>
          </div>
        </div>
      </div>
      )}

      {/* ── Dossier Section Navigation Tabs (hidden when mobileTab controls navigation) ── */}
      {!mobileTab && (
      <div className={`flex items-center gap-2 pb-2 ${
        gameSystem === 'cyberpunk' ? 'border-b border-[#1a2e4a]'
        : gameSystem === 'pf2e' ? 'border-b border-[#3d2e1a]'
        : 'border-b-2 dark:border-[#090C0A] border-[#1C201D]'
      }`}>
        {['stats', 'skills', 'weapons', 'notes'].map((tabKey) => {
          const labels = {
            stats: 'CORE CHARACTERISTICS',
            skills: `${terms.skillsTab} (${character.skills?.length || 0})`,
            weapons: `ATTACKS & ARMORY (${character.weapons?.length || 0})`,
            notes: terms.notesTab
          };

          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-3.5 py-1.5 text-xs font-bold tracking-wider transition-all ${
                gameSystem === 'cyberpunk'
                  ? `font-cyber border-b-2 border-t-0 border-x-0 ${ activeTab === tabKey ? 'text-[#00e5ff] border-[#00e5ff] bg-transparent' : 'text-[#4a6b8a] border-transparent hover:border-[#1a2e4a] bg-transparent' }`
                  : gameSystem === 'pf2e'
                  ? `font-chronicle uppercase rounded-sm ${ activeTab === tabKey ? 'bg-[#160f04] text-[#c8a84b] border border-[#c8a84b]/40' : 'bg-transparent text-[#7a6040] border border-transparent hover:border-[#3d2e1a]' }`
                  : `font-display uppercase rounded-sm border-2 ${ activeTab === tabKey ? 'dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#F4EFE3] text-[#161B18] dark:border-[#090C0A] border-[#1C201D] shadow-retro-sm' : 'dark:bg-[#252E2A] bg-[#DCD4C2] dark:text-[#A8B2AC] text-[#5A6861] border-transparent hover:border-[#1C201D]/30' }`
              }`}
            >
              {labels[tabKey]}
            </button>
          );
        })}
      </div>
      )}

      {/* Tab 1: Core Characteristics Grid */}
      {effectiveTab === 'stats' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            gameSystem === 'cyberpunk'
              ? ['INT', 'REF', 'DEX', 'TECH', 'COOL', 'WILL', 'LUCK', 'MOVE', 'BODY', 'EMP']
              : gameSystem === 'pf2e'
              ? ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
              : ['STR', 'CON', 'SIZ', 'DEX', 'APP', 'INT', 'POW', 'EDU']
          ).map((statKey) => {
            const val = character.stats?.[statKey] || 50;
            const breakdown = getStatBreakdown(val);

            return (
              <div
                key={statKey}
                className={`p-3 space-y-1.5 relative ${
                  gameSystem === 'cyberpunk'
                    ? 'bg-[#040710] border border-[#1a2e4a] border-l-2 border-l-[#00e5ff]/40 cyber-corner'
                    : gameSystem === 'pf2e'
                    ? 'bg-[#160f04] border border-[#3d2e1a] border-t border-t-[#c8a84b]/30 rounded-sm'
                    : 'dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#EBE6DB] text-[#161B18] rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] shadow-retro-sm'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold text-sm ${
                    gameSystem === 'cyberpunk' ? 'font-cyber text-[#00e5ff]'
                    : gameSystem === 'pf2e' ? 'font-chronicle text-[#c8a84b]'
                    : 'font-typewriter text-[#D99F26]'
                  }`}>{statKey}</span>
                  <button
                    onClick={() => onTriggerRoll(`${statKey} Check`, val)}
                    className={`px-2 py-0.5 font-bold uppercase text-[10px] border cursor-pointer transition-all ${
                      gameSystem === 'cyberpunk'
                        ? 'font-cyber bg-[#e60037] text-white border-[#00e5ff]/40 hover:shadow-[0_0_6px_rgba(230,0,55,0.5)]'
                        : gameSystem === 'pf2e'
                        ? 'font-chronicle bg-[#8b2020] text-[#f5e6c8] border-[#c8a84b]/40 rounded-sm'
                        : 'font-display rounded-sm bg-[#E65A2B] text-[#F4EFE3] border-[#090C0A] btn-retro'
                    }`}
                  >
                    Roll
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <RetroNumberInput
                    min={0}
                    max={99}
                    value={val}
                    onChange={(newVal) => handleStatChange(statKey, newVal)}
                    accentColor={gameSystem === 'cyberpunk' ? 'cyber' : gameSystem === 'pf2e' ? 'gold' : 'ochre'}
                    className="w-24 shrink-0"
                    inputClassName="text-lg font-bold"
                  />

                  {gameSystem !== 'cyberpunk' && (
                    <div className={`flex flex-col text-[11px] font-semibold text-right ${
                      gameSystem === 'pf2e' ? 'font-typewriter text-[#7a6040]' : 'font-typewriter dark:text-[#A8B2AC] text-[#5A6861]'
                    }`}>
                      <span>1/2: <strong className={gameSystem === 'pf2e' ? 'text-[#c8a84b]' : 'dark:text-[#F4EFE3] text-[#161B18]'}>{breakdown.hard}</strong></span>
                      <span>1/5: <strong className={gameSystem === 'pf2e' ? 'text-[#8b2020]' : 'text-[#D99F26]'}>{breakdown.extreme}</strong></span>
                    </div>
                  )}
                  {gameSystem === 'cyberpunk' && (
                    <div className="flex flex-col text-[11px] font-cyber text-right text-[#4a6b8a]">
                      <span>×2: <strong className="text-[#00e5ff]">{val * 2}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Skills List */}
      {effectiveTab === 'skills' && (
        <SkillsSection
          skills={character.skills || []}
          onUpdateSkill={(skillName, updates) => {
            const newSkills = character.skills.map(s => s.name === skillName ? { ...s, ...updates } : s);
            onUpdateCharacter({ ...character, skills: newSkills });
          }}
          onAddSkill={(newSkill) => {
            onUpdateCharacter({ ...character, skills: [...(character.skills || []), newSkill] });
          }}
          onDeleteSkill={(skillName) => {
            const newSkills = character.skills.filter(s => s.name !== skillName);
            onUpdateCharacter({ ...character, skills: newSkills });
          }}
          onTriggerRoll={onTriggerRoll}
        />
      )}

      {/* Tab 3: Weapons */}
      {effectiveTab === 'weapons' && (
        <WeaponsSection
          character={character}
          onUpdateWeapon={(weaponId, updates) => {
            const newWeps = character.weapons.map(w => w.id === weaponId ? { ...w, ...updates } : w);
            onUpdateCharacter({ ...character, weapons: newWeps });
          }}
          onAddWeapon={(newWep) => {
            onUpdateCharacter({ ...character, weapons: [...(character.weapons || []), newWep] });
          }}
          onDeleteWeapon={(weaponId) => {
            const newWeps = character.weapons.filter(w => w.id !== weaponId);
            onUpdateCharacter({ ...character, weapons: newWeps });
          }}
          onTriggerRoll={onTriggerRoll}
        />
      )}

      {/* Tab 4: Notes & Inventory */}
      {effectiveTab === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-typewriter">
          <div className="space-y-1.5">
            <label className="dark:text-[#EBE6DB] text-[#161B18] font-bold block uppercase tracking-wider">{terms.backstoryLabel}</label>
            <textarea
              rows="7"
              value={character.notes || ''}
              onChange={(e) => onUpdateCharacter({ ...character, notes: e.target.value })}
              className="w-full dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#EBE6DB] text-[#161B18] border-2 dark:border-[#090C0A] border-[#1C201D] rounded-sm p-3 focus:outline-none focus:border-[#E65A2B] font-typewriter placeholder-[#A8B2AC]"
              placeholder={terms.notesPlaceholder}
            />
          </div>

          <div className="space-y-1.5">
            <label className="dark:text-[#EBE6DB] text-[#161B18] font-bold block uppercase tracking-wider">{terms.inventoryLabel}</label>
            <textarea
              rows="7"
              value={character.inventory || ''}
              onChange={(e) => onUpdateCharacter({ ...character, inventory: e.target.value })}
              className="w-full dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#EBE6DB] text-[#161B18] border-2 dark:border-[#090C0A] border-[#1C201D] rounded-sm p-3 focus:outline-none focus:border-[#E65A2B] font-typewriter placeholder-[#A8B2AC]"
              placeholder="Equipment, possessions, loot, cyberware, items..."
            />
          </div>
        </div>
      )}
    </div>
  );
}



import React, { useState } from 'react';
import { User, Shield, Heart, Zap, Sparkles, Trash2, FileText } from 'lucide-react';
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
  onTriggerRoll
}) {
  const [activeTab, setActiveTab] = useState('stats');
  const sysConfig = GAME_SYSTEMS[gameSystem] || GAME_SYSTEMS.coc;
  const terms = sysConfig.terms || GAME_SYSTEMS.coc.terms;

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

  return (
    <div className={`space-y-4 p-5 rounded-sm border-2 shadow-retro relative transition-colors ${
      gameSystem === 'cyberpunk'
        ? 'dark:bg-[#0d1117] bg-[#ffffff] dark:text-[#f0f6fc] text-[#0d0d0d] border-[#ffee00] dark:border-[#21262d]'
        : gameSystem === 'pf2e'
        ? 'dark:bg-[#161c28] bg-[#ffffff] dark:text-[#e2e8f0] text-[#1e293b] border-[#d4af37] dark:border-[#1e293b]'
        : 'dark:bg-[#1C2320] bg-[#EFEAD8] dark:text-[#EBE6DB] text-[#161B18] dark:border-[#090C0A] border-[#1C201D]'
    }`}>
      {/* Top Banner & Classification Badge */}
      <div className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-sm border-2 shadow-retro-sm ${
        gameSystem === 'cyberpunk'
          ? 'dark:bg-[#161b22] bg-[#f4f6f8] dark:border-[#21262d] border-[#d0d7de]'
          : gameSystem === 'pf2e'
          ? 'dark:bg-[#10141d] bg-[#f8f6f0] dark:border-[#1e293b] border-[#e2e8f0]'
          : 'dark:bg-[#141816] bg-[#E3DAC8] dark:text-[#EBE6DB] text-[#161B18] dark:border-[#090C0A] border-[#1C201D]'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-sm bg-[#E65A2B] border-2 dark:border-[#090C0A] border-[#1C201D] flex items-center justify-center text-[#F4EFE3] font-display font-extrabold text-xl uppercase shadow-retro-sm">
            {character.name ? character.name.substring(0, 2) : 'CC'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={character.name}
                onChange={(e) => onUpdateCharacter({ ...character, name: e.target.value })}
                className="bg-transparent font-display font-bold text-lg dark:text-[#F4EFE3] text-[#161B18] focus:outline-none dark:focus:bg-[#1C2320] focus:bg-[#FAF6EE] px-1.5 py-0.5 rounded-sm border border-transparent focus:border-[#E65A2B]"
              />
              <span className="text-[10px] px-2 py-0.5 rounded-sm font-typewriter uppercase bg-[#D99F26] text-[#141816] font-bold border dark:border-[#090C0A] border-[#1C201D]">
                {character.type === 'investigator' ? terms.playerTitle.toUpperCase() : character.type.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs dark:text-[#A8B2AC] text-[#5A6861] font-typewriter mt-0.5 font-semibold">
              <span>{character.occupation || terms.playerTitle}</span>
              <span className="dark:text-[#3D4B44] text-[#C8BFB0]">•</span>
              <span>AGE {character.age || 30}</span>
              <span className="dark:text-[#3D4B44] text-[#C8BFB0]">•</span>
              <span>MOV: <strong className="text-[#E65A2B]">{mov}</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDeleteCharacter(character.id)}
          className="text-xs dark:text-[#A8B2AC] text-[#5A6861] hover:text-[#E65A2B] font-display font-bold uppercase flex items-center gap-1.5 border-2 dark:border-[#2D3732] border-[#1C201D] hover:border-[#E65A2B] px-3 py-1.5 rounded-sm btn-retro dark:bg-[#1C2320] bg-[#FAF6EE] cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{terms.purgeDossier}</span>
        </button>
      </div>

      {/* Conditions */}
      <div className="flex flex-wrap items-center gap-2 dark:bg-[#141816] bg-[#DCD4C2] p-2.5 rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D]">
        <span className="text-xs font-typewriter font-bold dark:text-[#EBE6DB] text-[#161B18] uppercase tracking-wider mr-1 flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-[#E65A2B]" /> {terms.vitalStatus}:
        </span>
        {['majorWound', 'unconscious', 'dying', 'tempInsane', 'indefinitelyInsane'].map((condKey) => {
          const active = character.conditions?.[condKey];
          const effectiveThresh = majorWoundThreshold || Math.floor((character.hp?.max || 10) / 2);
          const label = condKey === 'majorWound' ? `${terms.majorWoundLabel} (TH:${effectiveThresh})` : condKey.replace(/([A-Z])/g, ' $1').toUpperCase();
          return (
            <button
              key={condKey}
              onClick={() => toggleCondition(condKey)}
              className={`px-2.5 py-0.5 text-[11px] font-typewriter font-bold border-2 transition-all rounded-sm cursor-pointer ${
                active
                  ? 'bg-[#E65A2B] text-[#F4EFE3] border-[#090C0A] shadow-retro-sm scale-105'
                  : 'dark:bg-[#1C2320] bg-[#FAF6EE] dark:text-[#A8B2AC] text-[#5A6861] dark:border-[#2D3732] border-[#1C201D] hover:border-[#E65A2B]'
              }`}
            >
              {active ? `[!] ${label}` : label}
            </button>
          );
        })}
      </div>

      {/* Secondary Attributes Meter Row */}
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

      {/* Dossier Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b-2 dark:border-[#090C0A] border-[#1C201D] pb-2">
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
              className={`px-3.5 py-1.5 rounded-sm text-xs font-display uppercase font-bold tracking-wider transition-all border-2 ${
                activeTab === tabKey
                  ? 'dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#F4EFE3] text-[#161B18] dark:border-[#090C0A] border-[#1C201D] shadow-retro-sm'
                  : 'dark:bg-[#252E2A] bg-[#DCD4C2] dark:text-[#A8B2AC] text-[#5A6861] border-transparent hover:border-[#1C201D]/30'
              }`}
            >
              {labels[tabKey]}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Core Characteristics Grid */}
      {activeTab === 'stats' && (
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
                className="dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#EBE6DB] text-[#161B18] p-3 rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] space-y-1.5 shadow-retro-sm"
              >
                <div className="flex items-center justify-between text-xs font-typewriter">
                  <span className="font-bold text-[#D99F26] text-sm">{statKey}</span>
                  <button
                    onClick={() => onTriggerRoll(`${statKey} Check`, val)}
                    className="px-2 py-0.5 bg-[#E65A2B] text-[#F4EFE3] font-display uppercase font-bold text-[10px] rounded-sm border border-[#090C0A] btn-retro"
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
                    accentColor="ochre"
                    className="w-24 shrink-0"
                    inputClassName="text-lg font-bold"
                  />

                  <div className="flex flex-col text-[11px] font-typewriter font-semibold text-right dark:text-[#A8B2AC] text-[#5A6861]">
                    <span>1/2: <strong className="dark:text-[#F4EFE3] text-[#161B18]">{breakdown.hard}</strong></span>
                    <span>1/5: <strong className="text-[#D99F26]">{breakdown.extreme}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Skills List */}
      {activeTab === 'skills' && (
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
      {activeTab === 'weapons' && (
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
      {activeTab === 'notes' && (
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



import React, { useState } from 'react';
import { Search, Plus, Dices, CheckSquare, Square } from 'lucide-react';
import { getStatBreakdown } from '../utils/cocRules';
import RetroNumberInput from './RetroNumberInput';

export default function SkillsSection({
  skills,
  onUpdateSkill,
  onAddSkill,
  onDeleteSkill,
  onTriggerRoll
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCheckedOnly, setFilterCheckedOnly] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillValue, setNewSkillValue] = useState(20);

  const filteredSkills = skills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChecked = filterCheckedOnly ? s.checked : true;
    return matchesSearch && matchesChecked;
  });

  const handleCreateSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    onAddSkill({
      name: newSkillName.trim(),
      value: Number(newSkillValue),
      checked: false
    });

    setNewSkillName('');
    setShowAddSkill(false);
  };

  return (
    <div className="space-y-3">
      {/* Skill List Search & Filters Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#EBE6DB] text-[#161B18] p-3 rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] shadow-retro-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#D99F26] absolute left-2.5 top-2.5 stroke-[2.5]" />
          <input
            type="text"
            placeholder="Search skill catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full dark:bg-[#1C2320] bg-[#EFEAD8] border-2 dark:border-[#2D3732] border-[#1C201D] focus:border-[#E65A2B] rounded-sm pl-8 pr-3 py-1 text-xs dark:text-[#EBE6DB] text-[#161B18] focus:outline-none font-typewriter placeholder-[#A8B2AC]"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs dark:text-[#A8B2AC] text-[#5A6861] font-typewriter font-bold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterCheckedOnly}
              onChange={(e) => setFilterCheckedOnly(e.target.checked)}
              className="accent-[#E65A2B] rounded-sm"
            />
            <span className="uppercase">Development Checked</span>
          </label>

          <button
            onClick={() => setShowAddSkill(!showAddSkill)}
            className="flex items-center gap-1.5 text-xs font-display uppercase font-bold text-[#F4EFE3] bg-[#E65A2B] border-2 dark:border-[#090C0A] border-[#1C201D] px-3 py-1 rounded-sm btn-retro shadow-retro-orange"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Custom Skill</span>
          </button>
        </div>
      </div>

      {/* Add Custom Skill Form */}
      {showAddSkill && (
        <form onSubmit={handleCreateSkill} className="dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#EBE6DB] text-[#161B18] p-3 rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] flex items-end gap-3 text-xs shadow-retro-sm">
          <div className="flex-1">
            <label className="text-[10px] font-typewriter font-bold text-[#D99F26] uppercase block mb-1">Custom Skill Title</label>
            <input
              type="text"
              placeholder="e.g. Cryptography"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="w-full dark:bg-[#1C2320] bg-[#EFEAD8] border-2 dark:border-[#2D3732] border-[#1C201D] rounded-sm px-3 py-1 dark:text-[#EBE6DB] text-[#161B18] font-typewriter"
              required
            />
          </div>
          <div className="w-24">
            <label className="text-[10px] font-typewriter font-bold text-[#D99F26] uppercase block mb-1">Base %</label>
            <RetroNumberInput
              min={0}
              max={99}
              value={newSkillValue}
              onChange={(val) => setNewSkillValue(val)}
              className="w-full"
              inputClassName="text-xs font-bold text-center"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-1 bg-[#D99F26] text-[#141816] font-display uppercase font-bold rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] btn-retro"
          >
            Save
          </button>
        </form>
      )}

      {/* Skills Grid Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
        {filteredSkills.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs dark:text-[#5A6861] text-[#A8B2AC] font-typewriter uppercase">
            No matching skill catalog entries.
          </div>
        ) : (
          filteredSkills.map((s, index) => {
            const breakdown = getStatBreakdown(s.value);

            return (
              <div
                key={`${s.name}-${index}`}
                className="dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#EBE6DB] text-[#161B18] border-2 dark:border-[#090C0A] border-[#1C201D] p-2.5 rounded-sm flex items-center justify-between gap-2 shadow-retro-sm hover:border-[#E65A2B] transition-colors"
              >
                <div className="flex items-center gap-2 truncate flex-1">
                  <button
                    type="button"
                    onClick={() => onUpdateSkill(s.name, { checked: !s.checked })}
                    aria-label={`Toggle development check for ${s.name}`}
                    className="dark:text-[#A8B2AC] text-[#5A6861] hover:text-[#E65A2B] transition-colors"
                  >
                    {s.checked ? (
                      <CheckSquare className="w-4 h-4 text-[#E65A2B]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <span className={`text-xs truncate font-typewriter ${s.checked ? 'text-[#D99F26] font-bold' : 'dark:text-[#EBE6DB] text-[#161B18]'}`}>
                    {s.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <RetroNumberInput
                    min={0}
                    max={99}
                    value={s.value}
                    onChange={(val) => onUpdateSkill(s.name, { value: Number(val) })}
                    className="w-20 shrink-0"
                    inputClassName="text-xs font-bold"
                  />

                  <div className="flex flex-col text-[10px] font-typewriter dark:text-[#A8B2AC] text-[#5A6861] leading-tight text-right">
                    <span>1/2: <strong className="dark:text-[#EBE6DB] text-[#161B18]">{breakdown.hard}</strong></span>
                    <span>1/5: <strong className="text-[#D99F26]">{breakdown.extreme}</strong></span>
                  </div>

                  <button
                    onClick={() => onTriggerRoll(s.name, s.value)}
                    className="p-1.5 rounded-sm bg-[#E65A2B] text-[#F4EFE3] border border-[#090C0A] btn-retro"
                    title={`Roll ${s.name}`}
                    aria-label={`Roll check for ${s.name}`}
                  >
                    <Dices className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


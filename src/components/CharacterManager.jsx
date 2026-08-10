import React, { useState, useRef } from 'react';
import { Plus, Search, Sparkles, Folder, Upload } from 'lucide-react';
import { DEFAULT_COC_SKILLS } from '../utils/cocRules';
import { parsePdfInvestigator } from '../utils/pdfParser';

import { GAME_SYSTEMS } from '../data/gameSystems';

export default function CharacterManager({
  gameSystem = 'coc',
  characters,
  activeCharacterId,
  onSelectCharacter,
  onAddCharacter
}) {
  const pdfInputRef = useRef(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const sysConfig = GAME_SYSTEMS[gameSystem] || GAME_SYSTEMS.coc;
  const terms = sysConfig.terms || GAME_SYSTEMS.coc.terms;

  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('investigator');
  const [newOccupation, setNewOccupation] = useState('Private Investigator');

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const investigator = await parsePdfInvestigator(file);
      onAddCharacter(investigator);
      onSelectCharacter(investigator.id);
    } catch (err) {
      alert(err.message || 'Failed to parse PDF character sheet.');
    }
    e.target.value = '';
  };

  const filteredCharacters = characters.filter((c) => {
    const matchesType = filterType === 'all' ? true : c.type === filterType;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.occupation || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleCreateCharacter = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newChar = {
      id: `char-${Date.now()}`,
      type: newType,
      name: newName.trim(),
      occupation: newOccupation.trim(),
      age: 30,
      residence: 'Arkham, MA',
      birthplace: '',
      avatar: '',
      stats: {
        STR: 50, CON: 50, SIZ: 50, DEX: 50,
        APP: 50, INT: 50, POW: 50, EDU: 50
      },
      hp: { current: 10, max: 10 },
      sanity: { current: 50, max: 99, starting: 50, tempThreshold: 10 },
      mp: { current: 10, max: 10 },
      luck: 50,
      conditions: {
        majorWound: false,
        unconscious: false,
        dying: false,
        tempInsane: false,
        indefinitelyInsane: false
      },
      skills: DEFAULT_COC_SKILLS.map(s => ({ name: s.name, value: s.base, checked: false })),
      weapons: [],
      notes: '',
      inventory: ''
    };

    onAddCharacter(newChar);
    setNewName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-3">
      {/* Filters & Search - Control Strip */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-sm border-2 shadow-retro-sm ${
        gameSystem === 'cyberpunk'
          ? 'dark:bg-[#0d1117] bg-[#ffffff] dark:text-[#f0f6fc] text-[#0d0d0d] border-[#ffee00] dark:border-[#21262d]'
          : gameSystem === 'pf2e'
          ? 'dark:bg-[#161c28] bg-[#ffffff] dark:text-[#e2e8f0] text-[#1e293b] border-[#d4af37] dark:border-[#1e293b]'
          : 'dark:bg-[#1C2320] bg-[#EBE4D4] dark:border-[#090C0A] border-[#1C201D]'
      }`}>
        {/* Category Filters */}
        <div className="flex items-center gap-1 dark:bg-[#141816] bg-[#FAF6EE] p-1 rounded-sm border dark:border-[#2D3732] border-[#1C201D]">
          {['all', 'investigator', 'npc', 'monster'].map((type) => {
            const labelText = type === 'all'
              ? terms.allDossiers
              : type === 'investigator'
              ? terms.playerPlural.toUpperCase()
              : `${type.toUpperCase()}S`;

            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-sm text-xs font-display uppercase font-bold tracking-wider transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-[#E65A2B] text-[#F4EFE3] shadow-retro-sm'
                    : 'dark:text-[#A8B2AC] text-[#5A6861] hover:text-[#E65A2B]'
                }`}
                style={{
                  backgroundColor: filterType === type ? sysConfig.accentColor : undefined,
                  color: filterType === type ? '#ffffff' : undefined
                }}
              >
                {labelText}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-[#D99F26] absolute left-2.5 top-2.5 stroke-[2.5]" style={{ color: sysConfig.accentAlt }} />
          <input
            type="text"
            placeholder={terms.searchArchives}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full dark:bg-[#141816] bg-[#FAF6EE] border-2 dark:border-[#2D3732] border-[#1C201D] focus:border-[#E65A2B] rounded-sm pl-8 pr-3 py-1 text-xs dark:text-[#EBE6DB] text-[#1C201D] focus:outline-none font-typewriter placeholder-[#5A6861]"
          />
        </div>

        {/* Add Character & PDF Import Buttons */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={pdfInputRef}
            onChange={handlePdfUpload}
            accept=".pdf"
            className="hidden"
          />
          <button
            onClick={() => pdfInputRef.current?.click()}
            title={terms.importPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[#F4EFE3] font-display uppercase font-bold text-xs tracking-wider border-2 dark:border-[#090C0A] border-[#1C201D] btn-retro cursor-pointer"
            style={{ backgroundColor: sysConfig.accentAlt || '#2A6B60' }}
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{terms.importPdf}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[#141816] font-display uppercase font-bold text-xs tracking-wider border-2 dark:border-[#090C0A] border-[#1C201D] btn-retro cursor-pointer"
            style={{ backgroundColor: sysConfig.accentColor || '#D99F26', color: '#ffffff' }}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{terms.newDossier}</span>
          </button>
        </div>
      </div>

      {/* Character Dossier Folder Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
        {filteredCharacters.length === 0 ? (
          <div className="text-xs dark:text-[#A8B2AC] text-[#5A6861] font-typewriter py-2">No dossier files matching criteria.</div>
        ) : (
          filteredCharacters.map((c) => {
            const isSelected = c.id === activeCharacterId;

            return (
              <button
                key={c.id}
                onClick={() => onSelectCharacter(c.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-t-md border-2 text-xs transition-all shrink-0 font-display uppercase tracking-wide btn-retro relative overflow-hidden ${
                  isSelected
                    ? 'dark:bg-[#1C2320] bg-[#EFEAD8] dark:text-[#EBE6DB] text-[#161B18] dark:border-[#090C0A] border-[#1C201D] font-bold shadow-retro z-10'
                    : 'dark:bg-[#252E2A] bg-[#DCD4C2] dark:border-[#090C0A] border-[#1C201D] dark:text-[#A8B2AC] text-[#5A6861] hover:text-[#161B18]'
                }`}
              >
                {/* Vintage Top Color Strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  c.type === 'investigator' ? 'bg-[#E65A2B]' : c.type === 'monster' ? 'bg-[#C0392B]' : 'bg-[#D99F26]'
                }`} />

                <Folder className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E65A2B]' : 'text-[#A8B2AC]'}`} />
                <span className="truncate max-w-[150px] font-bold">{c.name}</span>
                <span className={`text-[10px] font-typewriter px-1.5 py-0.2 rounded-sm border ${
                  isSelected 
                    ? 'dark:bg-[#141816] bg-[#FAF6EE] text-[#E65A2B] dark:border-[#2D3732] border-[#1C201D] font-bold' 
                    : 'dark:bg-[#141816] bg-[#FAF6EE] text-[#D99F26] dark:border-[#2D3732] border-[#1C201D]'
                }`}>
                  HP:{c.hp?.current}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Add Character Modal - 1960s Folder Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCharacter}
            className="bg-[#1C2320] border-2 border-[#090C0A] rounded-sm p-6 w-full max-w-md space-y-4 shadow-retro"
          >
            <div className="flex items-center justify-between border-b-2 border-[#090C0A] pb-3">
              <h3 className="text-base font-bold text-[#F4EFE3] font-display uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D99F26]" />
                CREATE CASE DOSSIER
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#A8B2AC] hover:text-[#E65A2B] text-sm font-bold font-typewriter px-2 py-0.5 border border-[#2D3732] rounded-sm"
              >
                [ESC]
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#D99F26] block mb-1 font-typewriter font-bold uppercase">Classification</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-[#141816] border-2 border-[#2D3732] focus:border-[#E65A2B] rounded-sm px-3 py-2 text-[#EBE6DB] font-typewriter"
                >
                  <option value="investigator">Investigator (PC)</option>
                  <option value="npc">Non-Player Character (NPC)</option>
                  <option value="monster">Monster / Entity</option>
                </select>
              </div>

              <div>
                <label className="text-[#D99F26] block mb-1 font-typewriter font-bold uppercase">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Professor Edward Sterling"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#141816] border-2 border-[#2D3732] focus:border-[#E65A2B] rounded-sm px-3 py-2 text-[#EBE6DB] font-typewriter placeholder-[#5A6861]"
                  required
                />
              </div>

              <div>
                <label className="text-[#D99F26] block mb-1 font-typewriter font-bold uppercase">Occupation / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Antiquarian"
                  value={newOccupation}
                  onChange={(e) => setNewOccupation(e.target.value)}
                  className="w-full bg-[#141816] border-2 border-[#2D3732] focus:border-[#E65A2B] rounded-sm px-3 py-2 text-[#EBE6DB] font-typewriter placeholder-[#5A6861]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t-2 border-[#090C0A]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-[#A8B2AC] hover:text-[#EBE6DB] text-xs font-display uppercase font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#E65A2B] text-[#F4EFE3] font-display uppercase font-bold rounded-sm text-xs border-2 border-[#090C0A] btn-retro shadow-retro-orange"
              >
                Issue Dossier
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


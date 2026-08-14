import React, { useState, useRef } from 'react';
import { Plus, Search, Sparkles, Folder, Upload, Terminal, Crown } from 'lucide-react';
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
  const [newOccupation, setNewOccupation] = useState('');
  const [newExtraField, setNewExtraField] = useState('');

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

    let defaultStats, defaultHp, defaultSanity, defaultMp, defaultLuck, defaultResidence;

    if (gameSystem === 'cyberpunk') {
      defaultStats = { INT: 7, REF: 8, DEX: 7, TECH: 6, COOL: 7, WILL: 7, LUCK: 7, MOVE: 7, BODY: 7, EMP: 6 };
      defaultHp = { current: 35, max: 35 };
      defaultSanity = { current: 70, max: 100 }; // Humanity
      defaultMp = { current: 10, max: 10 };
      defaultLuck = 70;
      defaultResidence = newExtraField.trim() || 'Night City';
    } else if (gameSystem === 'pf2e') {
      defaultStats = { STR: 14, DEX: 14, CON: 14, INT: 10, WIS: 12, CHA: 10 };
      defaultHp = { current: 24, max: 24, temp: 0 };
      defaultSanity = { current: 1, max: 3 }; // Hero Points
      defaultMp = { current: 2, max: 2 };
      defaultLuck = 50;
      defaultResidence = newExtraField.trim() || 'Absalom, Inner Sea';
    } else { // coc
      defaultStats = { STR: 50, CON: 50, SIZ: 50, DEX: 50, APP: 50, INT: 50, POW: 50, EDU: 50 };
      defaultHp = { current: 10, max: 10 };
      defaultSanity = { current: 50, max: 99, starting: 50, tempThreshold: 10 };
      defaultMp = { current: 10, max: 10 };
      defaultLuck = 50;
      defaultResidence = newExtraField.trim() || 'Arkham, MA';
    }

    const defaultOcc = newOccupation.trim() || (
      gameSystem === 'cyberpunk' ? 'Solo / Mercenary' :
      gameSystem === 'pf2e' ? 'Adventurer' : 'Private Investigator'
    );

    const newChar = {
      id: `char-${Date.now()}`,
      type: newType,
      name: newName.trim(),
      occupation: defaultOcc,
      age: gameSystem === 'pf2e' ? 25 : gameSystem === 'cyberpunk' ? 28 : 30,
      residence: defaultResidence,
      birthplace: '',
      avatar: '',
      stats: defaultStats,
      hp: defaultHp,
      sanity: defaultSanity,
      mp: defaultMp,
      luck: defaultLuck,
      conditions: {
        majorWound: false,
        unconscious: false,
        dying: false,
        tempInsane: false,
        indefinitelyInsane: false
      },
      skills: gameSystem === 'coc'
        ? DEFAULT_COC_SKILLS.map(s => ({ name: s.name, value: s.base, checked: false }))
        : gameSystem === 'cyberpunk'
        ? [
            { name: "Handgun", value: 14 },
            { name: "Perception", value: 13 },
            { name: "Evasion", value: 14 },
            { name: "Brawling", value: 12 }
          ]
        : [
            { name: "Athletics", value: 6 },
            { name: "Perception", value: 5 },
            { name: "Acrobatics", value: 5 },
            { name: "Stealth", value: 4 }
          ],
      weapons: [],
      notes: '',
      inventory: ''
    };

    onAddCharacter(newChar);
    setNewName('');
    setNewOccupation('');
    setNewExtraField('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-3">
      {/* Filters & Search - Control Strip */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-2.5 transition-colors ${
        gameSystem === 'cyberpunk'
          ? 'bg-[#040710] border border-[#1a2e4a] text-[#c8d8e8] font-cyber'
          : gameSystem === 'pf2e'
          ? 'bg-[#160f04] border border-[#3d2e1a] border-t-2 border-t-[#c8a84b] text-[#e8d5b0] rounded-sm'
          : 'dark:bg-[#1C2320] bg-[#EBE4D4] dark:border-[#090C0A] border-[#1C201D] rounded-sm border-2 shadow-retro-sm'
      }`}>
        {/* Category Filters */}
        <div className={`flex items-center gap-1 p-1 overflow-x-auto max-w-full no-scrollbar whitespace-nowrap ${
          gameSystem === 'cyberpunk'
            ? 'bg-[#0d1520] border border-[#1a2e4a]'
            : gameSystem === 'pf2e'
            ? 'bg-[#1e1508] border border-[#3d2e1a] rounded-sm'
            : 'dark:bg-[#141816] bg-[#FAF6EE] border dark:border-[#2D3732] border-[#1C201D] rounded-sm'
        }`}>
          {['all', 'investigator', 'npc', 'monster'].map((type) => {
            const labelText = type === 'all'
              ? terms.allDossiers
              : type === 'investigator'
              ? terms.playerPlural.toUpperCase()
              : `${type.toUpperCase()}S`;

            const isSelected = filterType === type;

            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                  gameSystem === 'cyberpunk'
                    ? `font-cyber ${isSelected ? 'bg-[#e60037] text-white border border-[#00e5ff]' : 'text-[#4a6b8a] hover:text-[#00e5ff]'}`
                    : gameSystem === 'pf2e'
                    ? `font-chronicle rounded-sm ${isSelected ? 'bg-[#c8a84b] text-[#160f04] font-bold' : 'text-[#7a6040] hover:text-[#c8a84b]'}`
                    : `font-display rounded-sm ${isSelected ? 'bg-[#E65A2B] text-[#F4EFE3] shadow-retro-sm' : 'dark:text-[#A8B2AC] text-[#5A6861] hover:text-[#E65A2B]'}`
                }`}
                style={gameSystem === 'coc' && isSelected ? { backgroundColor: sysConfig.accentColor } : {}}
              >
                {labelText}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[130px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 stroke-[2.5]" style={{
            color: gameSystem === 'cyberpunk' ? '#00e5ff' : gameSystem === 'pf2e' ? '#c8a84b' : sysConfig.accentAlt
          }} />
          <input
            type="text"
            placeholder={terms.searchArchives}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-3 py-1 text-xs focus:outline-none ${
              gameSystem === 'cyberpunk'
                ? 'font-cyber bg-[#0d1520] border border-[#1a2e4a] focus:border-[#00e5ff] text-[#c8d8e8] placeholder-[#4a6b8a]'
                : gameSystem === 'pf2e'
                ? 'font-typewriter bg-[#1e1508] border border-[#3d2e1a] focus:border-[#c8a84b] text-[#e8d5b0] placeholder-[#7a6040] rounded-sm'
                : 'font-typewriter dark:bg-[#141816] bg-[#FAF6EE] border-2 dark:border-[#2D3732] border-[#1C201D] focus:border-[#E65A2B] rounded-sm dark:text-[#EBE6DB] text-[#1C201D] placeholder-[#5A6861]'
            }`}
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
              gameSystem === 'cyberpunk'
                ? 'font-cyber bg-[#0d1520] text-[#00e5ff] border border-[#00e5ff]/50 hover:bg-[#00e5ff] hover:text-[#060910]'
                : gameSystem === 'pf2e'
                ? 'font-chronicle bg-[#1e1508] text-[#c8a84b] border border-[#c8a84b]/50 hover:bg-[#c8a84b] hover:text-[#160f04] rounded-sm'
                : 'font-display bg-[#2A6B60] text-[#F4EFE3] border-2 dark:border-[#090C0A] border-[#1C201D] btn-retro rounded-sm'
            }`}
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{terms.importPdf}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
              gameSystem === 'cyberpunk'
                ? 'font-cyber bg-[#e60037] text-white border border-[#00e5ff] hover:shadow-[0_0_12px_rgba(230,0,55,0.6)]'
                : gameSystem === 'pf2e'
                ? 'font-chronicle bg-[#c8a84b] text-[#160f04] border border-[#8b2020] hover:bg-[#d4af37] rounded-sm'
                : 'font-display bg-[#D99F26] text-white border-2 dark:border-[#090C0A] border-[#1C201D] btn-retro rounded-sm'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{terms.newDossier}</span>
          </button>
        </div>
      </div>

      {/* Character Dossier Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
        {filteredCharacters.length === 0 ? (
          <div className={`text-xs py-2 ${
            gameSystem === 'cyberpunk' ? 'font-cyber text-[#4a6b8a]' : gameSystem === 'pf2e' ? 'font-typewriter text-[#7a6040]' : 'font-typewriter dark:text-[#A8B2AC] text-[#5A6861]'
          }`}>No record files matching criteria.</div>
        ) : (
          filteredCharacters.map((c) => {
            const isSelected = c.id === activeCharacterId;

            return (
              <button
                key={c.id}
                onClick={() => onSelectCharacter(c.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs transition-all shrink-0 uppercase tracking-wide cursor-pointer relative overflow-hidden ${
                  gameSystem === 'cyberpunk'
                    ? `font-cyber ${
                        isSelected
                          ? 'bg-[#0d1520] text-[#00e5ff] border border-[#00e5ff] border-b-2 border-b-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.25)] font-bold'
                          : 'bg-[#040710] text-[#4a6b8a] border border-[#1a2e4a] hover:text-[#00e5ff]'
                      }`
                    : gameSystem === 'pf2e'
                    ? `font-chronicle rounded-t-sm ${
                        isSelected
                          ? 'bg-[#1e1508] text-[#c8a84b] border border-[#c8a84b] border-t-2 border-t-[#c8a84b] font-bold shadow-[0_0_8px_rgba(200,168,75,0.25)]'
                          : 'bg-[#160f04] text-[#7a6040] border border-[#3d2e1a] hover:text-[#c8a84b]'
                      }`
                    : `font-display rounded-t-md border-2 btn-retro ${
                        isSelected
                          ? 'dark:bg-[#1C2320] bg-[#EFEAD8] dark:text-[#EBE6DB] text-[#161B18] dark:border-[#090C0A] border-[#1C201D] font-bold shadow-retro z-10'
                          : 'dark:bg-[#252E2A] bg-[#DCD4C2] dark:border-[#090C0A] border-[#1C201D] dark:text-[#A8B2AC] text-[#5A6861] hover:text-[#161B18]'
                      }`
                }`}
              >
                {/* System Color Accent Strip for CoC */}
                {gameSystem === 'coc' && (
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    c.type === 'investigator' ? 'bg-[#E65A2B]' : c.type === 'monster' ? 'bg-[#C0392B]' : 'bg-[#D99F26]'
                  }`} />
                )}

                {gameSystem === 'cyberpunk' ? (
                  <Terminal className={`w-3.5 h-3.5 ${isSelected ? 'text-[#e60037]' : 'text-[#4a6b8a]'}`} />
                ) : gameSystem === 'pf2e' ? (
                  <Crown className={`w-3.5 h-3.5 ${isSelected ? 'text-[#c8a84b]' : 'text-[#7a6040]'}`} />
                ) : (
                  <Folder className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E65A2B]' : 'text-[#A8B2AC]'}`} />
                )}

                <span className="truncate max-w-[150px] font-bold">{c.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-sm border ${
                  gameSystem === 'cyberpunk'
                    ? 'font-cyber bg-[#040710] text-[#00e5ff] border-[#1a2e4a]'
                    : gameSystem === 'pf2e'
                    ? 'font-typewriter bg-[#160f04] text-[#c8a84b] border-[#3d2e1a]'
                    : isSelected 
                    ? 'font-typewriter dark:bg-[#141816] bg-[#FAF6EE] text-[#E65A2B] dark:border-[#2D3732] border-[#1C201D] font-bold' 
                    : 'font-typewriter dark:bg-[#141816] bg-[#FAF6EE] text-[#D99F26] dark:border-[#2D3732] border-[#1C201D]'
                }`}>
                  HP:{c.hp?.current}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Add Character Modal — System Specific */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          
          {/* Cyberpunk RED Modal */}
          {gameSystem === 'cyberpunk' && (
            <form
              onSubmit={handleCreateCharacter}
              className="cyber-panel bg-[#0d1520] border border-[#1a2e4a] border-l-4 border-l-[#00e5ff] p-6 w-full max-w-md space-y-4 shadow-[0_0_35px_rgba(0,229,255,0.25)] font-cyber animate-flicker"
            >
              <div className="flex items-center justify-between border-b border-[#1a2e4a] pb-3">
                <h3 className="text-base font-bold text-[#e60037] font-cyber uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-[#00e5ff] stroke-[2.5]" />
                  &gt; INITIALIZE EDGERUNNER FILE
                </h3>
                <span className="cyber-badge text-[10px] text-[#00e5ff]">NET-LINK // 2045</span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[#00e5ff] block mb-1 font-cyber font-bold uppercase tracking-wider">
                    Record Classification
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-[#040710] border border-[#1a2e4a] focus:border-[#00e5ff] rounded-none px-3 py-2 text-[#c8d8e8] font-cyber focus:outline-none"
                  >
                    <option value="investigator">Edgerunner (PC)</option>
                    <option value="npc">Non-Player Character (NPC)</option>
                    <option value="monster">Cyber-Threat / Hostile</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#00e5ff] block mb-1 font-cyber font-bold uppercase tracking-wider">
                    Handle / Street Alias
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Johnny Silverhand / V"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-[#040710] border border-[#1a2e4a] focus:border-[#00e5ff] rounded-none px-3 py-2 text-[#c8d8e8] font-cyber placeholder-[#4a6b8a] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#00e5ff] block mb-1 font-cyber font-bold uppercase tracking-wider">
                    Street Role / Class
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Solo, Netrunner, Tech, Nomad"
                    value={newOccupation}
                    onChange={(e) => setNewOccupation(e.target.value)}
                    className="w-full bg-[#040710] border border-[#1a2e4a] focus:border-[#00e5ff] rounded-none px-3 py-2 text-[#c8d8e8] font-cyber placeholder-[#4a6b8a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#00e5ff] block mb-1 font-cyber font-bold uppercase tracking-wider">
                    District / Affiliation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Heywood, Afterlife, Trauma Team"
                    value={newExtraField}
                    onChange={(e) => setNewExtraField(e.target.value)}
                    className="w-full bg-[#040710] border border-[#1a2e4a] focus:border-[#00e5ff] rounded-none px-3 py-2 text-[#c8d8e8] font-cyber placeholder-[#4a6b8a] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1a2e4a]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-[#4a6b8a] hover:text-[#00e5ff] text-xs font-cyber uppercase font-bold cursor-pointer"
                >
                  [ABORT]
                </button>
                <button
                  type="submit"
                  className="btn-cyber px-4 py-2 bg-[#e60037] text-white font-cyber uppercase font-bold text-xs border border-[#00e5ff]/60 hover:shadow-[0_0_15px_rgba(230,0,55,0.7)] cursor-pointer"
                >
                  &gt; INITIALIZE FILE
                </button>
              </div>
            </form>
          )}

          {/* Pathfinder 2e Modal */}
          {gameSystem === 'pf2e' && (
            <form
              onSubmit={handleCreateCharacter}
              className="pf2e-panel bg-[#1e1508] border-2 border-[#3d2e1a] border-t-4 border-t-[#c8a84b] rounded-sm p-6 w-full max-w-md space-y-4 shadow-[0_0_35px_rgba(200,168,75,0.25)] font-sans"
            >
              <div className="flex items-center justify-between border-b border-[#3d2e1a] pb-3">
                <h3 className="text-base font-extrabold text-[#c8a84b] font-chronicle uppercase tracking-wider flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#c8a84b] stroke-[2]" />
                  INSCRIBE HERO CHRONICLE
                </h3>
                <span className="pf2e-badge text-[10px]">ABSALOM REGISTRY</span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[#c8a84b] block mb-1 font-chronicle font-bold uppercase tracking-wider">
                    Heroic Classification
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-[#160f04] border border-[#3d2e1a] focus:border-[#c8a84b] rounded-sm px-3 py-2 text-[#e8d5b0] font-typewriter focus:outline-none"
                  >
                    <option value="investigator">Hero / Adventurer (PC)</option>
                    <option value="npc">Non-Player Character (NPC)</option>
                    <option value="monster">Monster / Threat</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#c8a84b] block mb-1 font-chronicle font-bold uppercase tracking-wider">
                    Character / Hero Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Valeros the Fighter"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-[#160f04] border border-[#3d2e1a] focus:border-[#c8a84b] rounded-sm px-3 py-2 text-[#e8d5b0] font-typewriter placeholder-[#7a6040] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#c8a84b] block mb-1 font-chronicle font-bold uppercase tracking-wider">
                    Ancestry & Class
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Human Fighter, Elf Wizard"
                    value={newOccupation}
                    onChange={(e) => setNewOccupation(e.target.value)}
                    className="w-full bg-[#160f04] border border-[#3d2e1a] focus:border-[#c8a84b] rounded-sm px-3 py-2 text-[#e8d5b0] font-typewriter placeholder-[#7a6040] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#c8a84b] block mb-1 font-chronicle font-bold uppercase tracking-wider">
                    Deity / Home Region
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cayden Cailean, Inner Sea"
                    value={newExtraField}
                    onChange={(e) => setNewExtraField(e.target.value)}
                    className="w-full bg-[#160f04] border border-[#3d2e1a] focus:border-[#c8a84b] rounded-sm px-3 py-2 text-[#e8d5b0] font-typewriter placeholder-[#7a6040] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#3d2e1a]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-[#7a6040] hover:text-[#c8a84b] text-xs font-chronicle uppercase font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pf2e px-4 py-2 bg-[#c8a84b] text-[#160f04] font-chronicle uppercase font-bold text-xs border border-[#8b2020] hover:bg-[#d4af37] shadow-[0_0_10px_rgba(200,168,75,0.4)] rounded-sm cursor-pointer"
                >
                  INSCRIBE CHRONICLE →
                </button>
              </div>
            </form>
          )}

          {/* Call of Cthulhu 7e Modal */}
          {gameSystem === 'coc' && (
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
                  className="text-[#A8B2AC] hover:text-[#E65A2B] text-sm font-bold font-typewriter px-2 py-0.5 border border-[#2D3732] rounded-sm cursor-pointer"
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
                    className="w-full bg-[#141816] border-2 border-[#2D3732] focus:border-[#E65A2B] rounded-sm px-3 py-2 text-[#EBE6DB] font-typewriter focus:outline-none"
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
                    className="w-full bg-[#141816] border-2 border-[#2D3732] focus:border-[#E65A2B] rounded-sm px-3 py-2 text-[#EBE6DB] font-typewriter placeholder-[#5A6861] focus:outline-none"
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
                    className="w-full bg-[#141816] border-2 border-[#2D3732] focus:border-[#E65A2B] rounded-sm px-3 py-2 text-[#EBE6DB] font-typewriter placeholder-[#5A6861] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#D99F26] block mb-1 font-typewriter font-bold uppercase">Primary Residence</label>
                  <input
                    type="text"
                    placeholder="e.g. Arkham, MA"
                    value={newExtraField}
                    onChange={(e) => setNewExtraField(e.target.value)}
                    className="w-full bg-[#141816] border-2 border-[#2D3732] focus:border-[#E65A2B] rounded-sm px-3 py-2 text-[#EBE6DB] font-typewriter placeholder-[#5A6861] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t-2 border-[#090C0A]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-[#A8B2AC] hover:text-[#EBE6DB] text-xs font-display uppercase font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#E65A2B] text-[#F4EFE3] font-display uppercase font-bold rounded-sm text-xs border-2 border-[#090C0A] btn-retro shadow-retro-orange cursor-pointer"
                >
                  Issue Dossier
                </button>
              </div>
            </form>
          )}

        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { BookOpen, User, ChevronRight, Terminal, Crown, Skull, Wifi, Loader2, Search, X, AlertTriangle, UserCheck } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { GAME_SYSTEMS } from '../data/gameSystems';
import logoImg from '../assets/logo.png';
import { db, FIREBASE_CONFIGURED } from '../firebase';

export default function SystemAndRoleSelectScreen({ onSelectGameAndRole, onJoinRoomAsPlayer }) {
  const [selectedSystem, setSelectedSystem] = useState('coc');
  const activeSystemConfig = GAME_SYSTEMS[selectedSystem];

  // Room Join State
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isSearchingRoom, setIsSearchingRoom] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [foundRoomData, setFoundRoomData] = useState(null); // { roomCode, characters, system }

  const handleSearchRoom = async (e) => {
    e.preventDefault();
    const code = roomCodeInput.toUpperCase().trim();
    if (code.length !== 6) {
      setSearchError('Room code must be 6 characters (e.g. ABCD12).');
      return;
    }

    if (!FIREBASE_CONFIGURED || !db) {
      setSearchError('Firebase is not configured yet. Set up your .env.local file to enable cloud sync.');
      return;
    }

    setIsSearchingRoom(true);
    setSearchError(null);

    try {
      const ref = doc(db, 'campaigns', code);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const chars = data.characters || [];
        if (chars.length === 0) {
          setSearchError(`Room "${code}" exists, but has no active characters yet. Ask your Keeper to add characters.`);
        } else {
          setFoundRoomData({
            roomCode: code,
            characters: chars,
            system: data.gameSystem || selectedSystem,
          });
        }
      } else {
        setSearchError(`Room "${code}" not found. Check the code with your Keeper.`);
      }
    } catch (err) {
      console.error('[Keeper Tracker] Room search failed:', err);
      setSearchError('Failed to connect to room. Check your internet connection.');
    } finally {
      setIsSearchingRoom(false);
    }
  };

  const handleSelectCharacterToFollow = (character) => {
    if (onJoinRoomAsPlayer && foundRoomData) {
      onJoinRoomAsPlayer({
        roomCode: foundRoomData.roomCode,
        character,
        gameSystem: foundRoomData.system || selectedSystem,
      });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans selection:bg-[#E65A2B] selection:text-white p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden ${
      selectedSystem === 'cyberpunk'
        ? 'dark:bg-[#08090a] bg-[#eaedef] dark:text-[#f0f6fc] text-[#0d0d0d] bg-cyber-scanline'
        : selectedSystem === 'pf2e'
        ? 'dark:bg-[#10141d] bg-[#f4f1ea] dark:text-[#e2e8f0] text-[#1e293b] bg-pf2e-grid'
        : 'dark:bg-[#141816] bg-[#F5F1E6] dark:text-[#EBE6DB] text-[#1C201D] bg-grid-1960s'
    }`}>
      {/* Background ambient lighting per system */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${
        selectedSystem === 'cyberpunk'
          ? 'bg-radial from-[#e60037]/15 via-transparent to-transparent opacity-80'
          : selectedSystem === 'pf2e'
          ? 'bg-radial from-[#d4af37]/10 via-transparent to-transparent opacity-70'
          : 'bg-radial from-[#E65A2B]/10 via-transparent to-transparent opacity-60'
      }`} />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-8">
        
        {/* Header & Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className={`absolute inset-0 rounded-full blur-2xl scale-150 transition-colors duration-300 ${
              selectedSystem === 'cyberpunk'
                ? 'bg-[#e60037] opacity-30'
                : selectedSystem === 'pf2e'
                ? 'bg-[#d4af37] opacity-25'
                : 'bg-[#E65A2B] opacity-20'
            }`} />
            <img
              src={logoImg}
              alt="Multi-TTRPG Dashboard Logo"
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 object-cover shadow-2xl transition-all duration-300 ${
                selectedSystem === 'cyberpunk'
                  ? 'border-[#e60037] shadow-[0_0_20px_rgba(230,0,55,0.4)]'
                  : selectedSystem === 'pf2e'
                  ? 'border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                  : 'border-[#2D3732] shadow-retro'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className={`stamp-badge text-[10px] tracking-widest ${
                selectedSystem === 'cyberpunk'
                  ? 'border-[#e60037] text-[#ff2a55] bg-[#1a080c]'
                  : selectedSystem === 'pf2e'
                  ? 'border-[#d4af37] text-[#d4af37] bg-[#161c28]'
                  : 'border-[#E65A2B] text-[#E65A2B]'
              }`}>
                {activeSystemConfig.badge}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold tracking-widest uppercase">
              TTRPG CAMPAIGN DESK
            </h1>
            <p className="font-typewriter font-bold text-xs sm:text-sm uppercase tracking-[0.25em] mt-1 text-[#D99F26]">
              {activeSystemConfig.name} — {activeSystemConfig.version}
            </p>
          </div>

          <p className="text-xs sm:text-sm font-typewriter max-w-lg leading-relaxed opacity-80">
            Select your tabletop RPG ruleset and role to launch an immersive GM dashboard or character dossier.
          </p>
        </div>

        {/* System Selection Tabs / Portals */}
        <div className="w-full space-y-3">
          <label className="block text-center text-xs font-typewriter font-bold uppercase tracking-widest opacity-70">
            1. CHOOSE GAME SYSTEM
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            {/* Call of Cthulhu Button */}
            <button
              onClick={() => setSelectedSystem('coc')}
              className={`p-4 rounded-sm border-2 text-left transition-all duration-300 flex flex-col justify-between ${
                selectedSystem === 'coc'
                  ? 'border-[#E65A2B] bg-[#1C2320] shadow-[0_0_15px_rgba(230,90,43,0.35)] translate-y-[-2px]'
                  : 'border-[#2D3732] bg-[#141816] opacity-70 hover:opacity-100 hover:border-[#E65A2B]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-sm bg-[#E65A2B] text-white flex items-center justify-center font-bold">
                  <Skull className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-typewriter font-bold text-[#E65A2B]">D100 SYSTEM</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-base uppercase text-[#F4EFE3] dark:text-[#F4EFE3] text-[#1C201D]">Call of Cthulhu</h3>
                <p className="text-[11px] font-typewriter text-[#A8B2AC] mt-1 leading-snug">
                  Eldritch horror, Sanity checks & 1920s Arkham mystery.
                </p>
              </div>
            </button>

            {/* Cyberpunk RED Button */}
            <button
              onClick={() => setSelectedSystem('cyberpunk')}
              className={`p-4 rounded-sm border-2 text-left transition-all duration-300 flex flex-col justify-between ${
                selectedSystem === 'cyberpunk'
                  ? 'border-[#e60037] dark:bg-[#180a0e] bg-[#ffffff] shadow-[0_0_15px_rgba(230,0,55,0.35)] translate-y-[-2px]'
                  : 'dark:border-[#2d1218] border-[#d0d7de] dark:bg-[#090507] bg-[#f4ecee] opacity-70 hover:opacity-100 hover:border-[#e60037]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-sm bg-[#e60037] text-white flex items-center justify-center font-bold">
                  <Terminal className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-typewriter font-bold text-[#ff2a55]">1D10 EXPLODE</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-base uppercase text-[#ff2a55]">Cyberpunk RED</h3>
                <p className="text-[11px] font-typewriter dark:text-[#a88a92] text-[#57606a] mt-1 leading-snug">
                  High-tech street combat, Netrunning & Cyberware.
                </p>
              </div>
            </button>

            {/* Pathfinder 2e Button */}
            <button
              onClick={() => setSelectedSystem('pf2e')}
              className={`p-4 rounded-sm border-2 text-left transition-all duration-300 flex flex-col justify-between ${
                selectedSystem === 'pf2e'
                  ? 'border-[#d4af37] dark:bg-[#161c28] bg-[#ffffff] shadow-[0_0_15px_rgba(212,175,55,0.35)] translate-y-[-2px]'
                  : 'dark:border-[#1e293b] border-[#cbd5e1] dark:bg-[#10141d] bg-[#f8f6f0] opacity-70 hover:opacity-100 hover:border-[#d4af37]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-sm bg-[#d4af37] text-[#10141d] flex items-center justify-center font-bold">
                  <Crown className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-typewriter font-bold text-[#d4af37]">D20 3-ACTION</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-base uppercase text-[#b89320] dark:text-[#e2e8f0]">Pathfinder 2e</h3>
                <p className="text-[11px] font-typewriter dark:text-[#94a3b8] text-[#475569] mt-1 leading-snug">
                  High fantasy, 4 degrees of success & 3-action economy.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Role Selection Cards for Active System */}
        <div className="w-full space-y-3">
          <label className="block text-center text-xs font-typewriter font-bold uppercase tracking-widest opacity-70">
            2. CHOOSE YOUR ROLE FOR {activeSystemConfig.name.toUpperCase()}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">

            {/* GM / Keeper Role Card */}
            <button
              onClick={() => onSelectGameAndRole(selectedSystem, 'keeper')}
              className={`group relative text-left p-6 rounded-sm border-2 transition-all duration-300 btn-retro cursor-pointer ${
                selectedSystem === 'cyberpunk'
                  ? 'system-card-cyberpunk dark:border-[#2d1218] border-[#0d0d0d] dark:bg-[#180a0e] bg-[#ffffff] hover:border-[#e60037]'
                  : selectedSystem === 'pf2e'
                  ? 'system-card-pf2e dark:border-[#1e293b] border-[#b89320] dark:bg-[#161c28] bg-[#ffffff] hover:border-[#d4af37]'
                  : 'system-card-coc dark:border-[#2D3732] border-[#1C201D] dark:bg-[#1C2320] bg-[#EBE4D4] hover:border-[#E65A2B]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-sm border-2 flex items-center justify-center text-[#F4EFE3] shadow-retro-sm shrink-0 ${
                  selectedSystem === 'cyberpunk'
                    ? 'bg-[#e60037] text-white border-black'
                    : selectedSystem === 'pf2e'
                    ? 'bg-[#d4af37] text-[#10141d] border-black'
                    : 'bg-[#E65A2B] text-white border-[#090C0A]'
                }`}>
                  <BookOpen className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-typewriter font-bold uppercase tracking-widest block mb-0.5" style={{
                      color: activeSystemConfig.accentColor
                    }}>
                      ROLE
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{
                      color: activeSystemConfig.accentColor
                    }} />
                  </div>
                  <h2 className="text-xl font-display font-extrabold uppercase tracking-wider">
                    {activeSystemConfig.roleLabels.gm}
                  </h2>
                  <p className="text-xs font-typewriter opacity-80 mt-2 leading-relaxed">
                    Full Game Master dashboard with combat initiative, character rosters, dice console & custom timers.
                  </p>

                  <div className="mt-4 space-y-1">
                    {activeSystemConfig.features.map((f) => (
                      <div key={f} className="flex items-center gap-1.5 text-[10px] font-typewriter opacity-75">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: activeSystemConfig.accentColor }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="mt-5 py-2.5 px-3 rounded-sm text-center font-display font-bold text-xs uppercase tracking-wider border-2 border-black shadow-retro btn-retro"
                style={{
                  backgroundColor: activeSystemConfig.accentColor,
                  color: '#ffffff'
                }}
              >
                Launch {activeSystemConfig.roleLabels.gmSanctum} →
              </div>
            </button>

            {/* Player / Investigator Role Card */}
            <button
              onClick={() => onSelectGameAndRole(selectedSystem, 'investigator')}
              className={`group relative text-left p-6 rounded-sm border-2 transition-all duration-300 btn-retro cursor-pointer ${
                selectedSystem === 'cyberpunk'
                  ? 'system-card-cyberpunk dark:border-[#2d1218] border-[#0d0d0d] dark:bg-[#180a0e] bg-[#ffffff] hover:border-[#ff2a55]'
                  : selectedSystem === 'pf2e'
                  ? 'system-card-pf2e dark:border-[#1e293b] border-[#3b82f6] dark:bg-[#161c28] bg-[#ffffff] hover:border-[#3b82f6]'
                  : 'system-card-coc dark:border-[#2D3732] border-[#1C201D] dark:bg-[#1C2320] bg-[#EBE4D4] hover:border-[#2A6B60]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-sm border-2 flex items-center justify-center text-white shadow-retro-sm shrink-0 ${
                  selectedSystem === 'cyberpunk'
                    ? 'bg-[#ff2a55] text-white border-black'
                    : selectedSystem === 'pf2e'
                    ? 'bg-[#3b82f6] text-white border-black'
                    : 'bg-[#2A6B60] text-white border-[#090C0A]'
                }`}>
                  <User className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-typewriter font-bold uppercase tracking-widest block mb-0.5" style={{
                      color: activeSystemConfig.accentAlt
                    }}>
                      ROLE
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{
                      color: activeSystemConfig.accentAlt
                    }} />
                  </div>
                  <h2 className="text-xl font-display font-extrabold uppercase tracking-wider">
                    {activeSystemConfig.roleLabels.player}
                  </h2>
                  <p className="text-xs font-typewriter opacity-80 mt-2 leading-relaxed">
                    Focused personal view for stats, skill checks, attacks, inventory, and individual dice rolls.
                  </p>

                  <div className="mt-4 space-y-1">
                    {[
                      `Personal ${activeSystemConfig.roleLabels.player} Sheet`,
                      `Characteristics & ${activeSystemConfig.diceType} Checks`,
                      'Attacks & Weapon Loadouts',
                      'Personal Dice Console & Log'
                    ].map((f) => (
                      <div key={f} className="flex items-center gap-1.5 text-[10px] font-typewriter opacity-75">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: activeSystemConfig.accentAlt }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="mt-5 py-2.5 px-3 rounded-sm text-center font-display font-bold text-xs uppercase tracking-wider border-2 border-black shadow-retro btn-retro"
                style={{
                  backgroundColor: activeSystemConfig.accentAlt,
                  color: '#ffffff'
                }}
              >
                Open {activeSystemConfig.roleLabels.playerDossier} →
              </div>
            </button>
          </div>
        </div>

        {/* 3. Connect to Live Game Room Section */}
        <div className="w-full space-y-3">
          <label className="block text-center text-xs font-typewriter font-bold uppercase tracking-widest opacity-70">
            3. OR JOIN A LIVE CAMPAIGN ROOM
          </label>

          <form
            onSubmit={handleSearchRoom}
            className={`p-5 rounded-sm border-2 transition-all duration-300 ${
              selectedSystem === 'cyberpunk'
                ? 'dark:border-[#2d1218] border-[#0d0d0d] dark:bg-[#180a0e] bg-[#ffffff]'
                : selectedSystem === 'pf2e'
                ? 'dark:border-[#1e293b] border-[#b89320] dark:bg-[#161c28] bg-[#ffffff]'
                : 'dark:border-[#2D3732] border-[#1C201D] dark:bg-[#1C2320] bg-[#EBE4D4]'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider shrink-0 dark:text-[#F4EFE3] text-[#1C201D]">
                <Wifi className="w-4 h-4 text-[#2A6B60] shrink-0" />
                <span>Room Code:</span>
              </div>

              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase().slice(0, 6))}
                maxLength={6}
                placeholder="EX: ABCD12"
                className="w-full sm:w-44 px-3 py-2 font-typewriter text-center text-base tracking-[0.2em] font-bold uppercase dark:bg-[#141816] bg-[#FAF6EE] border-2 dark:border-[#2D3732] border-[#1C201D] rounded-sm dark:text-[#D99F26] text-[#E65A2B] focus:outline-none focus:ring-2 focus:ring-[#2A6B60]"
              />

              <button
                type="submit"
                disabled={isSearchingRoom || roomCodeInput.trim().length !== 6}
                className="w-full sm:w-auto px-5 py-2 bg-[#2A6B60] text-[#F4EFE3] font-display uppercase font-bold text-xs tracking-wider rounded-sm border-2 border-[#090C0A] btn-retro shadow-retro-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isSearchingRoom ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting…</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 stroke-[2.5]" />
                    <span>Find Room & Choose Character</span>
                  </>
                )}
              </button>
            </div>

            {/* Search Error Banner */}
            {searchError && (
              <div className="mt-3 px-3 py-2 rounded-sm border-2 border-[#E65A2B] bg-[#E65A2B]/10 text-[#E65A2B] text-xs font-typewriter flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <p className="text-[10px] font-typewriter opacity-50 uppercase tracking-widest text-center">
          Multi-System TTRPG Campaign Desk · Call of Cthulhu 7e · Cyberpunk RED · Pathfinder 2e
        </p>
      </div>

      {/* Choose Character Modal */}
      {foundRoomData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setFoundRoomData(null)}
          />

          {/* Modal Panel */}
          <div className="relative z-10 w-full max-w-lg dark:bg-[#1A201C] bg-[#F5F1E6] border-2 dark:border-[#2D3732] border-[#1C201D] shadow-retro rounded-sm flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b-2 dark:border-[#2D3732] border-[#1C201D]">
              <div>
                <span className="stamp-badge border-[#2A6B60] text-[#2A6B60] text-[10px]">ROOM {foundRoomData.roomCode}</span>
                <h2 className="font-display font-extrabold uppercase tracking-wider text-base dark:text-[#F4EFE3] text-[#161B18] mt-0.5">
                  Select Your Investigator to Follow
                </h2>
              </div>
              <button
                onClick={() => setFoundRoomData(null)}
                className="w-7 h-7 flex items-center justify-center rounded-sm dark:bg-[#252E2A] bg-[#EBE4D4] dark:border-[#090C0A] border-[#1C201D] border-2 btn-retro dark:text-[#A8B2AC] text-[#5A6861]"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Character Cards List */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              <p className="text-xs font-typewriter dark:text-[#A8B2AC] text-[#5A6861]">
                Pick the character you are playing. Your dossier will stay synced with the Keeper's desk in real time.
              </p>

              {foundRoomData.characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => handleSelectCharacterToFollow(char)}
                  className="w-full text-left p-3.5 rounded-sm border-2 dark:border-[#2D3732] border-[#1C201D] dark:bg-[#252E2A] bg-[#EBE4D4] hover:border-[#2A6B60] transition-all btn-retro flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-[#2A6B60] text-white flex items-center justify-center font-bold font-display uppercase border border-black shadow-retro-sm">
                      {char.name?.charAt(0) || 'I'}
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-sm uppercase dark:text-[#F4EFE3] text-[#161B18] group-hover:text-[#2A6B60] transition-colors">
                        {char.name || 'Unnamed Investigator'}
                      </h3>
                      <p className="text-xs font-typewriter dark:text-[#A8B2AC] text-[#5A6861]">
                        {char.occupation || char.role || 'Investigator'} · HP {char.hp?.current ?? char.hp}/{char.hp?.max ?? char.hp}
                        {char.san && ` · SAN ${char.san?.current ?? char.san}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2A6B60] text-[#F4EFE3] text-xs font-display font-bold uppercase tracking-wider rounded-sm border border-black shadow-retro-sm group-hover:scale-105 transition-transform">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

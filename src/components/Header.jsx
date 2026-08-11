import React, { useRef } from 'react';
import { Download, Upload, RefreshCw, Moon, Sun, Clock, PanelRightOpen, PanelRightClose, LogOut, Dices, Zap, Crown } from 'lucide-react';
import { getMoonPhaseDetails } from '../utils/cocRules';
import { parsePdfInvestigator } from '../utils/pdfParser';
import { GAME_SYSTEMS } from '../data/gameSystems';
import logoImg from '../assets/logo.png';
import SyncIndicator from './SyncIndicator';

export default function Header({
  gameSystem = 'coc',
  campaignName,
  timeState,
  theme,
  onToggleTheme,
  onToggleSidebar,
  isSidebarOpen,
  onExportCampaign,
  onImportCampaign,
  onImportPdfInvestigator,
  onResetSampleData,
  onChangeRole,
  onChangeGameSystem,
  syncStatus = 'unconfigured',
  onOpenSync,
}) {
  const fileInputRef = useRef(null);
  const currentDate = new Date(timeState.isoDate);
  const moonInfo = getMoonPhaseDetails(currentDate);
  const sysConfig = GAME_SYSTEMS[gameSystem] || GAME_SYSTEMS.coc;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const investigator = await parsePdfInvestigator(file);
        if (onImportPdfInvestigator) {
          onImportPdfInvestigator(investigator);
        }
      } catch (err) {
        alert(err.message || 'Failed to parse PDF character sheet.');
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          onImportCampaign(parsed);
        } catch (err) {
          alert('Invalid Campaign JSON or PDF file format.');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  return (
    <header className={`border-b-2 px-2 py-1.5 sm:px-4 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-4 sticky top-0 z-30 transition-colors duration-200 ${
      gameSystem === 'cyberpunk'
        ? 'bg-[#040710] text-[#c8d8e8] border-[#00e5ff] shadow-[0_2px_20px_rgba(0,229,255,0.15)]'
        : gameSystem === 'pf2e'
        ? 'dark:bg-[#160f04] bg-[#f0e6d0] dark:text-[#e8d5b0] text-[#2a1f0f] border-[#c8a84b] shadow-[0_2px_16px_rgba(200,168,75,0.12)]'
        : 'dark:bg-[#1C2320] bg-[#EBE4D4] dark:border-[#090C0A] border-[#1C201D] dark:text-[#EBE6DB] text-[#1C201D] shadow-retro'
    }`}>
      {/* Title & Brand */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <img
          src={logoImg}
          alt="TTRPG Desk Logo"
          className={`w-7 h-7 sm:w-10 sm:h-10 object-cover border-2 ${
            gameSystem === 'cyberpunk'
              ? 'rounded-none border-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.5)]'
              : gameSystem === 'pf2e'
              ? 'rounded-full border-[#c8a84b] shadow-[0_0_8px_rgba(200,168,75,0.4)]'
              : 'rounded-sm dark:border-[#090C0A] border-[#1C201D] shadow-retro-sm'
          }`}
        />
        <div>
          <div className="flex items-center gap-1 sm:gap-2">
            {gameSystem === 'cyberpunk' ? (
              <span className="cyber-badge animate-flicker hidden sm:inline-block">{sysConfig.badge}</span>
            ) : gameSystem === 'pf2e' ? (
              <span className="pf2e-badge hidden sm:inline-block">{sysConfig.badge}</span>
            ) : (
              <span className="stamp-badge hidden sm:inline-block" style={{ borderColor: sysConfig.accentColor, color: sysConfig.accentColor }}>
                {sysConfig.badge}
              </span>
            )}
            <h1 className={`text-xs sm:text-sm font-extrabold tracking-wider uppercase ${
              gameSystem === 'cyberpunk' ? 'font-cyber text-[#00e5ff]'
              : gameSystem === 'pf2e' ? 'font-chronicle text-[#c8a84b]'
              : 'font-display'
            }`}>
              {sysConfig.name}{' '}
              <span className={`text-[9px] sm:text-[10px] px-1 py-0.5 border ${
                gameSystem === 'cyberpunk'
                  ? 'font-cyber bg-[#040710] border-[#00e5ff]/40 text-[#00e5ff]/70'
                  : gameSystem === 'pf2e'
                  ? 'font-chronicle bg-[#160f04] border-[#c8a84b]/40 text-[#c8a84b]/70 rounded-sm'
                  : 'font-typewriter bg-[#FAF6EE] dark:bg-[#141816] rounded-sm'
              }`} style={gameSystem === 'coc' ? { color: sysConfig.accentColor } : {}}>DESK</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Game System Switcher Dropdown */}
      {onChangeGameSystem && (
        <div className={`flex items-center gap-1 text-xs ${
          gameSystem === 'cyberpunk' ? 'font-cyber' : gameSystem === 'pf2e' ? 'font-chronicle' : 'font-typewriter'
        }`}>
          <span className="text-[10px] opacity-70 uppercase font-bold hidden sm:inline">SYSTEM:</span>
          <select
            value={gameSystem}
            onChange={(e) => onChangeGameSystem(e.target.value)}
            className={`px-1.5 py-0.5 sm:px-2 sm:py-1 border-2 text-[10px] sm:text-xs font-bold uppercase cursor-pointer max-w-[110px] sm:max-w-none ${
              gameSystem === 'cyberpunk' ? 'rounded-none' : 'rounded-sm'
            }`}
            style={{
              backgroundColor: gameSystem === 'cyberpunk' ? '#040710' : gameSystem === 'pf2e' ? '#160f04' : '#141816',
              borderColor: gameSystem === 'cyberpunk' ? '#00e5ff' : gameSystem === 'pf2e' ? '#c8a84b' : sysConfig.accentColor,
              color: gameSystem === 'cyberpunk' ? '#00e5ff' : gameSystem === 'pf2e' ? '#c8a84b' : sysConfig.accentColor
            }}
          >
            <option value="coc">CoC 7e</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="pf2e">Pathfinder 2e</option>
          </select>
        </div>
      )}

      {/* Center Quick Time & Moon Widget */}
      <div className={`hidden md:flex items-center gap-3 px-3.5 py-1.5 border-2 text-xs ${
        gameSystem === 'cyberpunk'
          ? 'font-cyber bg-[#040710] border-[#1a2e4a] text-[#4a6b8a] rounded-none'
          : gameSystem === 'pf2e'
          ? 'font-typewriter dark:bg-[#160f04] bg-[#f0e0c4] dark:border-[#3d2e1a] border-[#c8a84b]/40 text-[#7a6040] rounded-sm'
          : 'font-typewriter dark:bg-[#141816] bg-[#FAF6EE] dark:border-[#2D3732] border-[#1C201D] rounded-sm shadow-retro-sm'
      }`}>
        <div className={`flex items-center gap-1.5 ${
          gameSystem === 'cyberpunk' ? 'text-[#00e5ff]' : gameSystem === 'pf2e' ? 'text-[#c8a84b]' : 'text-[#D99F26]'
        }`}>
          <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="font-bold tracking-wide">
            {currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>
        <span className="opacity-40">|</span>
        <div className="flex items-center gap-1.5 font-semibold opacity-80">
          <span>{currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        {gameSystem !== 'cyberpunk' && (
          <>
            <span className="opacity-40">|</span>
            <div className={`flex items-center gap-1.5 ${
              gameSystem === 'pf2e' ? 'text-[#8b2020]' : 'text-[#2A6B60]'
            }`} title={`Moon Phase: ${moonInfo.phaseName}`}>
              <Moon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="font-bold">{moonInfo.daysUntilFullMoon === 0 ? 'FULL MOON' : `${moonInfo.daysUntilFullMoon}d TO FULL`}</span>
            </div>
          </>
        )}
        {gameSystem === 'cyberpunk' && (
          <>
            <span className="opacity-40">|</span>
            <div className="flex items-center gap-1.5 text-[#e60037]" title="Night City">
              <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="font-bold">NIGHT CITY</span>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-display uppercase font-bold tracking-wider dark:bg-[#252E2A] bg-[#FAF6EE] dark:text-[#D99F26] text-[#E65A2B] dark:border-[#090C0A] border-[#1C201D] border-2 btn-retro cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 stroke-[2.5]" /> : <Moon className="w-4 h-4 stroke-[2.5]" />}
          <span className="hidden sm:inline">{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
        </button>

        {/* Export JSON */}
        <button
          onClick={onExportCampaign}
          title="Export Campaign Backup (JSON)"
          aria-label="Export Campaign Backup"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-display font-bold uppercase dark:bg-[#252E2A] bg-[#FAF6EE] hover:bg-[#DCD4C2] dark:hover:bg-[#2D3732] dark:border-[#090C0A] border-[#1C201D] border-2 btn-retro cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#D99F26] stroke-[2.5]" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Import JSON or PDF */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,.pdf"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import Campaign (JSON) or PDF Character Sheet (.pdf)"
          aria-label="Import Campaign or PDF Character Sheet"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-display font-bold uppercase dark:bg-[#252E2A] bg-[#FAF6EE] hover:bg-[#DCD4C2] dark:hover:bg-[#2D3732] dark:border-[#090C0A] border-[#1C201D] border-2 btn-retro cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-[#D99F26] stroke-[2.5]" />
          <span className="hidden sm:inline">Import</span>
        </button>

        {/* Reset Sample Data */}
        <button
          onClick={onResetSampleData}
          title="Reset to Default Campaign Data"
          aria-label="Reset to Default Campaign Data"
          className="p-1.5 rounded-sm text-xs dark:bg-[#252E2A] bg-[#FAF6EE] hover:bg-[#DCD4C2] dark:hover:bg-[#2D3732] dark:border-[#090C0A] border-[#1C201D] border-2 btn-retro cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Sync Indicator */}
        <SyncIndicator syncStatus={syncStatus} onClick={onOpenSync} />

        {/* Sidebar Toggle Button (Desktop only) */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Collapse Side Trackers' : 'Expand Side Trackers'}
          aria-label={isSidebarOpen ? 'Collapse Side Trackers' : 'Expand Side Trackers'}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-display uppercase font-bold tracking-wider btn-retro border-2 dark:border-[#090C0A] border-[#1C201D] cursor-pointer ${
            isSidebarOpen
              ? 'bg-[#D99F26] text-[#141816]'
              : 'dark:bg-[#252E2A] bg-[#FAF6EE]'
          }`}
        >
          {isSidebarOpen ? <PanelRightClose className="w-3.5 h-3.5 stroke-[2.5]" /> : <PanelRightOpen className="w-3.5 h-3.5 stroke-[2.5]" />}
          <span className="hidden lg:inline">{isSidebarOpen ? 'Hide Panel' : 'Show Panel'}</span>
        </button>

        {/* Change Role / System Button */}
        {onChangeRole && (
          <button
            onClick={onChangeRole}
            title="Return to System & Role Selection Landing Page"
            aria-label="Return to System & Role Selection Landing Page"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs dark:bg-[#252E2A] bg-[#FAF6EE] dark:border-[#090C0A] border-[#1C201D] border-2 btn-retro font-display uppercase font-bold tracking-wider cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        )}
      </div>
    </header>
  );
}

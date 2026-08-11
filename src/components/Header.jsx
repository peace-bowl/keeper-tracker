import React, { useRef } from 'react';
import { Download, Upload, RefreshCw, Moon, Sun, Clock, PanelRightOpen, PanelRightClose, LogOut, Dices, Zap, Crown } from 'lucide-react';
import { getMoonPhaseDetails } from '../utils/cocRules';
import { parsePdfInvestigator } from '../utils/pdfParser';
import { GAME_SYSTEMS } from '../data/gameSystems';
import logoImg from '../assets/logo.png';

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
  onChangeGameSystem
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
    <header className={`border-b-2 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-retro transition-colors duration-200 ${
      gameSystem === 'cyberpunk'
        ? 'dark:bg-[#0d1117] bg-[#ffffff] dark:text-[#f0f6fc] text-[#0d0d0d] border-[#ffee00]/50 dark:border-[#ffee00]/40'
        : gameSystem === 'pf2e'
        ? 'dark:bg-[#161c28] bg-[#ffffff] dark:text-[#e2e8f0] text-[#1e293b] border-[#d4af37]/50 dark:border-[#d4af37]/40'
        : 'dark:bg-[#1C2320] bg-[#EBE4D4] dark:border-[#090C0A] border-[#1C201D] dark:text-[#EBE6DB] text-[#1C201D]'
    }`}>
      {/* Title & Brand */}
      <div className="flex items-center gap-3">
        <img
          src={logoImg}
          alt="TTRPG Desk Logo"
          className="w-10 h-10 rounded-sm object-cover border-2 dark:border-[#090C0A] border-[#1C201D] shadow-retro-sm"
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="stamp-badge border-[#E65A2B] text-[#E65A2B]" style={{
              borderColor: sysConfig.accentColor,
              color: sysConfig.accentColor
            }}>
              {sysConfig.badge}
            </span>
            <h1 className="text-sm font-display font-extrabold tracking-wider uppercase">
              {sysConfig.name} <span className="text-[10px] bg-[#FAF6EE] dark:bg-[#141816] px-1.5 py-0.5 rounded-sm border font-typewriter" style={{ color: sysConfig.accentColor }}>DESK</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Game System Switcher Dropdown */}
      {onChangeGameSystem && (
        <div className="flex items-center gap-1 font-typewriter text-xs">
          <span className="text-[10px] opacity-70 uppercase font-bold hidden sm:inline">SYSTEM:</span>
          <select
            value={gameSystem}
            onChange={(e) => onChangeGameSystem(e.target.value)}
            className="px-2 py-1 rounded-sm border-2 font-bold uppercase cursor-pointer"
            style={{
              backgroundColor: gameSystem === 'cyberpunk' ? '#161b22' : gameSystem === 'pf2e' ? '#10141d' : '#141816',
              borderColor: sysConfig.accentColor,
              color: sysConfig.accentColor
            }}
          >
            <option value="coc">Call of Cthulhu 7e</option>
            <option value="cyberpunk">Cyberpunk RED</option>
            <option value="pf2e">Pathfinder 2e</option>
          </select>
        </div>
      )}

      {/* Center Quick Time & Moon Widget */}
      <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-sm dark:bg-[#141816] bg-[#FAF6EE] dark:border-[#2D3732] border-[#1C201D] border-2 text-xs font-typewriter shadow-retro-sm">
        <div className="flex items-center gap-1.5 text-[#D99F26]">
          <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="font-bold tracking-wide">
            {currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>
        <span className="opacity-40">|</span>
        <div className="flex items-center gap-1.5 font-semibold opacity-80">
          <span>{currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <span className="opacity-40">|</span>
        <div className="flex items-center gap-1.5 text-[#2A6B60]" title={`Moon Phase: ${moonInfo.phaseName}`}>
          <Moon className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="font-bold">{moonInfo.daysUntilFullMoon === 0 ? 'FULL MOON' : `${moonInfo.daysUntilFullMoon}d TO FULL`}</span>
        </div>
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

        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Collapse Side Trackers' : 'Expand Side Trackers'}
          aria-label={isSidebarOpen ? 'Collapse Side Trackers' : 'Expand Side Trackers'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-display uppercase font-bold tracking-wider btn-retro border-2 dark:border-[#090C0A] border-[#1C201D] cursor-pointer ${
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

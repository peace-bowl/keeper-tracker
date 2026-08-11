import React, { useState } from 'react';
import { Clock, Calendar, Moon, Sun, Plus, Trash2, Bell, AlertTriangle } from 'lucide-react';
import RetroNumberInput from './RetroNumberInput';
import { getMoonPhaseDetails } from '../utils/cocRules';

export default function TimeTracker({
  gameSystem = 'coc',
  timeState,
  timers,
  characters,
  onAdvanceTime,
  onSetDateTime,
  onAddTimer,
  onDeleteTimer
}) {
  const currentDate = new Date(timeState.isoDate);
  const moonInfo = getMoonPhaseDetails(currentDate);

  const pad = (n) => n.toString().padStart(2, '0');
  const initialDateStr = !isNaN(currentDate.getTime())
    ? `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())}`
    : '1926-10-24';
  const initialTimeStr = !isNaN(currentDate.getTime())
    ? `${pad(currentDate.getHours())}:${pad(currentDate.getMinutes())}`
    : '21:30';

  const [showDateEditor, setShowDateEditor] = useState(false);
  const [editDateStr, setEditDateStr] = useState(initialDateStr);
  const [editTimeStr, setEditTimeStr] = useState(initialTimeStr);
  const [editSeason, setEditSeason] = useState(timeState.season || 'Autumn');

  const [showAddTimer, setShowAddTimer] = useState(false);
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerTarget, setNewTimerTarget] = useState('Global Scene');
  const [newTimerDuration, setNewTimerDuration] = useState(15);
  const [newTimerUnit, setNewTimerUnit] = useState('minutes');
  const [newTimerCategory, setNewTimerCategory] = useState(gameSystem === 'cyberpunk' ? 'Cyberware' : gameSystem === 'pf2e' ? 'Spell' : 'Light');

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysOfWeek[currentDate.getDay()];

  const handleSaveDateTime = (e) => {
    e.preventDefault();
    if (!editDateStr || !editTimeStr) return;
    try {
      const [y, m, d] = editDateStr.split('-').map(Number);
      const [hrs, mins] = editTimeStr.split(':').map(Number);
      const targetD = new Date(y, m - 1, d, hrs, mins, 0);
      if (isNaN(targetD.getTime())) throw new Error('Invalid date');
      if (onSetDateTime) {
        onSetDateTime(targetD.toISOString(), editSeason);
      }
      setShowDateEditor(false);
    } catch {
      alert('Invalid date or time specification.');
    }
  };

  const handlePreset = (date, time, season) => {
    setEditDateStr(date);
    setEditTimeStr(time);
    setEditSeason(season);
  };

  const handleCreateTimer = (e) => {
    e.preventDefault();
    if (!newTimerName.trim()) return;

    onAddTimer({
      id: `timer-${Date.now()}`,
      name: newTimerName.trim(),
      target: newTimerTarget,
      durationMinutes: Number(newTimerDuration),
      remainingMinutes: Number(newTimerDuration),
      unit: newTimerUnit,
      category: newTimerCategory
    });

    setNewTimerName('');
    setShowAddTimer(false);
  };

  return (
    <div className={`p-4 rounded-sm border-2 space-y-4 shadow-retro transition-colors duration-200 ${
      gameSystem === 'cyberpunk'
        ? 'dark:bg-[#0d1117] bg-[#ffffff] dark:text-[#f0f6fc] text-[#0d0d0d] border-[#ffee00] dark:border-[#21262d]'
        : gameSystem === 'pf2e'
        ? 'dark:bg-[#161c28] bg-[#ffffff] dark:text-[#e2e8f0] text-[#1e293b] border-[#d4af37] dark:border-[#1e293b]'
        : 'dark:bg-[#1C2320] bg-[#EBE4D4] dark:text-[#EBE6DB] text-[#161B18] dark:border-[#090C0A] border-[#1C201D]'
    }`}>
      {/* Header - 1960s Chronometer Header */}
      <div className="flex items-center justify-between border-b-2 dark:border-[#090C0A] border-[#1C201D] pb-2.5">
        <h2 className="text-xs font-bold dark:text-[#F4EFE3] text-[#161B18] font-display flex items-center gap-2 uppercase tracking-wider">
          <Clock className="w-4 h-4 text-[#D99F26] stroke-[2.5]" />
          {gameSystem === 'cyberpunk' ? 'NIGHT CITY CYBER-CLOCK' : gameSystem === 'pf2e' ? 'GOLARION TIMEPIECE' : 'CHRONOMETER LOG'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDateEditor(!showDateEditor)}
            className="px-2 py-0.5 rounded-sm bg-[#D99F26] text-[#141816] font-display uppercase font-bold text-[10px] border dark:border-[#090C0A] border-[#1C201D] btn-retro shadow-retro-sm"
            title="Custom Date & Time Control"
          >
            {showDateEditor ? 'Close' : 'Set Date/Time'}
          </button>
        </div>
      </div>

      {/* Date & Time Editor Form */}
      {showDateEditor && (
        <form onSubmit={handleSaveDateTime} className="dark:bg-[#141816] bg-[#FAF6EE] p-3 rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] space-y-3 font-typewriter text-xs shadow-retro-sm">
          <div className="text-[10px] font-bold text-[#D99F26] uppercase flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>CUSTOM DATE & TIME EDITOR</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] dark:text-[#A8B2AC] text-[#5A6861] font-bold uppercase block mb-1">Date</label>
              <input
                type="date"
                value={editDateStr}
                onChange={(e) => setEditDateStr(e.target.value)}
                className="w-full dark:bg-[#1C2320] bg-[#EFEAD8] border-2 dark:border-[#2D3732] border-[#1C201D] rounded-sm px-2 py-1 dark:text-[#F4EFE3] text-[#161B18] font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[10px] dark:text-[#A8B2AC] text-[#5A6861] font-bold uppercase block mb-1">Time (24h)</label>
              <input
                type="time"
                value={editTimeStr}
                onChange={(e) => setEditTimeStr(e.target.value)}
                className="w-full dark:bg-[#1C2320] bg-[#EFEAD8] border-2 dark:border-[#2D3732] border-[#1C201D] rounded-sm px-2 py-1 dark:text-[#F4EFE3] text-[#161B18] font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] dark:text-[#A8B2AC] text-[#5A6861] font-bold uppercase block mb-1">Season</label>
            <select
              value={editSeason}
              onChange={(e) => setEditSeason(e.target.value)}
              className="w-full dark:bg-[#1C2320] bg-[#EFEAD8] border-2 dark:border-[#2D3732] border-[#1C201D] rounded-sm px-2 py-1 dark:text-[#EBE6DB] text-[#161B18] font-bold"
            >
              <option value="Autumn">Autumn (Fall)</option>
              <option value="Winter">Winter</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
            </select>
          </div>

          {/* Presets */}
          <div className="space-y-1 pt-1">
            <span className="text-[9px] dark:text-[#A8B2AC] text-[#5A6861] font-bold uppercase block">Campaign Era Presets:</span>
            <div className="flex flex-wrap gap-1 text-[10px]">
              {gameSystem === 'cyberpunk' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handlePreset('2045-06-15', '22:00', 'Summer')}
                    className="px-2 py-0.5 dark:bg-[#252E2A] bg-[#EBE4D4] rounded-sm border dark:border-[#2D3732] border-[#1C201D] dark:text-[#EBE6DB] text-[#161B18] cursor-pointer"
                  >
                    2045 Night City (June 15)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset('2077-12-10', '02:30', 'Winter')}
                    className="px-2 py-0.5 dark:bg-[#252E2A] bg-[#EBE4D4] rounded-sm border dark:border-[#2D3732] border-[#1C201D] dark:text-[#EBE6DB] text-[#161B18] cursor-pointer"
                  >
                    2077 Arasaka Raid
                  </button>
                </>
              ) : gameSystem === 'pf2e' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handlePreset('4724-04-12', '12:00', 'Spring')}
                    className="px-2 py-0.5 dark:bg-[#252E2A] bg-[#EBE4D4] rounded-sm border dark:border-[#2D3732] border-[#1C201D] dark:text-[#EBE6DB] text-[#161B18] cursor-pointer"
                  >
                    4724 AR Otari (Spring)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset('4720-08-01', '09:00', 'Summer')}
                    className="px-2 py-0.5 dark:bg-[#252E2A] bg-[#EBE4D4] rounded-sm border dark:border-[#2D3732] border-[#1C201D] dark:text-[#EBE6DB] text-[#161B18] cursor-pointer"
                  >
                    4720 AR Absalom Festival
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handlePreset('1926-10-24', '21:30', 'Autumn')}
                    className="px-2 py-0.5 dark:bg-[#252E2A] bg-[#EBE4D4] rounded-sm border dark:border-[#2D3732] border-[#1C201D] dark:text-[#EBE6DB] text-[#161B18] cursor-pointer"
                  >
                    1926 Arkham (Oct 24)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset('1928-02-15', '01:00', 'Winter')}
                    className="px-2 py-0.5 dark:bg-[#252E2A] bg-[#EBE4D4] rounded-sm border dark:border-[#2D3732] border-[#1C201D] dark:text-[#EBE6DB] text-[#161B18] cursor-pointer"
                  >
                    1928 Innsmouth Raid
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  handlePreset(
                    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
                    `${pad(now.getHours())}:${pad(now.getMinutes())}`,
                    'Autumn'
                  );
                }}
                className="px-2 py-0.5 dark:bg-[#252E2A] bg-[#EBE4D4] rounded-sm border dark:border-[#2D3732] border-[#1C201D] dark:text-[#EBE6DB] text-[#161B18] cursor-pointer"
              >
                System Now
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t dark:border-[#2D3732] border-[#1C201D]">
            <button
              type="button"
              onClick={() => setShowDateEditor(false)}
              className="px-2.5 py-1 text-[#A8B2AC] hover:text-[#EBE6DB] font-display uppercase font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1 bg-[#E65A2B] text-[#F4EFE3] font-display uppercase font-bold text-xs rounded-sm border-2 border-[#090C0A] btn-retro shadow-retro-orange"
            >
              Save Chronometer
            </button>
          </div>
        </form>
      )}

      {/* Date & Time Main Readout */}
      <div className="grid grid-cols-2 gap-2.5 dark:bg-[#141816] bg-[#FAF6EE] p-3 rounded-sm border-2 dark:border-[#2D3732] border-[#1C201D] dark:text-[#EBE6DB] text-[#161B18] shadow-retro-sm">
        <div>
          <div className="text-[10px] font-typewriter font-bold dark:text-[#A8B2AC] text-[#5A6861] flex items-center gap-1 uppercase">
            <Calendar className="w-3 h-3 text-[#D99F26] stroke-[2.5]" />
            <span>CALENDAR</span>
          </div>
          <div className="text-xs font-bold dark:text-[#F4EFE3] text-[#161B18] font-display uppercase mt-0.5">
            {dayName}
          </div>
          <div className="text-[11px] dark:text-[#A8B2AC] text-[#5A6861] font-typewriter mt-0.5 font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-typewriter font-bold dark:text-[#A8B2AC] text-[#5A6861] flex items-center gap-1 uppercase">
            <Clock className="w-3 h-3 text-[#E65A2B] stroke-[2.5]" />
            <span>TIME READOUT</span>
          </div>
          <div className="text-base font-bold text-[#D99F26] font-typewriter mt-0.5 tracking-wider">
            {currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
          <div className="text-[11px] dark:text-[#A8B2AC] text-[#5A6861] font-typewriter flex items-center gap-1 font-semibold">
            <Sun className="w-3 h-3 text-[#2A6B60] stroke-[2.5]" />
            <span>{timeState.season || 'Autumn'}</span>
          </div>
        </div>
      </div>

      {/* Moon Phase Notice */}
      <div className="dark:bg-[#141816] bg-[#FAF6EE] p-2.5 rounded-sm border-2 dark:border-[#2D3732] border-[#1C201D] flex items-center justify-between text-xs font-typewriter dark:text-[#EBE6DB] text-[#161B18] shadow-retro-sm">
        <div className="flex items-center gap-2">
          <Moon className="w-3.5 h-3.5 text-[#2A6B60] stroke-[2.5] shrink-0" />
          <span className="dark:text-[#F4EFE3] text-[#161B18] font-bold">{moonInfo.phaseName}</span>
        </div>
        <span className="text-[10px] text-[#D99F26] font-bold">
          {moonInfo.isFullMoon ? 'FULL MOON' : `${moonInfo.daysUntilFullMoon}d TO FULL`}
        </span>
      </div>

      {/* Time Advance Quick Controls - Mechanical Clock Jump Keys */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-typewriter font-bold dark:text-[#A8B2AC] text-[#5A6861] uppercase tracking-wider">
          <span>ADVANCE CLOCKWORK</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 font-display text-xs">
          <button
            onClick={() => onAdvanceTime(1, 'minutes')}
            className="py-1 px-1 dark:bg-[#252E2A] bg-[#FAF6EE] hover:bg-[#E65A2B] hover:text-[#F4EFE3] dark:text-[#EBE6DB] text-[#161B18] border-2 dark:border-[#090C0A] border-[#1C201D] rounded-sm text-center font-bold btn-retro"
          >
            +1M
          </button>
          <button
            onClick={() => onAdvanceTime(5, 'minutes')}
            className="py-1 px-1 dark:bg-[#252E2A] bg-[#FAF6EE] hover:bg-[#E65A2B] hover:text-[#F4EFE3] dark:text-[#EBE6DB] text-[#161B18] border-2 dark:border-[#090C0A] border-[#1C201D] rounded-sm text-center font-bold btn-retro"
          >
            +5M
          </button>
          <button
            onClick={() => onAdvanceTime(60, 'minutes')}
            className="py-1 px-1 bg-[#D99F26] text-[#141816] border-2 dark:border-[#090C0A] border-[#1C201D] rounded-sm text-center font-extrabold btn-retro shadow-retro-ochre"
          >
            +1H
          </button>
          <button
            onClick={() => onAdvanceTime(480, 'minutes')}
            title="8-Hour Full Rest"
            className="py-1 px-1 dark:bg-[#252E2A] bg-[#FAF6EE] hover:bg-[#2A6B60] hover:text-[#F4EFE3] dark:text-[#EBE6DB] text-[#161B18] border-2 dark:border-[#090C0A] border-[#1C201D] rounded-sm text-center font-bold btn-retro"
          >
            +8H
          </button>
          <button
            onClick={() => onAdvanceTime(1440, 'minutes')}
            className="py-1 px-1 dark:bg-[#252E2A] bg-[#FAF6EE] hover:bg-[#E65A2B] hover:text-[#F4EFE3] dark:text-[#EBE6DB] text-[#161B18] border-2 dark:border-[#090C0A] border-[#1C201D] rounded-sm text-center font-bold btn-retro"
          >
            +1D
          </button>
        </div>
      </div>

      {/* Active Condition & Event Timers */}
      <div className="space-y-2 pt-2 border-t-2 dark:border-[#090C0A] border-[#1C201D]">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-typewriter font-bold dark:text-[#F4EFE3] text-[#161B18] uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-[#E65A2B] stroke-[2.5]" />
            <span>ACTIVE TIMERS ({timers.length})</span>
          </div>
          <button
            onClick={() => setShowAddTimer(!showAddTimer)}
            className="flex items-center gap-1 text-[10px] font-display uppercase font-bold text-[#F4EFE3] bg-[#E65A2B] border dark:border-[#090C0A] border-[#1C201D] px-2 py-0.5 rounded-sm btn-retro"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>New Timer</span>
          </button>
        </div>

        {/* Add Timer Form */}
        {showAddTimer && (
          <form onSubmit={handleCreateTimer} className="dark:bg-[#141816] bg-[#FAF6EE] p-3 rounded-sm border-2 dark:border-[#2D3732] border-[#1C201D] space-y-2 text-xs font-typewriter shadow-retro-sm">
            <div className="font-bold text-[#D99F26] text-xs uppercase">Add Countdown Record</div>
            <input
              type="text"
              placeholder="Timer Designation (e.g. Lantern Oil)"
              value={newTimerName}
              onChange={(e) => setNewTimerName(e.target.value)}
              className="w-full dark:bg-[#1C2320] bg-[#EFEAD8] border-2 dark:border-[#2D3732] border-[#1C201D] rounded-sm px-2.5 py-1 dark:text-[#EBE6DB] text-[#161B18] focus:outline-none focus:border-[#E65A2B]"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] dark:text-[#A8B2AC] text-[#5A6861] font-bold block mb-0.5 uppercase">Target Subject</label>
                <select
                  value={newTimerTarget}
                  onChange={(e) => setNewTimerTarget(e.target.value)}
                  className="w-full dark:bg-[#1C2320] bg-[#EFEAD8] border-2 dark:border-[#2D3732] border-[#1C201D] rounded-sm px-1.5 py-1 dark:text-[#EBE6DB] text-[#161B18]"
                >
                  <option value="Global Scene">Global Scene</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] dark:text-[#A8B2AC] text-[#5A6861] font-bold block mb-0.5 uppercase">Category</label>
                <select
                  value={newTimerCategory}
                  onChange={(e) => setNewTimerCategory(e.target.value)}
                  className="w-full dark:bg-[#1C2320] bg-[#EFEAD8] border-2 dark:border-[#2D3732] border-[#1C201D] rounded-sm px-1.5 py-1 dark:text-[#EBE6DB] text-[#161B18]"
                >
                  <option value="Light">Light / Item</option>
                  <option value="Sanity">Sanity / Madness</option>
                  <option value="Spell">Spell / Artifact</option>
                  <option value="Event">Environment / Event</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] dark:text-[#A8B2AC] text-[#5A6861] font-bold block mb-0.5 uppercase">Duration</label>
                <RetroNumberInput
                  min={1}
                  max={9999}
                  value={newTimerDuration}
                  onChange={(val) => setNewTimerDuration(val)}
                  className="w-full"
                  inputClassName="text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] dark:text-[#A8B2AC] text-[#5A6861] font-bold block mb-0.5 uppercase">Unit</label>
                <select
                  value={newTimerUnit}
                  onChange={(e) => setNewTimerUnit(e.target.value)}
                  className="w-full dark:bg-[#1C2320] bg-[#EFEAD8] border-2 dark:border-[#2D3732] border-[#1C201D] rounded-sm px-1.5 py-1 dark:text-[#EBE6DB] text-[#161B18]"
                >
                  <option value="minutes">Minutes</option>
                  <option value="rounds">Rounds</option>
                  <option value="hours">Hours</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddTimer(false)}
                className="px-2 py-1 dark:text-[#A8B2AC] text-[#5A6861] hover:text-[#161B18] font-display uppercase font-bold text-[11px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-[#D99F26] text-[#141816] font-display uppercase font-bold rounded-sm border dark:border-[#090C0A] border-[#1C201D] text-[11px] btn-retro"
              >
                Save Timer
              </button>
            </div>
          </form>
        )}

        {/* Timers List */}
        {timers.length === 0 ? (
          <div className="text-center py-3 text-xs dark:text-[#5A6861] text-[#A8B2AC] font-typewriter uppercase dark:bg-[#141816] bg-[#FAF6EE] rounded-sm border dark:border-[#2D3732] border-[#1C201D]">
            No active timers running.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {timers.map((t) => {
              const isExpired = t.remainingMinutes <= 0;

              return (
                <div
                  key={t.id}
                  className={`p-2.5 rounded-sm border-2 text-xs flex items-center justify-between gap-2 transition-all font-typewriter shadow-retro-sm ${
                    isExpired
                      ? 'bg-[#2A1412] border-[#E65A2B] text-[#F4EFE3]'
                      : 'dark:bg-[#141816] bg-[#FAF6EE] dark:border-[#2D3732] border-[#1C201D] dark:text-[#EBE6DB] text-[#161B18]'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-bold flex items-center gap-1.5">
                      {isExpired && <AlertTriangle className="w-3.5 h-3.5 text-[#E65A2B] shrink-0 stroke-[2.5]" />}
                      <span className="truncate">{t.name}</span>
                    </div>
                    <div className="text-[10px] dark:text-[#A8B2AC] text-[#5A6861]">
                      Target: {t.target} • {t.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-bold px-2 py-0.5 rounded-sm text-[10px] border ${
                      isExpired ? 'bg-[#E65A2B] text-[#F4EFE3] border-[#090C0A]' : 'dark:bg-[#1C2320] bg-[#EFEAD8] text-[#D99F26] dark:border-[#2D3732] border-[#1C201D]'
                    }`}>
                      {isExpired ? 'EXPIRED' : `${t.remainingMinutes} ${t.unit}`}
                    </span>
                    <button
                      onClick={() => onDeleteTimer(t.id)}
                      className="dark:text-[#A8B2AC] text-[#5A6861] hover:text-[#E65A2B] p-0.5 transition-colors"
                      title="Delete Timer"
                      aria-label={`Delete timer ${t.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Dices, Sparkles, Copy, Check, RotateCcw, Zap, Crown } from 'lucide-react';
import { evaluateCoCRoll, evaluateCyberpunkRoll, evaluatePF2eRoll } from '../utils/diceRules';
import RetroNumberInput from './RetroNumberInput';

export default function DiceConsole({
  gameSystem = 'coc',
  diceLog = [],
  onAddDiceLog,
  onClearDiceLog
}) {
  // Common state
  const [targetInput, setTargetInput] = useState(gameSystem === 'pf2e' ? 10 : gameSystem === 'cyberpunk' ? 15 : 50);
  const [modifierInput, setModifierInput] = useState(0); // Mod for CP/PF2e, or bonus/penalty for CoC
  const [cocModifier, setCocModifier] = useState('normal'); // 'normal', 'bonus1', 'bonus2', 'penalty1', 'penalty2'
  const [copied, setCopied] = useState(false);

  // Sync state defaults when game system changes
  useEffect(() => {
    if (gameSystem === 'pf2e') {
      setTargetInput(10);
      setModifierInput(0);
    } else if (gameSystem === 'cyberpunk') {
      setTargetInput(15);
      setModifierInput(0);
    } else {
      setTargetInput(50);
      setModifierInput(0);
    }
  }, [gameSystem]);

  // System-specific roll handlers
  const handleRollCoC = () => {
    const parsedTarget = parseInt(targetInput, 10);
    const target = isNaN(parsedTarget) ? 50 : parsedTarget;

    const units = Math.floor(Math.random() * 10);
    let numTensDice = 1;
    if (cocModifier === 'bonus1' || cocModifier === 'penalty1') numTensDice = 2;
    if (cocModifier === 'bonus2' || cocModifier === 'penalty2') numTensDice = 3;

    const tensRolls = [];
    for (let i = 0; i < numTensDice; i++) {
      tensRolls.push(Math.floor(Math.random() * 10) * 10);
    }

    const possibleTotals = tensRolls.map((tens) => {
      const val = tens + units;
      return val === 0 ? 100 : val;
    });

    let finalRoll = possibleTotals[0];
    if (cocModifier.startsWith('bonus')) {
      finalRoll = Math.min(...possibleTotals);
    } else if (cocModifier.startsWith('penalty')) {
      finalRoll = Math.max(...possibleTotals);
    }

    const result = evaluateCoCRoll(finalRoll, target);

    const logEntry = {
      id: `roll-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      diceType: 'd100',
      skillName: 'Manual D100 Check',
      targetValue: target,
      finalRoll,
      modifier: cocModifier,
      tensRolls,
      units,
      result
    };

    onAddDiceLog(logEntry);
  };

  const handleRollCyberpunk = () => {
    const parsedStatSkill = parseInt(modifierInput, 10);
    const statSkill = isNaN(parsedStatSkill) ? 0 : parsedStatSkill;
    const parsedDv = parseInt(targetInput, 10);
    const dv = isNaN(parsedDv) ? 15 : parsedDv;

    const evalRes = evaluateCyberpunkRoll(statSkill, dv);

    const logEntry = {
      id: `roll-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      diceType: '1d10 Exploding',
      skillName: 'Cyberpunk Skill Check',
      targetValue: dv,
      finalRoll: evalRes.total,
      result: evalRes.result
    };

    onAddDiceLog(logEntry);
  };

  const handleRollPF2e = () => {
    const parsedMod = parseInt(modifierInput, 10);
    const mod = isNaN(parsedMod) ? 0 : parsedMod;
    const parsedDc = parseInt(targetInput, 10);
    const dc = isNaN(parsedDc) ? 10 : parsedDc;

    const evalRes = evaluatePF2eRoll(mod, dc);

    const logEntry = {
      id: `roll-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      diceType: '1d20 Check',
      skillName: 'Pathfinder Skill Check',
      targetValue: dc,
      finalRoll: evalRes.total,
      result: evalRes.result
    };

    onAddDiceLog(logEntry);
  };

  const handleRollStandard = (sides) => {
    const roll = Math.floor(Math.random() * sides) + 1;
    const logEntry = {
      id: `roll-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      diceType: `d${sides}`,
      skillName: `Generic d${sides}`,
      targetValue: null,
      finalRoll: roll,
      result: {
        label: `RESULT: ${roll}`,
        color: gameSystem === 'cyberpunk' ? 'text-[#ffee00] border-[#ffee00] bg-[#161b22]' : gameSystem === 'pf2e' ? 'text-[#d4af37] border-[#d4af37] bg-[#161c28]' : 'text-[#D99F26] border-[#D99F26] bg-[#141816]'
      }
    };
    onAddDiceLog(logEntry);
  };

  const handleCopyLogs = () => {
    const text = diceLog.map(l => `[${l.timestamp}] ${l.skillName} (${l.diceType}): Roll ${l.finalRoll}${l.targetValue ? ` VS ${l.targetValue}` : ''} -> ${l.result.label}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // CoC Tentacle definitions
  const tentacles = [
    { id: 't1', edge: 'top',    pct: 18, angle: -80, len: 52, delay: '0s',    dur: '3.8s',  sway: 'tentacleSway'  },
    { id: 't2', edge: 'top',    pct: 72, angle: -95, len: 46, delay: '1.2s',  dur: '4.5s',  sway: 'tentacleSway2' },
    { id: 't3', edge: 'top',    pct: 44, angle: -88, len: 38, delay: '2.1s',  dur: '5.1s',  sway: 'tentacleSway3' },
    { id: 'b1', edge: 'bottom', pct: 28, angle:  90, len: 50, delay: '0.6s',  dur: '4.2s',  sway: 'tentacleSway2' },
    { id: 'b2', edge: 'bottom', pct: 60, angle:  85, len: 44, delay: '1.8s',  dur: '3.6s',  sway: 'tentacleSway'  },
    { id: 'b3', edge: 'bottom', pct: 82, angle:  92, len: 36, delay: '3.0s',  dur: '4.9s',  sway: 'tentacleSway3' },
    { id: 'l1', edge: 'left',   pct: 20, angle: 185, len: 48, delay: '0.9s',  dur: '4.0s',  sway: 'tentacleSway3' },
    { id: 'l2', edge: 'left',   pct: 65, angle: 175, len: 40, delay: '2.4s',  dur: '5.3s',  sway: 'tentacleSway'  },
    { id: 'r1', edge: 'right',  pct: 35, angle:   0, len: 46, delay: '1.5s',  dur: '3.9s',  sway: 'tentacleSway2' },
    { id: 'r2', edge: 'right',  pct: 75, angle:  -5, len: 38, delay: '2.8s',  dur: '4.6s',  sway: 'tentacleSway3' },
  ];

  return (
    <div
      id="dice-console-panel"
      className={`relative p-4 rounded-sm border-2 space-y-4 shadow-retro overflow-visible transition-colors duration-200 ${
        gameSystem === 'cyberpunk'
          ? 'dark:bg-[#0d1117] bg-[#ffffff] dark:text-[#f0f6fc] text-[#0d0d0d] border-[#ffee00] dark:border-[#21262d] shadow-[0_0_15px_rgba(255,238,0,0.15)]'
          : gameSystem === 'pf2e'
          ? 'dark:bg-[#161c28] bg-[#ffffff] dark:text-[#e2e8f0] text-[#1e293b] border-[#d4af37] dark:border-[#1e293b] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
          : 'dark:bg-[#1C2320] bg-[#EBE4D4] dark:text-[#EBE6DB] text-[#161B18] dark:border-[#090C0A] border-[#1C201D]'
      }`}
    >
      {/* ── Call of Cthulhu Tentacle Overlay ── */}
      {gameSystem === 'coc' && (
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible', zIndex: 0, position: 'absolute', top: 0, left: 0 }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="tGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#3B7A5A" stopOpacity="0.95" />
              <stop offset="55%"  stopColor="#2A5C44" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#1F3A2E" stopOpacity="0.0"  />
            </linearGradient>
          </defs>

          {tentacles.map((t) => {
            const l = t.len;
            const seg = l / 3;
            const path = `M0,0 C${(seg*0.4).toFixed(1)},-${(seg*0.55).toFixed(1)} ${(seg*0.85).toFixed(1)},${(seg*0.45).toFixed(1)} ${seg.toFixed(1)},0 C${(seg*1.35).toFixed(1)},-${(seg*0.45).toFixed(1)} ${(seg*1.75).toFixed(1)},${(seg*0.55).toFixed(1)} ${(l*0.66).toFixed(1)},0 C${(l*0.78).toFixed(1)},-${(seg*0.38).toFixed(1)} ${(l*0.91).toFixed(1)},${(seg*0.28).toFixed(1)} ${l},0`;

            const tx = t.edge === 'right'  ? '100%' : t.edge === 'left' ? '0%' : `${t.pct}%`;
            const ty = t.edge === 'bottom' ? '100%' : t.edge === 'top'  ? '0%' : `${t.pct}%`;

            return (
              <g
                key={t.id}
                style={{
                  transform: `translate(${tx}, ${ty}) rotate(${t.angle}deg)`,
                  transformOrigin: `${tx} ${ty}`,
                  transformBox: 'fill-box',
                  animation: `${t.sway} ${t.dur} ${t.delay} ease-in-out infinite, tentacleFade ${t.dur} ${t.delay} ease-in-out infinite`,
                }}
              >
                <path
                  d={path}
                  fill="none"
                  stroke="url(#tGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(59,122,90,0.7))' }}
                />
                <path
                  d={path}
                  fill="none"
                  stroke="rgba(140,220,180,0.15)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {[0.22, 0.48, 0.72].map((frac, i) => (
                  <circle
                    key={i}
                    cx={l * frac}
                    cy={0}
                    r={2.2 - frac}
                    fill="rgba(42,107,96,0.55)"
                    style={{ filter: 'drop-shadow(0 0 2px rgba(42,160,100,0.9))' }}
                  />
                ))}
              </g>
            );
          })}
        </svg>
      )}

      {/* ── Cyberpunk RED Glitch Border Glow Overlay ── */}
      {gameSystem === 'cyberpunk' && (
        <div className="absolute inset-0 border border-[#ffee00]/40 pointer-events-none rounded-sm animate-glitch" />
      )}

      {/* ── Pathfinder Ornate Gold Trim ── */}
      {gameSystem === 'pf2e' && (
        <div className="absolute inset-0 border border-[#d4af37]/30 pointer-events-none rounded-sm shadow-[inset_0_0_10px_rgba(212,175,55,0.1)]" />
      )}

      {/* All panel content sits above the decorative overlays */}
      <div className="relative" style={{ zIndex: 1 }}>

        {/* Console Title Bar */}
        <div className={`flex items-center justify-between pb-2.5 border-b-2 ${
          gameSystem === 'cyberpunk'
            ? 'border-[#ffee00]/30'
            : gameSystem === 'pf2e'
            ? 'border-[#d4af37]/30'
            : 'dark:border-[#090C0A] border-[#1C201D]'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-sm border-2 flex items-center justify-center font-bold shadow-retro-sm ${
              gameSystem === 'cyberpunk'
                ? 'bg-[#ffee00] text-[#0d0d0d] border-black'
                : gameSystem === 'pf2e'
                ? 'bg-[#d4af37] text-[#10141d] border-black'
                : 'bg-[#E65A2B] text-white border-[#090C0A]'
            }`}>
              {gameSystem === 'cyberpunk' ? <Zap className="w-3.5 h-3.5" /> : gameSystem === 'pf2e' ? <Crown className="w-3.5 h-3.5" /> : <Dices className="w-3.5 h-3.5 stroke-[2.5]" />}
            </div>
            <h2 className={`text-xs font-bold font-display uppercase tracking-wider ${
              gameSystem === 'cyberpunk' ? 'text-[#ffee00]' : gameSystem === 'pf2e' ? 'text-[#d4af37]' : 'dark:text-[#F4EFE3] text-[#161B18]'
            }`}>
              {gameSystem === 'cyberpunk' ? 'CYBERPUNK EXPLODING CONSOLE' : gameSystem === 'pf2e' ? 'PATHFINDER D20 CONSOLE' : 'BAKELITE DICE CONSOLE'}
            </h2>
          </div>
          <span className={`text-[10px] font-typewriter font-bold px-2 py-0.5 rounded-sm border uppercase ${
            gameSystem === 'cyberpunk'
              ? 'bg-[#161b22] text-[#00f0ff] border-[#00f0ff]/50'
              : gameSystem === 'pf2e'
              ? 'bg-[#10141d] text-[#d4af37] border-[#d4af37]/50'
              : 'dark:bg-[#141816] bg-[#FAF6EE] text-[#D99F26] dark:border-[#2D3732] border-[#1C201D]'
          }`}>
            {gameSystem.toUpperCase()} ENGINE
          </span>
        </div>

        {/* System Specific Roll Execution Box */}
        <div className={`p-3 rounded-sm border-2 space-y-3 shadow-retro-sm ${
          gameSystem === 'cyberpunk'
            ? 'dark:bg-[#161b22] bg-[#f4f6f8] dark:border-[#21262d] border-[#d0d7de]'
            : gameSystem === 'pf2e'
            ? 'dark:bg-[#10141d] bg-[#f8f6f0] dark:border-[#1e293b] border-[#e2e8f0]'
            : 'dark:bg-[#141816] bg-[#FAF6EE] dark:border-[#2D3732] border-[#1C201D]'
        }`}>

          {/* CALL OF CTHULHU D100 CONTROLS */}
          {gameSystem === 'coc' && (
            <>
              <div className="grid grid-cols-2 gap-2.5 font-typewriter">
                <div>
                  <label className="text-[10px] dark:text-[#A8B2AC] text-[#5A6861] block mb-1 uppercase font-bold">
                    Target Score (%)
                  </label>
                  <RetroNumberInput
                    min={1}
                    max={100}
                    value={targetInput}
                    onChange={(val) => setTargetInput(val)}
                    accentColor="orange"
                    className="w-full"
                    inputClassName="text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] dark:text-[#A8B2AC] text-[#5A6861] block mb-1 uppercase font-bold">
                    Dice Modifier
                  </label>
                  <select
                    value={cocModifier}
                    onChange={(e) => setCocModifier(e.target.value)}
                    className="w-full dark:bg-[#1C2320] bg-[#EFEAD8] border-2 dark:border-[#2D3732] border-[#1C201D] focus:border-[#E65A2B] rounded-sm px-2 py-1.5 text-xs text-[#D99F26] font-bold font-typewriter"
                  >
                    <option value="normal">Normal Roll</option>
                    <option value="bonus1">+1D Bonus Die</option>
                    <option value="bonus2">+2D Bonus Dice</option>
                    <option value="penalty1">-1D Penalty Die</option>
                    <option value="penalty2">-2D Penalty Dice</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleRollCoC}
                className="w-full py-2 bg-[#E65A2B] text-[#F4EFE3] font-bold font-display text-xs uppercase tracking-wider rounded-sm border-2 border-[#090C0A] shadow-retro-orange flex items-center justify-center gap-1.5 btn-retro cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>EXECUTE D100 CHECK</span>
              </button>
            </>
          )}

          {/* CYBERPUNK RED D10 EXPLODING CONTROLS */}
          {gameSystem === 'cyberpunk' && (
            <>
              <div className="grid grid-cols-2 gap-2.5 font-typewriter">
                <div>
                  <label className="text-[10px] text-[#ffee00] block mb-1 uppercase font-bold">
                    STAT + SKILL
                  </label>
                  <input
                    type="number"
                    value={modifierInput}
                    onChange={(e) => setModifierInput(e.target.value)}
                    className="w-full bg-[#0d0d0d] border-2 border-[#21262d] focus:border-[#ffee00] rounded-sm px-2 py-1.5 text-sm text-[#ffee00] font-bold font-typewriter"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#00f0ff] block mb-1 uppercase font-bold">
                    TARGET DV
                  </label>
                  <select
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    className="w-full bg-[#0d0d0d] border-2 border-[#21262d] focus:border-[#00f0ff] rounded-sm px-2 py-1.5 text-xs text-[#00f0ff] font-bold font-typewriter"
                  >
                    <option value="9">DV 9 (Everyday)</option>
                    <option value="13">DV 13 (Simple)</option>
                    <option value="15">DV 15 (Everyday/Hard)</option>
                    <option value="17">DV 17 (Difficult)</option>
                    <option value="21">DV 21 (Professional)</option>
                    <option value="24">DV 24 (Heroic)</option>
                    <option value="29">DV 29 (Incredible)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleRollCyberpunk}
                className="w-full py-2 bg-[#ffee00] text-[#0d0d0d] font-bold font-display text-xs uppercase tracking-wider rounded-sm border-2 border-black shadow-[0_0_10px_rgba(255,238,0,0.4)] flex items-center justify-center gap-1.5 btn-retro cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>EXECUTE 1D10 EXPLODING CHECK</span>
              </button>
            </>
          )}

          {/* PATHFINDER 2E D20 CONTROLS */}
          {gameSystem === 'pf2e' && (
            <>
              <div className="grid grid-cols-2 gap-2.5 font-typewriter">
                <div>
                  <label className="text-[10px] text-[#d4af37] block mb-1 uppercase font-bold">
                    Skill Modifier
                  </label>
                  <input
                    type="number"
                    value={modifierInput}
                    onChange={(e) => setModifierInput(e.target.value)}
                    className="w-full bg-[#10141d] border-2 border-[#1e293b] focus:border-[#d4af37] rounded-sm px-2 py-1.5 text-sm text-[#d4af37] font-bold font-typewriter"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#3b82f6] block mb-1 uppercase font-bold">
                    Target DC
                  </label>
                  <select
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    className="w-full bg-[#10141d] border-2 border-[#1e293b] focus:border-[#3b82f6] rounded-sm px-2 py-1.5 text-xs text-[#3b82f6] font-bold font-typewriter"
                  >
                    <option value="10">DC 10 (Untrained/Trivial)</option>
                    <option value="15">DC 15 (Simple/Lvl 1)</option>
                    <option value="20">DC 20 (Moderate/Lvl 5)</option>
                    <option value="25">DC 25 (Hard/Lvl 9)</option>
                    <option value="30">DC 30 (Master/Lvl 14)</option>
                    <option value="40">DC 40 (Legendary/Lvl 20)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleRollPF2e}
                className="w-full py-2 bg-[#d4af37] text-[#10141d] font-bold font-display text-xs uppercase tracking-wider rounded-sm border-2 border-black shadow-[0_0_10px_rgba(212,175,55,0.4)] flex items-center justify-center gap-1.5 btn-retro cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>EXECUTE D20 CHECK (4 DEGREES)</span>
              </button>
            </>
          )}

        </div>

        {/* Quick Polyhedral Dice Row */}
        <div className="grid grid-cols-6 gap-1 font-display text-xs">
          {[4, 6, 8, 10, 12, 20].map((sides) => (
            <button
              key={sides}
              onClick={() => handleRollStandard(sides)}
              className={`py-1 border-2 rounded-sm font-bold uppercase btn-retro text-center text-[11px] cursor-pointer ${
                gameSystem === 'cyberpunk'
                  ? 'bg-[#161b22] text-[#f0f6fc] hover:bg-[#ffee00] hover:text-[#0d0d0d] border-[#21262d]'
                  : gameSystem === 'pf2e'
                  ? 'bg-[#10141d] text-[#e2e8f0] hover:bg-[#d4af37] hover:text-[#10141d] border-[#1e293b]'
                  : 'dark:bg-[#252E2A] bg-[#FAF6EE] hover:bg-[#D99F26] dark:text-[#EBE6DB] text-[#161B18] hover:text-[#141816] dark:border-[#090C0A] border-[#1C201D]'
              }`}
            >
              d{sides}
            </button>
          ))}
        </div>

        {/* Teleprinter Roll History Log */}
        <div className={`space-y-2 pt-1 border-t-2 ${
          gameSystem === 'cyberpunk'
            ? 'border-[#21262d]'
            : gameSystem === 'pf2e'
            ? 'border-[#1e293b]'
            : 'dark:border-[#090C0A] border-[#1C201D]'
        }`}>
          <div className="flex items-center justify-between text-[11px] font-typewriter uppercase font-bold opacity-80">
            <span>ROLL LOG ({diceLog.length})</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLogs}
                className="hover:text-[#ffee00] flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy Roll Log"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
              <button
                onClick={onClearDiceLog}
                className="hover:text-[#ff0055] flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear Log"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 font-typewriter">
            {diceLog.length === 0 ? (
              <div className={`text-center py-4 text-xs uppercase rounded-sm border ${
                gameSystem === 'cyberpunk'
                  ? 'bg-[#161b22] border-[#21262d] text-[#8b949e]'
                  : gameSystem === 'pf2e'
                  ? 'bg-[#10141d] border-[#1e293b] text-[#94a3b8]'
                  : 'dark:text-[#5A6861] text-[#A8B2AC] dark:bg-[#141816] bg-[#FAF6EE] dark:border-[#2D3732] border-[#1C201D]'
              }`}>
                No roll records printed yet.
              </div>
            ) : (
              diceLog.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded-sm border-2 text-xs flex items-center justify-between gap-2 shadow-retro-sm ${
                    gameSystem === 'cyberpunk'
                      ? 'bg-[#161b22] border-[#21262d]'
                      : gameSystem === 'pf2e'
                      ? 'bg-[#10141d] border-[#1e293b]'
                      : 'dark:bg-[#141816] bg-[#FAF6EE] dark:border-[#2D3732] border-[#1C201D]'
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-bold flex items-center gap-1.5">
                      <span>{log.skillName}</span>
                      {log.targetValue && (
                        <span className="text-[10px] opacity-70">({log.diceType} VS {log.targetValue})</span>
                      )}
                    </div>
                    {log.tensRolls && log.tensRolls.length > 1 && (
                      <div className="text-[10px] opacity-70">
                        Tens: [{log.tensRolls.join(', ')}] ({log.modifier})
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-[#D99F26]">
                      {log.finalRoll}
                    </div>
                    <span className={`text-[9px] font-bold px-1 py-0.2 rounded-sm border uppercase ${log.result.color}`}>
                      {log.result.label}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>{/* /z-index content wrapper */}
    </div>
  );
}

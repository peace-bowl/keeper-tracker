import React, { useState, useEffect } from 'react';
import { Dices, X, Sparkles, RotateCcw } from 'lucide-react';
import { evaluateCoCRoll, evaluateCyberpunkRoll, evaluatePF2eRoll } from '../utils/diceRules';
import { getStatBreakdown } from '../utils/cocRules';
import RetroNumberInput from './RetroNumberInput';

export default function CheckRollModal({
  gameSystem = 'coc',
  isOpen,
  onClose,
  targetSkillName = 'Stat Check',
  targetValue = 50,
  onAddDiceLog
}) {
  const [targetInput, setTargetInput] = useState(targetValue);
  const [modifier, setModifier] = useState('normal'); // 'normal', 'bonus1', 'bonus2', 'penalty1', 'penalty2'
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // Sync target value when modal opens or prop changes
  useEffect(() => {
    if (targetValue !== undefined && targetValue !== null) {
      setTargetInput(targetValue);
    }
    setLastResult(null);
    setModifier('normal');
  }, [targetValue, isOpen]);

  // Handle Escape key to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const numericTarget = parseInt(targetInput, 10) || 50;
  const breakdown = getStatBreakdown(numericTarget);

  const executeRoll = () => {
    setIsRolling(true);

    setTimeout(() => {
      let rollData = null;

      if (gameSystem === 'cyberpunk') {
        const evalRes = evaluateCyberpunkRoll(numericTarget, 15);
        rollData = {
          id: `roll-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
          diceType: '1d10 Exploding',
          skillName: targetSkillName || 'Cyberpunk Check',
          targetValue: 15,
          finalRoll: evalRes.total,
          result: evalRes.result
        };
      } else if (gameSystem === 'pf2e') {
        const evalRes = evaluatePF2eRoll(numericTarget, 15);
        rollData = {
          id: `roll-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
          diceType: '1d20 Check',
          skillName: targetSkillName || 'Pathfinder Check',
          targetValue: 15,
          finalRoll: evalRes.total,
          result: evalRes.result
        };
      } else {
        const units = Math.floor(Math.random() * 10);
        let numTensDice = 1;
        if (modifier === 'bonus1' || modifier === 'penalty1') numTensDice = 2;
        if (modifier === 'bonus2' || modifier === 'penalty2') numTensDice = 3;

        const tensRolls = [];
        for (let i = 0; i < numTensDice; i++) {
          tensRolls.push(Math.floor(Math.random() * 10) * 10);
        }

        const possibleTotals = tensRolls.map((tens) => {
          const val = tens + units;
          return val === 0 ? 100 : val;
        });

        let finalRoll = possibleTotals[0];
        if (modifier.startsWith('bonus')) {
          finalRoll = Math.min(...possibleTotals);
        } else if (modifier.startsWith('penalty')) {
          finalRoll = Math.max(...possibleTotals);
        }

        const evalResult = evaluateCoCRoll(finalRoll, numericTarget);

        rollData = {
          id: `roll-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
          diceType: 'd100',
          skillName: targetSkillName || 'Check',
          targetValue: numericTarget,
          finalRoll,
          modifier,
          tensRolls,
          units,
          result: evalResult
        };
      }

      setLastResult(rollData);
      setIsRolling(false);

      if (onAddDiceLog) {
        onAddDiceLog(rollData);
      }
    }, 350);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="check-roll-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#090C0A]/80 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div className="w-full max-w-md dark:bg-[#1C2320] bg-[#EFEAD8] dark:text-[#EBE6DB] text-[#161B18] border-2 dark:border-[#090C0A] border-[#1C201D] rounded-sm p-5 space-y-4 shadow-retro">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-2 dark:border-[#090C0A] border-[#1C201D] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-[#E65A2B] border-2 border-[#090C0A] flex items-center justify-center text-[#F4EFE3] shadow-retro-sm">
              <Dices className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-typewriter font-bold text-[#D99F26] uppercase block">
                CHECK ROLL INITIATED
              </span>
              <h3 id="check-roll-modal-title" className="text-sm font-bold font-display uppercase tracking-wider dark:text-[#F4EFE3] text-[#161B18]">
                {targetSkillName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-sm text-[#5A6861] hover:text-[#E65A2B] hover:bg-[#141816] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Target Breakdown Card */}
        <div className="dark:bg-[#141816] bg-[#FAF6EE] p-3 rounded-sm border-2 dark:border-[#2D3732] border-[#1C201D] space-y-2 text-xs font-typewriter">
          <div className="flex items-center justify-between">
            <span className="font-bold dark:text-[#A8B2AC] text-[#5A6861] uppercase">TARGET SCORE (%):</span>
            <RetroNumberInput
              min={1}
              max={100}
              value={targetInput}
              onChange={(val) => setTargetInput(val)}
              accentColor="ochre"
              className="w-24"
              inputClassName="text-sm font-bold"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1 border-t dark:border-[#2D3732] border-[#1C201D]">
            <div>
              <span className="text-[9px] dark:text-[#A8B2AC] text-[#5A6861] block font-bold">REGULAR</span>
              <strong className="dark:text-[#F4EFE3] text-[#161B18] text-xs">≤ {numericTarget}</strong>
            </div>
            <div>
              <span className="text-[9px] dark:text-[#A8B2AC] text-[#5A6861] block font-bold">HARD (1/2)</span>
              <strong className="text-[#2A6B60] text-xs">≤ {breakdown.hard}</strong>
            </div>
            <div>
              <span className="text-[9px] dark:text-[#A8B2AC] text-[#5A6861] block font-bold">EXTREME (1/5)</span>
              <strong className="text-[#D99F26] text-xs">≤ {breakdown.extreme}</strong>
            </div>
          </div>
        </div>

        {/* Bonus / Penalty Dice Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-typewriter font-bold dark:text-[#A8B2AC] text-[#5A6861] uppercase block">
            DICE MODIFIER (BONUS / PENALTY)
          </label>
          <div className="grid grid-cols-5 gap-1 font-typewriter text-[10px] font-bold">
            {[
              { id: 'penalty2', label: '-2D', title: '-2 Penalty Dice' },
              { id: 'penalty1', label: '-1D', title: '-1 Penalty Die' },
              { id: 'normal', label: 'NORMAL', title: 'Normal Roll' },
              { id: 'bonus1', label: '+1D', title: '+1 Bonus Die' },
              { id: 'bonus2', label: '+2D', title: '+2 Bonus Dice' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setModifier(opt.id)}
                title={opt.title}
                className={`py-1.5 rounded-sm border-2 transition-all ${
                  modifier === opt.id
                    ? opt.id.startsWith('bonus')
                      ? 'bg-[#2A6B60] text-[#F4EFE3] border-[#090C0A] shadow-retro-sm'
                      : opt.id.startsWith('penalty')
                      ? 'bg-[#E65A2B] text-[#F4EFE3] border-[#090C0A] shadow-retro-sm'
                      : 'bg-[#D99F26] text-[#141816] border-[#090C0A] shadow-retro-sm'
                    : 'dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#A8B2AC] text-[#5A6861] dark:border-[#2D3732] border-[#1C201D] hover:border-[#E65A2B]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result Box or Roll Button */}
        {lastResult ? (
          <div className="dark:bg-[#141816] bg-[#FAF6EE] p-4 rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] text-center space-y-2 shadow-retro-sm animate-scale-up">
            <div className="text-[10px] font-typewriter font-bold dark:text-[#A8B2AC] text-[#5A6861] uppercase tracking-widest">
              PERCENTILE DIE RESULT
            </div>
            
            <div className="text-4xl font-display font-extrabold text-[#D99F26] flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-[#E65A2B] stroke-[2.5]" />
              <span>{lastResult.finalRoll}</span>
              <span className="text-xs font-typewriter dark:text-[#A8B2AC] text-[#5A6861]">/ 100</span>
            </div>

            <div>
              <span className={`inline-block px-3 py-1 rounded-sm text-xs font-display uppercase font-bold tracking-wider border-2 shadow-retro-sm ${lastResult.result.color}`}>
                {lastResult.result.label}
              </span>
            </div>

            {lastResult.tensRolls && lastResult.tensRolls.length > 1 && (
              <div className="text-[10px] font-typewriter dark:text-[#A8B2AC] text-[#5A6861] pt-1">
                Tens Dice: [{lastResult.tensRolls.join(', ')}] | Units: {lastResult.units}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t dark:border-[#2D3732] border-[#1C201D]">
              <button
                type="button"
                onClick={executeRoll}
                className="flex-1 py-2 bg-[#E65A2B] text-[#F4EFE3] font-display font-bold text-xs uppercase rounded-sm border-2 border-[#090C0A] btn-retro shadow-retro-orange flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Roll Again</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 dark:bg-[#252E2A] bg-[#FAF6EE] dark:text-[#F4EFE3] text-[#161B18] font-display font-bold text-xs uppercase rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] btn-retro"
              >
                <span>Done / Close</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={executeRoll}
            disabled={isRolling}
            className="w-full py-3 bg-[#E65A2B] text-[#F4EFE3] font-display font-bold text-sm uppercase tracking-wider rounded-sm border-2 border-[#090C0A] shadow-retro-orange flex items-center justify-center gap-2 btn-retro disabled:opacity-50"
          >
            <Dices className={`w-5 h-5 stroke-[2.5] ${isRolling ? 'animate-spin' : ''}`} />
            <span>{isRolling ? 'ROLLING DICE...' : `ROLL FOR ${targetSkillName.toUpperCase()}`}</span>
          </button>
        )}
      </div>
    </div>
  );
}

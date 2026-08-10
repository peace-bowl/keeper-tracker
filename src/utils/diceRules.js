// Multi-System Dice Rules Engine: Call of Cthulhu 7e, Cyberpunk RED & Pathfinder 2e

import { evaluateCoCRoll } from './cocRules';

export { evaluateCoCRoll };

/**
 * Cyberpunk RED Exploding 1D10 Check Evaluation
 * In Cyberpunk RED:
 * - 1D10 + STAT + SKILL vs Target DV (Difficulty Value)
 * - Critical Success (Natural 10): Roll another 1d10 and ADD to the total.
 * - Critical Failure (Natural 1): Roll another 1d10 and SUBTRACT from the total.
 */
export function evaluateCyberpunkRoll(statPlusSkill = 10, dv = 15, customRoll = null) {
  const baseVal = parseInt(statPlusSkill, 10) || 0;
  const targetDv = parseInt(dv, 10) || 15;

  const d10Base = customRoll !== null ? customRoll : Math.floor(Math.random() * 10) + 1;
  let explodeVal = 0;
  let isCritSuccess = false;
  let isCritFailure = false;

  if (d10Base === 10) {
    isCritSuccess = true;
    explodeVal = Math.floor(Math.random() * 10) + 1;
  } else if (d10Base === 1) {
    isCritFailure = true;
    explodeVal = Math.floor(Math.random() * 10) + 1;
  }

  const effectiveRoll = isCritSuccess
    ? 10 + explodeVal
    : isCritFailure
    ? 1 - explodeVal
    : d10Base;

  const total = effectiveRoll + baseVal;
  const isSuccess = total >= targetDv;

  let badge = 'SUCCESS';
  let label = `BEAT DV ${targetDv} (${total})`;
  let color = 'text-[#ffee00] border-[#ffee00] bg-[#1a1c0d]';

  if (isCritSuccess) {
    badge = 'CRITICAL EXPLODE';
    label = `CRIT SUCCESS! Roll: 10 + ${explodeVal} + ${baseVal} = ${total} (DV ${targetDv})`;
    color = 'text-[#00f0ff] border-[#00f0ff] bg-[#0d1a1e] shadow-[0_0_10px_rgba(0,240,255,0.4)]';
  } else if (isCritFailure) {
    badge = 'CRITICAL FUMBLE';
    label = `CRIT FUMBLE! Roll: 1 - ${explodeVal} + ${baseVal} = ${total} (DV ${targetDv})`;
    color = 'text-[#ff0055] border-[#ff0055] bg-[#1e0d14] shadow-[0_0_10px_rgba(255,0,85,0.4)]';
  } else if (!isSuccess) {
    badge = 'FAILED DV';
    label = `FAILED DV ${targetDv} (${total} vs ${targetDv})`;
    color = 'text-[#8b949e] border-[#30363d] bg-[#161b22]';
  }

  return {
    d10Base,
    explodeVal,
    isCritSuccess,
    isCritFailure,
    effectiveRoll,
    total,
    targetDv,
    isSuccess,
    result: { level: badge, label, color, badge }
  };
}

/**
 * Pathfinder 2e 1D20 Check Evaluation with 4 Degrees of Success
 * - Nat 20 upgrades outcome by 1 degree.
 * - Nat 1 downgrades outcome by 1 degree.
 * - Total >= DC + 10: Critical Success
 * - Total >= DC: Success
 * - Total < DC: Failure
 * - Total <= DC - 10: Critical Failure
 */
export function evaluatePF2eRoll(mod = 5, dc = 15, customRoll = null) {
  const modifier = parseInt(mod, 10) || 0;
  const targetDc = parseInt(dc, 10) || 15;

  const d20 = customRoll !== null ? customRoll : Math.floor(Math.random() * 20) + 1;
  const total = d20 + modifier;

  let baseDegree = 2; // 4 = Crit Success, 3 = Success, 2 = Failure, 1 = Crit Failure
  if (total >= targetDc + 10) baseDegree = 4;
  else if (total >= targetDc) baseDegree = 3;
  else if (total <= targetDc - 10) baseDegree = 1;
  else baseDegree = 2;

  // Natural 20 upgrades by 1, Natural 1 downgrades by 1
  let finalDegree = baseDegree;
  if (d20 === 20) finalDegree = Math.min(4, baseDegree + 1);
  if (d20 === 1) finalDegree = Math.max(1, baseDegree - 1);

  let badge = 'SUCCESS';
  let label = 'Success';
  let color = 'text-blue-400 border-blue-500 bg-blue-950/40';

  if (finalDegree === 4) {
    badge = 'CRITICAL SUCCESS';
    label = `CRITICAL SUCCESS! Total: ${total} (Nat ${d20} + ${modifier}) vs DC ${targetDc}`;
    color = 'text-[#d4af37] border-[#d4af37] bg-[#2a240d] shadow-[0_0_12px_rgba(212,175,55,0.4)]';
  } else if (finalDegree === 3) {
    badge = 'SUCCESS';
    label = `Success! Total: ${total} (Nat ${d20} + ${modifier}) vs DC ${targetDc}`;
    color = 'text-[#60a5fa] border-[#3b82f6] bg-[#0f172a]';
  } else if (finalDegree === 2) {
    badge = 'FAILURE';
    label = `Failure. Total: ${total} (Nat ${d20} + ${modifier}) vs DC ${targetDc}`;
    color = 'text-amber-500/80 border-amber-600/40 bg-amber-950/30';
  } else {
    badge = 'CRITICAL FAILURE';
    label = `CRITICAL FAILURE! Total: ${total} (Nat ${d20} + ${modifier}) vs DC ${targetDc}`;
    color = 'text-rose-500 border-rose-600 bg-rose-950/50 shadow-[0_0_10px_rgba(244,63,94,0.4)]';
  }

  return {
    d20,
    modifier,
    total,
    targetDc,
    finalDegree,
    result: { level: badge, label, color, badge }
  };
}

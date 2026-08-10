// Call of Cthulhu 7th Edition Game Engine & Utility Rules

/**
 * Calculates derived 1/2 (Hard) and 1/5 (Extreme) values.
 */
export function getStatBreakdown(value) {
  const num = parseInt(value, 10) || 0;
  return {
    regular: num,
    hard: Math.floor(num / 2),
    extreme: Math.floor(num / 5),
  };
}

/**
 * Calculates CoC 7e Damage Bonus (DB) and Build based on STR + SIZ.
 */
export function getDamageBonusAndBuild(str, siz) {
  const sum = (parseInt(str, 10) || 0) + (parseInt(siz, 10) || 0);

  if (sum <= 64) return { db: '-2', build: -2 };
  if (sum <= 84) return { db: '-1', build: -1 };
  if (sum <= 124) return { db: '0', build: 0 };
  if (sum <= 164) return { db: '+1D4', build: 1 };
  if (sum <= 204) return { db: '+1D6', build: 2 };
  if (sum <= 284) return { db: '+2D6', build: 3 };
  if (sum <= 364) return { db: '+3D6', build: 4 };

  // For each additional 80 points
  const extra80s = Math.floor((sum - 364) / 80);
  const extraDice = 3 + extra80s + 1;
  const extraBuild = 4 + extra80s + 1;
  return { db: `+${extraDice}D6`, build: extraBuild };
}

/**
 * Calculates Movement Rate (MOV) based on STR, SIZ, DEX, and Age.
 */
export function getMovementRate(str, siz, dex, age = 30) {
  const s = parseInt(str, 10) || 0;
  const z = parseInt(siz, 10) || 0;
  const d = parseInt(dex, 10) || 0;
  const a = parseInt(age, 10) || 30;

  let baseMov = 8;
  if (d < z && s < z) baseMov = 7;
  else if (d > z && s > z) baseMov = 9;
  else baseMov = 8;

  // Age deductions
  if (a >= 80) baseMov -= 5;
  else if (a >= 70) baseMov -= 4;
  else if (a >= 60) baseMov -= 3;
  else if (a >= 50) baseMov -= 2;
  else if (a >= 40) baseMov -= 1;

  return Math.max(1, baseMov);
}

/**
 * Calculates derived Max HP, Max MP, and Major Wound threshold.
 */
export function getDerivedSecondaryStats(con, siz, pow, cthulhuMythos = 0) {
  const c = parseInt(con, 10) || 0;
  const z = parseInt(siz, 10) || 0;
  const p = parseInt(pow, 10) || 0;
  const cm = parseInt(cthulhuMythos, 10) || 0;

  const maxHp = Math.floor((c + z) / 10);
  const maxMp = Math.floor(p / 5);
  const maxSan = Math.max(0, 99 - cm);
  const majorWoundThreshold = Math.floor(maxHp / 2);

  return { maxHp, maxMp, maxSan, majorWoundThreshold };
}

/**
 * Evaluates a d100 roll against a target skill/stat value in CoC 7e.
 */
export function evaluateCoCRoll(roll, targetSkill) {
  const target = parseInt(targetSkill, 10) || 0;
  const hard = Math.floor(target / 2);
  const extreme = Math.floor(target / 5);

  if (roll === 1) {
    return { level: 'CRITICAL', label: 'Critical Success!', color: 'text-amber-400 border-amber-400/50 bg-amber-950/40', badge: 'Critical' };
  }

  const isFumble = (target < 50 && roll >= 96) || (target >= 50 && roll === 100);
  if (isFumble) {
    return { level: 'FUMBLE', label: 'Fumble!', color: 'text-rose-500 border-rose-500/50 bg-rose-950/40', badge: 'Fumble' };
  }

  if (roll <= extreme) {
    return { level: 'EXTREME', label: 'Extreme Success', color: 'text-emerald-400 border-emerald-400/50 bg-emerald-950/40', badge: 'Extreme (1/5)' };
  }

  if (roll <= hard) {
    return { level: 'HARD', label: 'Hard Success', color: 'text-cyan-400 border-cyan-400/50 bg-cyan-950/40', badge: 'Hard (1/2)' };
  }

  if (roll <= target) {
    return { level: 'SUCCESS', label: 'Regular Success', color: 'text-blue-400 border-blue-400/50 bg-blue-950/40', badge: 'Regular' };
  }

  return { level: 'FAILURE', label: 'Failure', color: 'text-slate-400 border-slate-700 bg-slate-900/60', badge: 'Failure' };
}

/**
 * Calculates Moon Phase and days until next full moon based on date object.
 */
export function getMoonPhaseDetails(dateObj) {
  // Reference full moon date: Jan 25, 2024
  const refFullMoon = new Date('1926-10-22T00:00:00Z').getTime();
  const lunarCycle = 29.53058770576 * 86400 * 1000;
  const timeDiff = dateObj.getTime() - refFullMoon;
  
  let cyclePos = (timeDiff % lunarCycle + lunarCycle) % lunarCycle;
  const daysInCycle = cyclePos / (86400 * 1000);
  
  let phaseName = 'New Moon';
  let iconName = 'Moon';

  if (daysInCycle < 1.84566) { phaseName = 'New Moon'; }
  else if (daysInCycle < 5.53699) { phaseName = 'Waxing Crescent'; }
  else if (daysInCycle < 9.22831) { phaseName = 'First Quarter'; }
  else if (daysInCycle < 12.91963) { phaseName = 'Waxing Gibbous'; }
  else if (daysInCycle < 16.61096) { phaseName = 'Full Moon'; }
  else if (daysInCycle < 20.30228) { phaseName = 'Waning Gibbous'; }
  else if (daysInCycle < 23.99361) { phaseName = 'Third Quarter'; }
  else if (daysInCycle < 27.68493) { phaseName = 'Waning Crescent'; }

  // Calculate days until next full moon (cycle day ~14.76)
  const fullMoonDay = 14.765;
  let daysUntilFullMoon = Math.round((fullMoonDay - daysInCycle + 29.53) % 29.53);
  if (daysUntilFullMoon === 0 && phaseName === 'Full Moon') daysUntilFullMoon = 0;

  return {
    phaseName,
    daysUntilFullMoon,
    isFullMoon: phaseName === 'Full Moon'
  };
}

/**
 * CoC 7e Default Skills Template
 */
export const DEFAULT_COC_SKILLS = [
  { name: 'Accounting', base: 5, checked: false },
  { name: 'Anthropology', base: 1, checked: false },
  { name: 'Appraise', base: 5, checked: false },
  { name: 'Archaeology', base: 1, checked: false },
  { name: 'Art / Craft', base: 5, checked: false },
  { name: 'Charm', base: 15, checked: false },
  { name: 'Climb', base: 20, checked: false },
  { name: 'Credit Rating', base: 0, checked: false },
  { name: 'Cthulhu Mythos', base: 0, checked: false },
  { name: 'Disguise', base: 5, checked: false },
  { name: 'Dodge', base: 25, checked: false }, // Base DEX / 2
  { name: 'Drive Auto', base: 20, checked: false },
  { name: 'Electrical Repair', base: 10, checked: false },
  { name: 'Fast Talk', base: 15, checked: false },
  { name: 'Fighting (Brawl)', base: 25, checked: false },
  { name: 'Fighting (Handgun)', base: 20, checked: false },
  { name: 'Fighting (Rifle/Shotgun)', base: 25, checked: false },
  { name: 'First Aid', base: 30, checked: false },
  { name: 'History', base: 5, checked: false },
  { name: 'Intimidate', base: 15, checked: false },
  { name: 'Jump', base: 20, checked: false },
  { name: 'Language (Own)', base: 80, checked: false },
  { name: 'Language (Other)', base: 1, checked: false },
  { name: 'Law', base: 5, checked: false },
  { name: 'Library Use', base: 20, checked: false },
  { name: 'Listen', base: 20, checked: false },
  { name: 'Locksmith', base: 1, checked: false },
  { name: 'Mechanical Repair', base: 10, checked: false },
  { name: 'Medicine', base: 1, checked: false },
  { name: 'Natural World', base: 10, checked: false },
  { name: 'Navigate', base: 10, checked: false },
  { name: 'Occult', base: 5, checked: false },
  { name: 'Persuade', base: 10, checked: false },
  { name: 'Psychoanalysis', base: 1, checked: false },
  { name: 'Psychology', base: 10, checked: false },
  { name: 'Ride', base: 5, checked: false },
  { name: 'Science', base: 1, checked: false },
  { name: 'Sleight of Hand', base: 10, checked: false },
  { name: 'Spot Hidden', base: 25, checked: false },
  { name: 'Stealth', base: 20, checked: false },
  { name: 'Survival', base: 10, checked: false },
  { name: 'Swim', base: 20, checked: false },
  { name: 'Track', base: 10, checked: false }
];

import { PDFDocument } from 'pdf-lib';

export async function parsePdfInvestigator(fileOrArrayBuffer) {
  let arrayBuffer;
  if (fileOrArrayBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrArrayBuffer;
  } else if (fileOrArrayBuffer && typeof fileOrArrayBuffer.arrayBuffer === 'function') {
    arrayBuffer = await fileOrArrayBuffer.arrayBuffer();
  } else {
    throw new Error('Invalid file or buffer provided to PDF parser');
  }

  const pdfDoc = await PDFDocument.load(arrayBuffer);
  let form;
  try {
    form = pdfDoc.getForm();
  } catch {
    // If PDF has no AcroForm, throw descriptive error
    throw new Error('This PDF does not contain form fields. Please upload a standard CoC 7e fillable PDF character sheet.');
  }

  const fields = form.getFields();
  if (!fields || fields.length === 0) {
    throw new Error('No fillable fields found in this PDF character sheet.');
  }

  const map = {};
  fields.forEach(field => {
    const name = field.getName();
    let value = '';
    try {
      if (typeof field.getText === 'function') {
        value = field.getText() || '';
      } else if (typeof field.isChecked === 'function') {
        value = field.isChecked() ? 'Checked' : 'Unchecked';
      } else if (typeof field.getSelected === 'function') {
        const sel = field.getSelected();
        value = Array.isArray(sel) ? sel.join(', ') : (sel || '');
      }
    } catch {}
    map[name] = typeof value === 'string' ? value.trim() : value;
  });

  const getVal = (key, fallback = '') => map[key] || fallback;
  const getNum = (key, fallback = 0) => {
    const raw = map[key];
    if (!raw) return fallback;
    const v = parseInt(raw.toString().replace(/[^0-9-]/g, ''), 10);
    return isNaN(v) ? fallback : v;
  };

  const name = getVal('Investigators_Name') || getVal('Name') || getVal('Character Name') || getVal('Investigator') || 'Unnamed Investigator';
  const occupation = getVal('Occupation') || getVal('Prof') || 'Investigator';
  const age = getNum('Age', 30);
  const residence = getVal('Residence') || 'Arkham';
  const birthplace = getVal('Birthplace') || 'Unknown';

  const str = getNum('STR', 50);
  const con = getNum('CON', 50);
  const siz = getNum('SIZ', 50);
  const dex = getNum('DEX', 50);
  const app = getNum('APP', 50);
  const intVal = getNum('INT', 50);
  const pow = getNum('POW', 50);
  const edu = getNum('EDU', 50);

  const startingHp = getNum('StartingHP', Math.floor((con + siz) / 10));
  const currentHp = getNum('CurrentHP', startingHp);

  const startingSanity = getNum('StartingSanity', pow);
  const currentSanity = getNum('CurrentSanity', startingSanity);
  const maxSanity = getNum('MaxSanity', 99);

  const startingMp = getNum('StartingMagic', Math.floor(pow / 5));
  const currentMp = getNum('CurrentMagic', startingMp);

  const currentLuck = getNum('CurrentLuck', 50);

  const skills = [];

  const STANDARD_MAP = {
    Skill_Accounting: 'Accounting',
    Skill_Anthropology: 'Anthropology',
    Skill_Appraise: 'Appraise',
    Skill_Archaeology: 'Archaeology',
    Skill_Charm: 'Charm',
    Skill_Climb: 'Climb',
    Skill_Credit: 'Credit Rating',
    Skill_Cthulhu: 'Cthulhu Mythos',
    Skill_Disguise: 'Disguise',
    Skill_Dodge: 'Dodge',
    Skill_Drive: 'Drive Auto',
    Skill_ElecRepair: 'Electrical Repair',
    Skill_FastTalk: 'Fast Talk',
    Skill_Fighting: 'Fighting (Brawl)',
    Skill_FireArmsHandguns: 'Firearms (Handgun)',
    Skill_FireArmsRifles: 'Firearms (Rifle/Shotgun)',
    Skill_FirstAid: 'First Aid',
    Skill_History: 'History',
    Skill_Intimidate: 'Intimidate',
    Skill_Jump: 'Jump',
    Skill_Law: 'Law',
    Skill_LibraryUse: 'Library Use',
    Skill_Listen: 'Listen',
    Skill_Locksmith: 'Locksmith',
    Skill_MechRepair: 'Mechanical Repair',
    Skill_Medicine: 'Medicine',
    Skill_NaturalWorld: 'Natural World',
    Skill_Navigate: 'Navigate',
    Skill_Occult: 'Occult',
    Skill_Persuade: 'Persuade',
    Skill_Psychoanalysis: 'Psychoanalysis',
    Skill_Psychology: 'Psychology',
    Skill_Ride: 'Ride',
    Skill_Sleight: 'Sleight of Hand',
    Skill_SpotHidden: 'Spot Hidden',
    Skill_Stealth: 'Stealth',
    Skill_Survival0: 'Survival',
    Skill_Swim: 'Swim',
    Skill_Throw: 'Throw',
    Skill_Track: 'Track',
  };

  Object.entries(STANDARD_MAP).forEach(([key, skillName]) => {
    const val = getNum(key, 0);
    const isChecked = getVal(`${key}_Chk`) === 'Checked';
    if (val > 0) {
      skills.push({ name: skillName, value: val, checked: isChecked });
    }
  });

  // Dynamic / Custom skills
  const dynamicDefs = [
    { key: 'Skill_OwnLanguage', defKey: 'SkillDef_OwnLanguage', defaultName: 'Language (Own)' },
    { key: 'Skill_OtherLanguage0', defKey: 'SkillDef_OtherLanguage0', defaultName: 'Language (Other)' },
    { key: 'Skill_OtherLanguage1', defKey: 'SkillDef_OtherLanguage1', defaultName: 'Language (Other)' },
    { key: 'Skill_OtherLanguage2', defKey: 'SkillDef_OtherLanguage2', defaultName: 'Language (Other)' },
    { key: 'Skill_ArtCraft0', defKey: 'SkillDef_ArtCraft0', defaultName: 'Art / Craft' },
    { key: 'Skill_ArtCraft1', defKey: 'SkillDef_ArtCraft1', defaultName: 'Art / Craft' },
    { key: 'Skill_Fighting0', defKey: 'SkillDef_Fighting0', defaultName: 'Fighting' },
    { key: 'Skill_Fighting1', defKey: 'SkillDef_Fighting1', defaultName: 'Fighting' },
    { key: 'Skill_Pilot0', defKey: 'SkillDef_Pilot0', defaultName: 'Pilot' },
    { key: 'Skill_Science0', defKey: 'SkillDef_Science0', defaultName: 'Science' },
    { key: 'Skill_Science1', defKey: 'SkillDef_Science1', defaultName: 'Science' },
    { key: 'Skill_Custom0', defKey: 'SkillDef_Custom0', defaultName: 'Custom Skill' },
    { key: 'Skill_Custom1', defKey: 'SkillDef_Custom1', defaultName: 'Custom Skill' },
    { key: 'Skill_Custom2', defKey: 'SkillDef_Custom2', defaultName: 'Custom Skill' },
  ];

  dynamicDefs.forEach(({ key, defKey, defaultName }) => {
    const val = getNum(key, 0);
    const customLabel = getVal(defKey);
    if (val > 0 && customLabel && customLabel.toLowerCase() !== 'none') {
      const fullName = defaultName.includes('Language') || defaultName.includes('Art') || defaultName.includes('Science')
        ? `${defaultName.split(' ')[0]} (${customLabel})`
        : customLabel;
      skills.push({ name: fullName, value: val, checked: getVal(`${key}_Chk`) === 'Checked' });
    }
  });

  const weapons = [
    {
      id: `wep-${Date.now()}-1`,
      name: "Unarmed (Brawl)",
      skillName: "Fighting (Brawl)",
      skillValue: getNum('Skill_Fighting', 25),
      damage: "1D3+DB",
      range: "Touch",
      attacksPerRound: "1",
      ammoCurrent: 0,
      ammoMax: 0,
      malfunction: 100
    }
  ];

  const handgunScore = getNum('Skill_FireArmsHandguns', 0);
  if (handgunScore > 20) {
    weapons.push({
      id: `wep-${Date.now()}-2`,
      name: ".38 Revolver",
      skillName: "Firearms (Handgun)",
      skillValue: handgunScore,
      damage: "1D10",
      range: "15 yds",
      attacksPerRound: "1 (2)",
      ammoCurrent: 6,
      ammoMax: 6,
      malfunction: 98
    });
  }

  const rifleScore = getNum('Skill_FireArmsRifles', 0);
  if (rifleScore > 25) {
    weapons.push({
      id: `wep-${Date.now()}-3`,
      name: ".30-06 Rifle",
      skillName: "Firearms (Rifle/Shotgun)",
      skillValue: rifleScore,
      damage: "2D6+4",
      range: "100 yds",
      attacksPerRound: "1",
      ammoCurrent: 5,
      ammoMax: 5,
      malfunction: 100
    });
  }

  const cash = getVal('Cash1') || '$28.00';
  const assets = getVal('Assets1') || '$700.00';
  const spending = getVal('Spending1') || '$10.00';

  const notesList = [];
  if (birthplace) notesList.push(`Birthplace: ${birthplace}`);
  if (residence) notesList.push(`Residence: ${residence}`);
  if (getVal('PersonalDescription')) notesList.push(`Description: ${getVal('PersonalDescription')}`);
  if (getVal('Traits')) notesList.push(`Traits: ${getVal('Traits')}`);
  if (getVal('Ideology/Beliefs')) notesList.push(`Ideology: ${getVal('Ideology/Beliefs')}`);
  notesList.push(`Wealth: Cash (${cash}) | Assets (${assets}) | Spending Level (${spending})`);

  return {
    id: `char-pdf-${Date.now()}`,
    type: 'investigator',
    name,
    occupation,
    age,
    residence,
    birthplace,
    avatar: '',
    stats: { STR: str, CON: con, SIZ: siz, DEX: dex, APP: app, INT: intVal, POW: pow, EDU: edu },
    hp: { current: currentHp, max: startingHp },
    sanity: { current: currentSanity, max: maxSanity, starting: startingSanity, tempThreshold: Math.floor(currentSanity / 5) },
    mp: { current: currentMp, max: startingMp },
    luck: currentLuck,
    conditions: {
      majorWound: getVal('MajorWound_Chk') === 'Checked',
      unconscious: getVal('Unconscious_Chk') === 'Checked',
      dying: getVal('Dying_Chk') === 'Checked',
      tempInsane: getVal('TempInsanity_Chk') === 'Checked',
      indefinitelyInsane: getVal('IndefInsanity_Chk') === 'Checked'
    },
    skills,
    weapons,
    notes: notesList.join('\n'),
    inventory: `Personal Belongings, Travel Wallet (${cash})`
  };
}

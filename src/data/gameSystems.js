// Game Systems Registry & Default Campaign Configurations

export const GAME_SYSTEMS = {
  coc: {
    id: 'coc',
    name: 'Call of Cthulhu',
    version: '7th Edition',
    subtitle: '1920s Eldritch Horror & Mystery',
    badge: 'CLASSIFIED',
    roleLabels: {
      gm: "Keeper",
      player: "Investigator",
      gmSanctum: "Keeper's Sanctum",
      playerDossier: "Investigator Dossier"
    },
    terms: {
      playerTitle: "Investigator",
      playerPlural: "Investigators",
      dossierTitle: "Dossier",
      dossiersPlural: "Dossiers",
      allDossiers: "ALL DOSSIERS",
      purgeDossier: "Purge Dossier",
      newDossier: "New Dossier",
      noDossierSelected: "No Investigator Dossier Selected.",
      searchArchives: "Search dossier archives...",
      vitalStatus: "VITAL STATUS",
      sanityMeter: "SANITY (SAN)",
      magicMeter: "MAGIC (MP)",
      luckMeter: "LUCK STAT",
      skillsTab: "INVESTIGATOR SKILLS",
      notesTab: "FIELD NOTES & GEAR",
      backstoryLabel: "Backstory & Case History",
      inventoryLabel: "Gear & Possessions",
      notesPlaceholder: "Investigator background, phobias, manias, encounters...",
      importPdf: "Import PDF Sheet"
    },
    themeClass: 'theme-coc',
    accentColor: '#E65A2B',
    accentAlt: '#D99F26',
    diceType: 'D100',
    timeLabel: 'Arkham Chronometer',
    initiativeLabel: 'DEX Initiative Order',
    features: [
      'D100 Skill Checks with Hard & Extreme Breakdown',
      'Sanity & Major Wounds Condition Tracking',
      'Arkham Chronometer & Real-time Light Timers',
      'DEX-based Combat Initiative with Firearm Readied Boost'
    ],
    sampleCharacters: [
      {
        id: 'char-harvey',
        type: 'investigator',
        name: 'Harvey Walters',
        occupation: 'Journalist & Occultist',
        age: 38,
        stats: { STR: 45, CON: 50, SIZ: 65, DEX: 55, APP: 40, INT: 85, POW: 75, EDU: 80 },
        hp: { current: 11, max: 11 },
        sanity: { current: 65, max: 94, starting: 75 },
        mp: { current: 15, max: 15 },
        luck: 60,
        skills: [
          { name: "Occult", value: 65 },
          { name: "Library Use", value: 75 },
          { name: "Spot Hidden", value: 70 },
          { name: "Handgun", value: 55 }
        ],
        weapons: [{ name: ".38 Revolver", skillValue: 55, damage: "1D10" }]
      }
    ]
  },

  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk RED',
    version: 'Time of the RED (2045)',
    subtitle: 'High-Tech, Low-Life Street Mercenary Dashboard',
    badge: 'NEURAL LINK ACTIVE',
    roleLabels: {
      gm: "Game Master",
      player: "Edgerunner",
      gmSanctum: "GM Net Control",
      playerDossier: "Edgerunner Cyber-Deck"
    },
    terms: {
      playerTitle: "Edgerunner",
      playerPlural: "Edgerunners",
      dossierTitle: "Cyber-Deck",
      dossiersPlural: "Cyber-Decks",
      allDossiers: "ALL CYBER-DECKS",
      purgeDossier: "Purge Cyber-Deck",
      newDossier: "New Cyber-Deck",
      noDossierSelected: "No Edgerunner Cyber-Deck Selected.",
      searchArchives: "Search net runner archives...",
      vitalStatus: "CYBER VITAL STATUS",
      sanityMeter: "HUMANITY (HUM)",
      magicMeter: "NET / CYBERWARE",
      luckMeter: "LUCK STAT",
      skillsTab: "EDGERUNNER SKILLS",
      notesTab: "CYBERWARE & GEAR",
      backstoryLabel: "Street Lifepath & Reputation",
      inventoryLabel: "Cyberware & Armory Loadout",
      notesPlaceholder: "Edgerunner lifepath, cyberware installation notes, street cred...",
      importPdf: "Import Character Sheet"
    },
    themeClass: 'theme-cyberpunk',
    accentColor: '#e60037',
    accentAlt: '#ff2a55',
    diceType: 'D10 Exploding',
    timeLabel: 'Night City Cyber-Clock',
    initiativeLabel: '1d10 + REF + Combat Awareness',
    features: [
      'Exploding D10 Check Engine vs Target DVs (13, 15, 17, 21, 24, 29)',
      'Cyberware Cooldown & Trauma Team Emergency Timers',
      'Armor SP (Head & Body) & Critical Injury Trackers',
      '1d10 + REF + Combat Awareness Initiative Sort'
    ],
    sampleCharacters: [
      {
        id: 'char-v',
        type: 'investigator',
        name: 'Johnny Silverhand (Memory)',
        occupation: 'Rockerboy / Urban Legend',
        age: 34,
        stats: { INT: 7, REF: 9, DEX: 8, TECH: 5, COOL: 10, WILL: 8, LUCK: 7, MOVE: 7, BODY: 7, EMP: 6 },
        hp: { current: 40, max: 40 },
        sanity: { current: 75, max: 100 }, // Humanity
        mp: { current: 10, max: 10 },
        luck: 70,
        cyberware: [
          { name: "Silver Cyberarm", sp: 0, notes: "Pop-up Submachine Gun" },
          { name: "Sandevistan Boost", sp: 0, notes: "+3 Initiative on activation" }
        ],
        armor: { headSp: 11, bodySp: 14 },
        skills: [
          { name: "Handgun", value: 17 },
          { name: "Play Instrument (Guitar)", value: 18 },
          { name: "Persuasion", value: 16 },
          { name: "Evasion", value: 15 }
        ],
        weapons: [{ name: "Malorian Arms 3516", skillValue: 17, damage: "5D6" }]
      },
      {
        id: 'char-rogue',
        type: 'investigator',
        name: 'Rogue Amendiares',
        occupation: 'Solo / Fixer',
        age: 32,
        stats: { INT: 8, REF: 10, DEX: 9, TECH: 6, COOL: 9, WILL: 8, LUCK: 8, MOVE: 8, BODY: 8, EMP: 7 },
        hp: { current: 45, max: 45 },
        sanity: { current: 80, max: 100 },
        mp: { current: 12, max: 12 },
        luck: 80,
        cyberware: [{ name: "Subdermal Armor", sp: 11, notes: "Head & Torso" }],
        armor: { headSp: 11, bodySp: 11 },
        skills: [
          { name: "Autofire", value: 18 },
          { name: "Perception", value: 15 },
          { name: "Tactics", value: 16 }
        ],
        weapons: [{ name: "Militech Assault Rifle", skillValue: 18, damage: "4D6" }]
      }
    ]
  },

  pf2e: {
    id: 'pf2e',
    name: 'Pathfinder 2e',
    version: 'Remastered',
    subtitle: 'Age of Lost Omens Heroic Campaign Tracker',
    badge: 'CHRONICLE RECOGNIZED',
    roleLabels: {
      gm: "Game Master",
      player: "Hero / Adventurer",
      gmSanctum: "Game Master Codex",
      playerDossier: "Hero Chronicle Sheet"
    },
    terms: {
      playerTitle: "Hero",
      playerPlural: "Heroes",
      dossierTitle: "Chronicle",
      dossiersPlural: "Chronicles",
      allDossiers: "ALL CHRONICLES",
      purgeDossier: "Purge Chronicle",
      newDossier: "New Chronicle",
      noDossierSelected: "No Hero Chronicle Selected.",
      searchArchives: "Search hero archives...",
      vitalStatus: "HEROIC CONDITION",
      sanityMeter: "HERO POINTS",
      magicMeter: "FOCUS / SPELL SLOTS",
      luckMeter: "PERCEPTION",
      skillsTab: "HERO SKILLS",
      notesTab: "FEATS & ADVENTURING GEAR",
      backstoryLabel: "Ancestry, Deity & Edicts",
      inventoryLabel: "Magical Equipment & Loot",
      notesPlaceholder: "Hero backstory, deity edicts & anathema, campaign notes...",
      importPdf: "Import Character Sheet"
    },
    themeClass: 'theme-pf2e',
    accentColor: '#d4af37',
    accentAlt: '#3b82f6',
    diceType: 'D20 Degrees of Success',
    timeLabel: 'Golarion Timepiece',
    initiativeLabel: 'Perception / Stealth Check',
    features: [
      'D20 Check Engine with 4 Degrees of Success (Crit Success, Success, Failure, Crit Failure)',
      '3-Action Economy (◆ ◆ ◆) Interactive Combat Action Tracker',
      'Hero Points, AC, Saving Throws (Fortitude, Reflex, Will) & Temp HP',
      'Exploration, Spell Duration & Condition Duration Timers'
    ],
    sampleCharacters: [
      {
        id: 'char-valeros',
        type: 'investigator',
        name: 'Valeros',
        occupation: 'Fighter (Human)',
        age: 28,
        stats: { STR: 18, DEX: 14, CON: 16, INT: 10, WIS: 12, CHA: 10 },
        hp: { current: 28, max: 28, temp: 0 },
        sanity: { current: 1, max: 3 }, // Hero Points
        mp: { current: 0, max: 0 },
        ac: 19,
        saves: { fort: 8, ref: 7, will: 5 },
        skills: [
          { name: "Athletics", value: 7 },
          { name: "Perception", value: 6 },
          { name: "Intimidation", value: 3 }
        ],
        weapons: [
          { name: "Longsword", skillValue: 9, damage: "1D8+4" },
          { name: "Shield Boss", skillValue: 9, damage: "1D6+4" }
        ]
      },
      {
        id: 'char-ezren',
        type: 'investigator',
        name: 'Ezren',
        occupation: 'Wizard (Human)',
        age: 62,
        stats: { STR: 10, DEX: 14, CON: 12, INT: 18, WIS: 14, CHA: 10 },
        hp: { current: 16, max: 16, temp: 0 },
        sanity: { current: 1, max: 3 },
        mp: { current: 4, max: 4 }, // Spell Slots
        ac: 15,
        saves: { fort: 4, ref: 5, will: 7 },
        skills: [
          { name: "Arcana", value: 9 },
          { name: "Crafting", value: 7 },
          { name: "Occultism", value: 7 }
        ],
        weapons: [{ name: "Staff", skillValue: 5, damage: "1D4" }]
      }
    ]
  }
};

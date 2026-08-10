// Default Campaign Data: "The Arkham Horror - 1926"

export const INITIAL_CAMPAIGN = {
  name: "The Shadow Over Arkham (1926)",
  timeState: {
    // Oct 24, 1926 - 21:30 (9:30 PM)
    isoDate: "1926-10-24T21:30:00",
    season: "Autumn",
  },
  timers: [
    {
      id: "timer-1",
      name: "Harvey's Kerosene Lantern",
      target: "Harvey Walters",
      durationMinutes: 35,
      remainingMinutes: 35,
      unit: "minutes",
      description: "Flickering flame; needs refueling soon or dark horror awaits.",
      category: "Light"
    },
    {
      id: "timer-2",
      name: "Bout of Madness (Paranoia)",
      target: "Dr. Henry Armitage",
      durationMinutes: 10,
      remainingMinutes: 10,
      unit: "rounds",
      description: "Convinced shadows are crawling across the ceiling.",
      category: "Sanity"
    },
    {
      id: "timer-3",
      name: "Cult Invocations Completed",
      target: "Global Scene",
      durationMinutes: 120,
      remainingMinutes: 120,
      unit: "minutes",
      description: "Summoning ritual completes at midnight.",
      category: "Event"
    }
  ],
  characters: [
    {
      id: "char-harvey",
      type: "investigator", // investigator, npc, monster
      name: "Harvey Walters",
      occupation: "Journalist & Occult Researcher",
      age: 38,
      residence: "Arkham, MA",
      birthplace: "Boston, MA",
      avatar: "",
      stats: {
        STR: 45, CON: 50, SIZ: 65, DEX: 55,
        APP: 40, INT: 85, POW: 75, EDU: 80
      },
      hp: { current: 11, max: 11 },
      sanity: { current: 65, max: 94, starting: 75, tempThreshold: 13 },
      mp: { current: 15, max: 15 },
      luck: 60,
      conditions: {
        majorWound: false,
        unconscious: false,
        dying: false,
        tempInsane: false,
        indefinitelyInsane: false
      },
      skills: [
        { name: "Accounting", value: 10, checked: false },
        { name: "Archaeology", value: 40, checked: true },
        { name: "Brawl", value: 45, checked: false },
        { name: "Credit Rating", value: 35, checked: false },
        { name: "Cthulhu Mythos", value: 5, checked: false },
        { name: "Dodge", value: 30, checked: false },
        { name: "Fast Talk", value: 65, checked: true },
        { name: "Handgun", value: 55, checked: true },
        { name: "History", value: 60, checked: false },
        { name: "Library Use", value: 75, checked: true },
        { name: "Listen", value: 50, checked: false },
        { name: "Occult", value: 65, checked: true },
        { name: "Psychology", value: 55, checked: false },
        { name: "Spot Hidden", value: 70, checked: true },
        { name: "Stealth", value: 40, checked: false }
      ],
      weapons: [
        {
          id: "wep-1",
          name: ".38 Revolver",
          skillName: "Handgun",
          skillValue: 55,
          damage: "1D10",
          range: "15 yds",
          attacksPerRound: "1 (2)",
          ammoCurrent: 6,
          ammoMax: 6,
          malfunction: 98
        },
        {
          id: "wep-2",
          name: "Brass Knuckles",
          skillName: "Brawl",
          skillValue: 45,
          damage: "1D3+DB",
          range: "Touch",
          attacksPerRound: "1",
          ammoCurrent: 0,
          ammoMax: 0,
          malfunction: 100
        }
      ],
      notes: "Investigating the strange disappearance of books from the Miskatonic Exhibit. Suffers from slight claustrophobia.",
      inventory: "Press badge, fountain pen, notepad, pocket watch, box of .38 cartridges (24), brass lighter."
    },
    {
      id: "char-armitage",
      type: "investigator",
      name: "Dr. Henry Armitage",
      occupation: "Head Librarian",
      age: 58,
      residence: "Arkham, MA",
      birthplace: "Salem, MA",
      avatar: "",
      stats: {
        STR: 40, CON: 45, SIZ: 60, DEX: 50,
        APP: 50, INT: 90, POW: 80, EDU: 90
      },
      hp: { current: 10, max: 10 },
      sanity: { current: 70, max: 89, starting: 80, tempThreshold: 14 },
      mp: { current: 16, max: 16 },
      luck: 75,
      conditions: {
        majorWound: false,
        unconscious: false,
        dying: false,
        tempInsane: true,
        indefinitelyInsane: false
      },
      skills: [
        { name: "Anthropology", value: 50, checked: false },
        { name: "Archaeology", value: 65, checked: false },
        { name: "Cthulhu Mythos", value: 10, checked: false },
        { name: "History", value: 85, checked: true },
        { name: "Language (Latin)", value: 80, checked: false },
        { name: "Language (Greek)", value: 60, checked: false },
        { name: "Library Use", value: 90, checked: true },
        { name: "Listen", value: 65, checked: false },
        { name: "Occult", value: 75, checked: true },
        { name: "Persuade", value: 60, checked: false },
        { name: "Psychology", value: 70, checked: false },
        { name: "Spot Hidden", value: 50, checked: false }
      ],
      weapons: [
        {
          id: "wep-arm-1",
          name: "Heavy Walking Cane",
          skillName: "Brawl",
          skillValue: 40,
          damage: "1D6+DB",
          range: "Touch",
          attacksPerRound: "1",
          ammoCurrent: 0,
          ammoMax: 0,
          malfunction: 100
        }
      ],
      notes: "Keeper of the Necronomicon restricted vault. Extremely knowledgeable but shaken by recent unnatural events.",
      inventory: "Master key ring to Miskatonic Library, spectacles, silver pocket watch, Latin lexicon."
    },
    {
      id: "char-silas",
      type: "npc",
      name: "Silas Bishop",
      occupation: "Reclusive Antique Dealer",
      age: 44,
      residence: "French Hill, Arkham",
      birthplace: "Innsmouth, MA",
      avatar: "",
      stats: {
        STR: 60, CON: 55, SIZ: 70, DEX: 60,
        APP: 45, INT: 65, POW: 50, EDU: 55
      },
      hp: { current: 12, max: 12 },
      sanity: { current: 40, max: 95, starting: 50, tempThreshold: 8 },
      mp: { current: 10, max: 10 },
      luck: 40,
      conditions: {
        majorWound: false,
        unconscious: false,
        dying: false,
        tempInsane: false,
        indefinitelyInsane: false
      },
      skills: [
        { name: "Appraise", value: 75, checked: false },
        { name: "Brawl", value: 50, checked: false },
        { name: "Fast Talk", value: 60, checked: false },
        { name: "Locksmith", value: 65, checked: false },
        { name: "Occult", value: 45, checked: false },
        { name: "Sleight of Hand", value: 60, checked: false },
        { name: "Stealth", value: 65, checked: false }
      ],
      weapons: [
        {
          id: "wep-silas-1",
          name: "Switchblade",
          skillName: "Brawl",
          skillValue: 50,
          damage: "1D4+DB",
          range: "Touch",
          attacksPerRound: "1",
          ammoCurrent: 0,
          ammoMax: 0,
          malfunction: 100
        }
      ],
      notes: "Has suspicious watery eyes and a skin condition. Willing to trade information on esoteric artifacts for cash.",
      inventory: "Pawn shop receipts, brass keys, odd carved stone talisman."
    },
    {
      id: "char-deep-one",
      type: "monster",
      name: "Hybrid Deep One",
      occupation: "Servitor of Cthulhu",
      age: 110,
      residence: "Devil Reef / Arkham Tunnels",
      birthplace: "Innsmouth",
      avatar: "",
      stats: {
        STR: 75, CON: 80, SIZ: 85, DEX: 60,
        APP: 15, INT: 50, POW: 65, EDU: 30
      },
      hp: { current: 16, max: 16 },
      sanity: { current: 0, max: 0, starting: 0, tempThreshold: 0 },
      mp: { current: 13, max: 13 },
      luck: 30,
      conditions: {
        majorWound: false,
        unconscious: false,
        dying: false,
        tempInsane: false,
        indefinitelyInsane: false
      },
      skills: [
        { name: "Brawl", value: 55, checked: false },
        { name: "Listen", value: 60, checked: false },
        { name: "Spot Hidden", value: 50, checked: false },
        { name: "Stealth", value: 55, checked: false },
        { name: "Swim", value: 90, checked: false }
      ],
      weapons: [
        {
          id: "wep-deep-1",
          name: "Vicious Claws",
          skillName: "Brawl",
          skillValue: 55,
          damage: "1D6+DB",
          range: "Touch",
          attacksPerRound: "1",
          ammoCurrent: 0,
          ammoMax: 0,
          malfunction: 100
        },
        {
          id: "wep-deep-2",
          name: "Barbed Gaff Hook",
          skillName: "Brawl",
          skillValue: 50,
          damage: "1D8+DB",
          range: "Touch",
          attacksPerRound: "1",
          ammoCurrent: 0,
          ammoMax: 0,
          malfunction: 100
        }
      ],
      notes: "Armor: 1-point scaly skin. Sanity Loss: 0/1D6 Sanity to behold its abhorrent piscine form.",
      inventory: "Strange golden tiara with non-Euclidean scrollwork."
    }
  ],
  combat: {
    round: 1,
    activeTurnIndex: 0,
    combatants: [
      {
        id: "cmb-1",
        characterId: "char-harvey",
        name: "Harvey Walters",
        type: "investigator",
        dex: 55,
        readyingFirearm: true, // +50 DEX boost toggle for CoC firearm readied state (eff. DEX 105)
        hpCurrent: 11,
        hpMax: 11,
        sanityCurrent: 65,
        sanityMax: 94,
        status: {
          fightingBack: false,
          dodging: false,
          outOfAmmo: false,
          majorWound: false,
          unconscious: false
        }
      },
      {
        id: "cmb-2",
        characterId: "char-deep-one",
        name: "Hybrid Deep One",
        type: "monster",
        dex: 60,
        readyingFirearm: false,
        hpCurrent: 16,
        hpMax: 16,
        sanityCurrent: 0,
        sanityMax: 0,
        status: {
          fightingBack: true,
          dodging: false,
          outOfAmmo: false,
          majorWound: false,
          unconscious: false
        }
      },
      {
        id: "cmb-3",
        characterId: null, // Ad-hoc minion entry
        name: "Cultist Thrall #1",
        type: "npc",
        dex: 50,
        readyingFirearm: false,
        hpCurrent: 9,
        hpMax: 9,
        sanityCurrent: 30,
        sanityMax: 50,
        status: {
          fightingBack: false,
          dodging: false,
          outOfAmmo: false,
          majorWound: false,
          unconscious: false
        }
      }
    ]
  }
};

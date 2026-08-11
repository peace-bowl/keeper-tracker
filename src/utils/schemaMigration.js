import { INITIAL_CAMPAIGN } from '../data/defaultCampaign';

export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Migrates a raw loaded campaign object to the latest schema version.
 * Handles missing fields, shape normalizations, and version upgrades.
 */
export function migrateCampaignSchema(rawCampaign) {
  if (!rawCampaign || typeof rawCampaign !== 'object') {
    throw new Error('Saved data is not a valid object');
  }

  const campaign = { ...rawCampaign };

  // Determine current version (0 if missing)
  const loadedVersion = typeof campaign.schemaVersion === 'number' ? campaign.schemaVersion : 0;

  // Migration pipeline
  if (loadedVersion < 1) {
    // Migration v0 -> v1: Ensure schemaVersion and all required baseline structures exist
    campaign.schemaVersion = 1;
    campaign.name = campaign.name || INITIAL_CAMPAIGN.name;
    campaign.characters = Array.isArray(campaign.characters) ? campaign.characters : [];
    campaign.timeState = campaign.timeState || { ...INITIAL_CAMPAIGN.timeState };
    campaign.timers = Array.isArray(campaign.timers) ? campaign.timers : [];
    campaign.combat = campaign.combat || { round: 1, activeTurnIndex: 0, combatants: [] };
    if (!Array.isArray(campaign.combat.combatants)) {
      campaign.combat.combatants = [];
    }
  }

  // Ensure current schema version is always set on returned object
  campaign.schemaVersion = CURRENT_SCHEMA_VERSION;
  return campaign;
}

/**
 * Safely loads and migrates campaign data from localStorage.
 * Returns { campaign, warningMessage }
 */
export function loadAndMigrateCampaign(storageKey, defaultCampaign) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return {
        campaign: { ...defaultCampaign, schemaVersion: CURRENT_SCHEMA_VERSION },
        warningMessage: null
      };
    }

    const parsed = JSON.parse(raw);
    const migrated = migrateCampaignSchema(parsed);
    return { campaign: migrated, warningMessage: null };
  } catch (err) {
    console.error('Failed to parse or migrate saved campaign state:', err);
    return {
      campaign: { ...defaultCampaign, schemaVersion: CURRENT_SCHEMA_VERSION },
      warningMessage: `Notice: Saved campaign data was corrupted or incompatible (${err.message}). Default starter campaign has been loaded.`
    };
  }
}

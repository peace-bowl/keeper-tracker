import React from 'react';
import { WifiOff, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * SyncIndicator — ambient status pill shown in the Header.
 * Accepts the syncStatus string from useFirebaseSync.
 *
 * syncStatus values:
 *   'unconfigured' — Firebase not set up yet
 *   'connecting'   — establishing first connection
 *   'synced'       — last write confirmed
 *   'saving'       — write in flight
 *   'error'        — connection or write failure
 */
export default function SyncIndicator({ syncStatus, onClick }) {
  const configs = {
    unconfigured: {
      icon: <WifiOff className="w-3.5 h-3.5" />,
      label: 'Offline',
      className: 'text-[#A8B2AC] dark:text-[#5A6861]',
      dotClass: 'bg-[#5A6861]',
    },
    connecting: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      label: 'Connecting',
      className: 'text-[#D99F26]',
      dotClass: 'bg-[#D99F26] animate-pulse',
    },
    synced: {
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: 'Synced',
      className: 'text-[#2A6B60]',
      dotClass: 'bg-[#2A6B60]',
    },
    saving: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      label: 'Saving…',
      className: 'text-[#D99F26]',
      dotClass: 'bg-[#D99F26] animate-pulse',
    },
    error: {
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      label: 'Sync Error',
      className: 'text-[#E65A2B]',
      dotClass: 'bg-[#E65A2B]',
    },
  };

  const cfg = configs[syncStatus] ?? configs.unconfigured;

  return (
    <button
      onClick={onClick}
      aria-label={`Sync status: ${cfg.label}. Click to manage sync settings.`}
      title={`Sync: ${cfg.label}`}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-display uppercase font-bold tracking-wider dark:bg-[#252E2A] bg-[#FAF6EE] dark:border-[#090C0A] border-[#1C201D] border-2 btn-retro transition-colors ${cfg.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dotClass}`} />
      {cfg.icon}
      <span className="hidden sm:inline">{cfg.label}</span>
    </button>
  );
}

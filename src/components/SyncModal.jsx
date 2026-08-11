import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, RefreshCw, Wifi, WifiOff, Info } from 'lucide-react';
import { generateRoomCode } from '../utils/useFirebaseSync';
import { FIREBASE_CONFIGURED } from '../firebase';

/**
 * SyncModal — lets the Keeper view/copy their room code, enter a different one,
 * or generate a fresh one. Triggered from the sync status button in the Header.
 */
export default function SyncModal({ isOpen, onClose, roomCode, onSetRoomCode, syncStatus }) {
  const [inputCode, setInputCode] = useState(roomCode);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Sync input when external roomCode changes
  useEffect(() => {
    setInputCode(roomCode);
  }, [roomCode]);

  // Focus trap + Escape key
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const modal = document.getElementById('sync-modal');
        if (!modal) return;
        const focusable = modal.querySelectorAll(
          'button, input, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      // fallback — select the input
      inputRef.current?.select();
    }
  };

  const handleJoin = () => {
    const cleaned = inputCode.toUpperCase().trim();
    if (cleaned.length === 6) {
      onSetRoomCode(cleaned);
    }
  };

  const handleGenerateNew = () => {
    const code = generateRoomCode();
    setInputCode(code);
    onSetRoomCode(code);
  };

  const statusLabels = {
    unconfigured: 'Firebase not configured — add your .env.local keys to enable sync.',
    connecting: 'Connecting to Firestore…',
    synced: 'Live — campaign is synced.',
    saving: 'Saving to cloud…',
    error: 'Sync error — check console for details.',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sync-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        id="sync-modal"
        className="relative z-10 w-full max-w-md dark:bg-[#1A201C] bg-[#F5F1E6] border-2 dark:border-[#2D3732] border-[#1C201D] shadow-retro rounded-sm flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 dark:border-[#2D3732] border-[#1C201D]">
          <div className="flex items-center gap-2">
            {FIREBASE_CONFIGURED
              ? <Wifi className="w-4 h-4 text-[#2A6B60]" />
              : <WifiOff className="w-4 h-4 text-[#5A6861]" />
            }
            <h2 id="sync-modal-title" className="font-display font-extrabold uppercase tracking-wider text-sm dark:text-[#F4EFE3] text-[#161B18]">
              Live Sync Settings
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close sync settings"
            className="w-7 h-7 flex items-center justify-center rounded-sm dark:bg-[#252E2A] bg-[#EBE4D4] dark:border-[#090C0A] border-[#1C201D] border-2 btn-retro dark:text-[#A8B2AC] text-[#5A6861]"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Status Banner */}
          <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded-sm border-2 text-xs font-typewriter ${
            syncStatus === 'synced'
              ? 'dark:border-[#2A6B60]/60 border-[#2A6B60] dark:bg-[#2A6B60]/10 bg-[#2A6B60]/5 text-[#2A6B60]'
              : syncStatus === 'error' || syncStatus === 'unconfigured'
              ? 'dark:border-[#E65A2B]/40 border-[#E65A2B] dark:bg-[#E65A2B]/10 bg-[#E65A2B]/5 dark:text-[#E65A2B] text-[#B34020]'
              : 'dark:border-[#D99F26]/40 border-[#D99F26] dark:bg-[#D99F26]/10 bg-[#D99F26]/5 text-[#D99F26]'
          }`}>
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{statusLabels[syncStatus] ?? statusLabels.unconfigured}</span>
          </div>

          {/* Room Code */}
          <div className="space-y-2">
            <label className="block text-xs font-display uppercase font-bold tracking-wider dark:text-[#A8B2AC] text-[#5A6861]">
              Campaign Room Code
            </label>
            <p className="text-xs font-typewriter dark:text-[#5A6861] text-[#8A9490]">
              Share this 6-character code with your players so their Investigator views connect to your campaign.
            </p>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
                maxLength={6}
                placeholder="ABCD12"
                className="flex-1 px-3 py-2 font-typewriter text-lg tracking-[0.25em] uppercase font-bold text-center dark:bg-[#252E2A] bg-[#EBE4D4] dark:border-[#090C0A] border-[#1C201D] border-2 rounded-sm dark:text-[#D99F26] text-[#E65A2B] focus:outline-none focus:ring-2 focus:ring-[#2A6B60]/60"
                aria-label="Campaign room code"
              />
              <button
                onClick={handleCopy}
                aria-label={copied ? 'Copied!' : 'Copy room code to clipboard'}
                title={copied ? 'Copied!' : 'Copy to clipboard'}
                className="px-3 py-2 dark:bg-[#252E2A] bg-[#EBE4D4] dark:border-[#090C0A] border-[#1C201D] border-2 rounded-sm btn-retro dark:text-[#D99F26] text-[#E65A2B] flex items-center gap-1.5 text-xs font-display uppercase font-bold tracking-wider"
              >
                {copied
                  ? <><Check className="w-3.5 h-3.5 stroke-[2.5]" /><span className="hidden sm:inline">Copied!</span></>
                  : <><Copy className="w-3.5 h-3.5 stroke-[2.5]" /><span className="hidden sm:inline">Copy</span></>
                }
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleJoin}
              disabled={inputCode.trim().length !== 6}
              className="w-full px-4 py-2.5 bg-[#2A6B60] text-[#F4EFE3] font-display uppercase font-bold text-xs tracking-wider rounded-sm border-2 border-[#090C0A] btn-retro shadow-retro-sm disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Connect to this room code"
            >
              Connect to This Room
            </button>
            <button
              onClick={handleGenerateNew}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 dark:bg-[#252E2A] bg-[#EBE4D4] dark:text-[#A8B2AC] text-[#5A6861] font-display uppercase font-bold text-xs tracking-wider rounded-sm border-2 dark:border-[#2D3732] border-[#1C201D] btn-retro"
              aria-label="Generate a new random room code"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
              Generate New Room
            </button>
          </div>

          {/* Firebase setup hint */}
          {!FIREBASE_CONFIGURED && (
            <div className="px-3 py-2.5 rounded-sm border-2 dark:border-[#2D3732] border-[#C5BCA8] dark:bg-[#252E2A]/50 bg-[#EBE4D4]/80">
              <p className="text-xs font-typewriter dark:text-[#A8B2AC] text-[#5A6861] leading-relaxed">
                <strong className="dark:text-[#D99F26] text-[#E65A2B]">Setup needed:</strong>{' '}
                Create a <code className="text-[10px] px-1 dark:bg-[#1A201C] bg-[#F5F1E6] rounded">.env.local</code> file
                in the project root with your Firebase credentials.
                See <code className="text-[10px] px-1 dark:bg-[#1A201C] bg-[#F5F1E6] rounded">src/firebase.js</code> for
                full instructions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

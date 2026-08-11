import React, { useEffect } from 'react';
import { AlertTriangle, Check } from 'lucide-react';

export default function TimerAlertModal({ expiredTimers, onDismiss, onExtend }) {
  useEffect(() => {
    if (!expiredTimers || expiredTimers.length === 0) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        expiredTimers.forEach(t => onDismiss(t.id));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expiredTimers, onDismiss]);

  if (!expiredTimers || expiredTimers.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="timer-alert-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="dark:bg-[#1C2320] bg-[#EFEAD8] dark:text-[#EBE6DB] text-[#161B18] border-2 border-[#E65A2B] rounded-sm p-6 w-full max-w-md space-y-4 shadow-retro-orange animate-bounce-short">
        <div className="flex items-center gap-3.5 border-b-2 dark:border-[#090C0A] border-[#1C201D] pb-3">
          <div className="w-10 h-10 rounded-sm bg-[#E65A2B] border-2 border-[#090C0A] flex items-center justify-center text-[#F4EFE3] shrink-0 animate-pulse">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 id="timer-alert-modal-title" className="text-base font-bold text-[#E65A2B] font-display tracking-wider uppercase">
              URGENT WIRE DISPATCH
            </h3>
            <p className="text-xs dark:text-[#A8B2AC] text-[#5A6861] font-typewriter">
              Active surveillance timer expired:
            </p>
          </div>
        </div>

        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 font-typewriter">
          {expiredTimers.map((t) => (
            <div
              key={t.id}
              className="dark:bg-[#141816] bg-[#FAF6EE] border-2 border-[#E65A2B] p-3 rounded-sm flex items-center justify-between gap-3 text-xs shadow-retro-sm"
            >
              <div>
                <div className="font-bold dark:text-[#F4EFE3] text-[#161B18] flex items-center gap-1.5 uppercase">
                  <span>{t.name}</span>
                </div>
                <div className="text-[10px] dark:text-[#A8B2AC] text-[#5A6861] mt-0.5">
                  TARGET: {t.target} • {t.category}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 font-display">
                <button
                  onClick={() => onExtend(t.id, 10)}
                  className="px-2.5 py-1 dark:bg-[#252E2A] bg-[#DCD4C2] hover:bg-[#D99F26] hover:text-[#141816] text-[#D99F26] rounded-sm font-bold text-[10px] border border-[#090C0A] btn-retro"
                  title="Add +10 Mins / Rounds"
                >
                  +10 MIN
                </button>
                <button
                  onClick={() => onDismiss(t.id)}
                  aria-label={`Acknowledge and dismiss ${t.name} timer alert`}
                  className="p-1 bg-[#E65A2B] text-[#F4EFE3] rounded-sm border border-[#090C0A] btn-retro"
                  title="Acknowledge & Dismiss"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t-2 dark:border-[#090C0A] border-[#1C201D]">
          <button
            onClick={() => expiredTimers.forEach(t => onDismiss(t.id))}
            className="px-4 py-2 bg-[#E65A2B] text-[#F4EFE3] font-display font-bold rounded-sm text-xs tracking-wider uppercase border-2 border-[#090C0A] btn-retro shadow-retro-orange"
          >
            Acknowledge All Dispatches
          </button>
        </div>
      </div>
    </div>
  );
}


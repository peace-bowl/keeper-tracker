import React from 'react';

/**
 * MobileNav — sticky bottom navigation bar for mobile page routing.
 * Hidden at lg breakpoint and above (lg:hidden).
 * Each tab: { id: string, label: string, icon: LucideIcon }
 */
export default function MobileNav({ gameSystem = 'coc', tabs, activePage, onChangePage }) {
  const activeColor =
    gameSystem === 'cyberpunk' ? '#00e5ff'
    : gameSystem === 'pf2e'    ? '#c8a84b'
    :                            '#E65A2B';

  const containerClass =
    gameSystem === 'cyberpunk'
      ? 'bg-[#040710] border-[#1a2e4a]'
      : gameSystem === 'pf2e'
      ? 'dark:bg-[#160f04] bg-[#f0e6d0] dark:border-[#3d2e1a] border-[#c8a84b]/50'
      : 'dark:bg-[#1C2320] bg-[#EBE4D4] dark:border-[#090C0A] border-[#1C201D]';

  const fontClass =
    gameSystem === 'cyberpunk' ? 'font-cyber'
    : gameSystem === 'pf2e'   ? 'font-chronicle'
    :                           'font-display';

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 lg:hidden z-50 border-t-2 shadow-[0_-2px_16px_rgba(0,0,0,0.3)] ${containerClass}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Mobile page navigation"
    >
      <div className="flex items-stretch">
        {tabs.map(tab => {
          const isActive = activePage === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChangePage(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 flex-1 min-h-[52px] cursor-pointer transition-colors duration-150 select-none ${fontClass} ${
                isActive ? '' : 'dark:text-[#A8B2AC] text-[#5A6861]'
              }`}
              style={isActive ? { color: activeColor } : {}}
            >
              {/* Active indicator bar at top */}
              {isActive && (
                <span
                  className="absolute top-0 inset-x-4 h-[2px] rounded-full"
                  style={{ backgroundColor: activeColor }}
                />
              )}

              <Icon
                className={`stroke-[2] transition-transform duration-150 ${isActive ? 'scale-110' : 'scale-100'}`}
                style={{ width: '18px', height: '18px' }}
              />

              <span className="text-[9px] font-bold uppercase tracking-wider leading-none mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

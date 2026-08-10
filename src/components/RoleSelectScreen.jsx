import React, { useState } from 'react';
import { BookOpen, User, ChevronRight, Shield, Dices } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function RoleSelectScreen({ onSelectRole }) {
  const [hoveredRole, setHoveredRole] = useState(null);

  return (
    <div className="min-h-screen dark:bg-[#141816] bg-[#F5F1E6] dark:text-[#EBE6DB] text-[#1C201D] flex flex-col items-center justify-center font-sans selection:bg-[#E65A2B] selection:text-white p-6">

      {/* Atmospheric grid background overlay */}
      <div className="fixed inset-0 bg-grid-1960s opacity-60 pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-10">

        {/* Logo & Title */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#E65A2B] opacity-20 blur-2xl scale-125" />
            <img
              src={logoImg}
              alt="CoC GM Desk Logo"
              className="relative w-24 h-24 rounded-full border-4 dark:border-[#2D3732] border-[#1C201D] shadow-retro object-cover"
            />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="stamp-badge border-[#E65A2B] text-[#E65A2B] text-[10px]">CLASSIFIED</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold tracking-widest dark:text-[#F4EFE3] text-[#161B18] uppercase">
              Call of Cthulhu
            </h1>
            <p className="text-[#D99F26] font-typewriter font-bold text-xs uppercase tracking-[0.3em] mt-1">
              7th Edition — Campaign Tracker
            </p>
          </div>

          <p className="text-sm font-typewriter dark:text-[#A8B2AC] text-[#5A6861] max-w-sm leading-relaxed">
            Select your role to begin. The eldritch truths that await you depend on which side of the table you sit.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">

          {/* Keeper Card */}
          <button
            onClick={() => onSelectRole('keeper')}
            onMouseEnter={() => setHoveredRole('keeper')}
            onMouseLeave={() => setHoveredRole(null)}
            className="role-card-keeper group relative text-left p-6 rounded-sm border-2 dark:border-[#2D3732] border-[#1C201D] dark:bg-[#1C2320] bg-[#EBE4D4] hover:border-[#E65A2B] transition-all duration-300 btn-retro"
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#E65A2B] rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-sm bg-[#E65A2B] border-2 border-[#090C0A] flex items-center justify-center text-[#F4EFE3] shadow-retro-sm shrink-0">
                <BookOpen className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-typewriter font-bold text-[#E65A2B] uppercase tracking-widest block mb-0.5">Role</span>
                  <ChevronRight className="w-4 h-4 text-[#E65A2B] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h2 className="text-xl font-display font-extrabold dark:text-[#F4EFE3] text-[#161B18] uppercase tracking-wider">Keeper</h2>
                <p className="text-xs font-typewriter dark:text-[#A8B2AC] text-[#5A6861] mt-2 leading-relaxed">
                  Full Game Master dashboard. Manage all investigators, NPCs, monsters, timers, combat, and the Arkham Chronometer.
                </p>

                <div className="mt-4 space-y-1">
                  {[
                    'All Investigator Dossiers',
                    'NPC & Monster Roster',
                    'Tactical Combat Console',
                    'Chronometer & Timers',
                    'Dice & Roll Log',
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-[10px] font-typewriter dark:text-[#A8B2AC] text-[#5A6861]">
                      <span className="w-1 h-1 rounded-full bg-[#E65A2B] shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 py-2 px-3 rounded-sm bg-[#E65A2B] text-[#F4EFE3] font-display font-bold text-xs uppercase tracking-wider text-center border-2 border-[#090C0A] shadow-retro-orange btn-retro">
              Enter Keeper's Sanctum →
            </div>
          </button>

          {/* Investigator Card */}
          <button
            onClick={() => onSelectRole('investigator')}
            onMouseEnter={() => setHoveredRole('investigator')}
            onMouseLeave={() => setHoveredRole(null)}
            className="role-card-investigator group relative text-left p-6 rounded-sm border-2 dark:border-[#2D3732] border-[#1C201D] dark:bg-[#1C2320] bg-[#EBE4D4] hover:border-[#2A6B60] transition-all duration-300 btn-retro"
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#2A6B60] rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-sm bg-[#2A6B60] border-2 border-[#090C0A] flex items-center justify-center text-[#F4EFE3] shadow-retro-sm shrink-0">
                <User className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-typewriter font-bold text-[#2A6B60] uppercase tracking-widest block mb-0.5">Role</span>
                  <ChevronRight className="w-4 h-4 text-[#2A6B60] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h2 className="text-xl font-display font-extrabold dark:text-[#F4EFE3] text-[#161B18] uppercase tracking-wider">Investigator</h2>
                <p className="text-xs font-typewriter dark:text-[#A8B2AC] text-[#5A6861] mt-2 leading-relaxed">
                  Personal investigator view. Track your own character sheet, stats, skills, weapons, and dice rolls.
                </p>

                <div className="mt-4 space-y-1">
                  {[
                    'My Investigator Dossier',
                    'Characteristics & Skills',
                    'Attacks & Armory',
                    'Field Notes & Gear',
                    'Personal Dice Console',
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-[10px] font-typewriter dark:text-[#A8B2AC] text-[#5A6861]">
                      <span className="w-1 h-1 rounded-full bg-[#2A6B60] shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 py-2 px-3 rounded-sm bg-[#2A6B60] text-[#F4EFE3] font-display font-bold text-xs uppercase tracking-wider text-center border-2 border-[#090C0A] btn-retro">
              Open My Dossier →
            </div>
          </button>
        </div>

        {/* Footer */}
        <p className="text-[10px] font-typewriter dark:text-[#3D4B44] text-[#C8BFB0] uppercase tracking-widest text-center">
          Call of Cthulhu 7th Edition · Chaosium Inc. · Unofficial Digital Aid
        </p>
      </div>
    </div>
  );
}

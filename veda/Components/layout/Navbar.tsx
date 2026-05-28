'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Bell, ChevronDown, Grid, Menu } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === '/';

  const getBreadcrumb = () => {
    if (pathname.includes('/create-assignment')) return 'Create Assignment';
    if (pathname.includes('/assessment/')) return 'Assessment Output';
    return 'Assignments';
  };

  return (
    <>
      {/* ───────────────────────────────────────────────────
          MOBILE HEADER (below lg) — two-row layout
          Row 1: VedaAI branded bar
          Row 2: back arrow + page title
      ─────────────────────────────────────────────────── */}
      <div className="lg:hidden no-print select-none bg-white border-b border-slate-100">

        {/* Row 1 — Branded top bar */}
        <div className="flex items-center justify-between px-4 h-14">
          {/* VedaAI logo + name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-extrabold text-base shrink-0">
              V
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">VedaAI</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Bell with red dot */}
            <button className="relative w-9 h-9 flex items-center justify-center cursor-pointer">
              <Bell className="w-5 h-5 text-slate-700" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Avatar circle */}
            <div className="w-8 h-8 rounded-full bg-[#FFE4D6] border border-orange-100 overflow-hidden flex items-center justify-center shrink-0">
              <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="50" fill="#FFE4D6" />
                <circle cx="24" cy="52" r="11" fill="#E8BCA0" stroke="#334155" strokeWidth="2.5" />
                <circle cx="76" cy="52" r="11" fill="#E8BCA0" stroke="#334155" strokeWidth="2.5" />
                <path d="M28 58C28 42 34 32 50 32C66 32 72 42 72 58C72 74 65 82 50 82C35 82 28 74 28 58Z" fill="#E8BCA0" stroke="#334155" strokeWidth="2.5" />
                <path d="M33 65C33 55 40 50 50 50C60 50 67 55 67 65C67 75 60 80 50 80C40 80 33 75 33 65Z" fill="#D2A488" stroke="#334155" strokeWidth="2.5" />
                <path d="M33 46H67" stroke="#334155" strokeWidth="6" />
                <rect x="34" y="42" width="12" height="9" rx="3" fill="#1E293B" />
                <rect x="54" y="42" width="12" height="9" rx="3" fill="#1E293B" />
                <path d="M32 36C34 26 40 22 50 22C60 22 66 26 68 36H32Z" fill="#78716C" stroke="#334155" strokeWidth="2.5" />
                <rect x="31" y="33" width="38" height="5" rx="1.5" fill="#57534E" />
              </svg>
            </div>

            {/* Hamburger */}
            <button className="w-9 h-9 flex items-center justify-center cursor-pointer">
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Row 2 — Page navigation bar */}
        <div className="relative flex items-center justify-center h-11 border-t border-slate-100 px-4">
          {/* Back button — left absolute */}
          <button
            onClick={() => { if (!isHome) router.back(); else router.push('/'); }}
            disabled={isHome}
            className={`absolute left-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isHome ? 'opacity-30 cursor-default' : 'hover:bg-slate-100 active:bg-slate-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </button>

          {/* Centered page title */}
          <span className="text-sm font-semibold text-slate-800">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────
          DESKTOP NAVBAR (lg+) — original floating pill bar
      ─────────────────────────────────────────────────── */}
      <div className="hidden lg:block px-8 pt-6 pb-2 no-print select-none">
        <div className="bg-white border border-slate-100 rounded-3xl h-18 px-6 flex items-center justify-between shadow-sm">

          {/* Left: Back + Breadcrumb */}
          <div className="flex items-center gap-4.5">
            <button
              onClick={() => { if (!isHome) router.back(); else router.push('/'); }}
              className={`w-9 h-9 rounded-full border border-slate-150 flex items-center justify-center transition-colors shadow-sm/5 cursor-pointer hover:bg-slate-50 ${
                isHome ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : ''
              }`}
              disabled={isHome}
            >
              <ArrowLeft className="w-4.5 h-4.5 text-slate-700" />
            </button>
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-400">{getBreadcrumb()}</span>
            </div>
          </div>

          {/* Right: Bell + User pill */}
          <div className="flex items-center gap-5">
            <button className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 hover:bg-slate-100/70 flex items-center justify-center relative cursor-pointer transition-colors shadow-sm/5">
              <Bell className="w-4.5 h-4.5 text-slate-600" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-orange-500 rounded-full" />
            </button>

            <div className="flex items-center gap-3.5 pl-3 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full hover:bg-slate-100/60 cursor-pointer group transition-colors shadow-sm/5">
              <div className="w-8 h-8 rounded-full bg-[#FFE4D6] border border-orange-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="50" fill="#FFE4D6" />
                  <circle cx="24" cy="52" r="11" fill="#E8BCA0" stroke="#334155" strokeWidth="2.5" />
                  <circle cx="76" cy="52" r="11" fill="#E8BCA0" stroke="#334155" strokeWidth="2.5" />
                  <path d="M28 58C28 42 34 32 50 32C66 32 72 42 72 58C72 74 65 82 50 82C35 82 28 74 28 58Z" fill="#E8BCA0" stroke="#334155" strokeWidth="2.5" />
                  <path d="M33 65C33 55 40 50 50 50C60 50 67 55 67 65C67 75 60 80 50 80C40 80 33 75 33 65Z" fill="#D2A488" stroke="#334155" strokeWidth="2.5" />
                  <path d="M42 66C44 68 47 69 50 69C53 69 56 68 58 66" stroke="#334155" strokeWidth="2.5" />
                  <path d="M33 46H67" stroke="#334155" strokeWidth="6" />
                  <rect x="34" y="42" width="12" height="9" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="2" />
                  <rect x="54" y="42" width="12" height="9" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="2" />
                  <path d="M32 36C34 26 40 22 50 22C60 22 66 26 68 36H32Z" fill="#78716C" stroke="#334155" strokeWidth="2.5" />
                  <rect x="31" y="33" width="38" height="5" rx="1.5" fill="#57534E" stroke="#334155" strokeWidth="2" />
                  <path d="M38 82C40 86 44 89 50 89C56 89 60 86 62 82" stroke="#EAB308" strokeWidth="3.5" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">John Doe</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

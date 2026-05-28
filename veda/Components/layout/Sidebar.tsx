'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAssessmentStore } from '../../store/assessmentStore';
import {
  Home,
  Users,
  ClipboardList,
  GraduationCap,
  History,
  Settings,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { assignments, loadAssignments } = useAssessmentStore();

  // Load assignments on mount to keep the navigation badge count accurate in real-time
  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const assignmentsCount = assignments.length;

  const menuItems = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'My Groups', icon: Users, href: '#' },
    { name: 'Assignments', icon: ClipboardList, href: '/', badge: assignmentsCount },
    { name: 'AI Teacher\'s Toolkit', icon: GraduationCap, href: '#' },
    { name: 'My Library', icon: History, href: '#' },
  ];

  return (
    /* Hidden below lg. On md: icon-only 64px rail. On lg+: full 304px sidebar */
    <aside className="
      hidden lg:flex
      w-[304px]
      bg-white border-r border-slate-100
      flex-col h-screen sticky top-0 shrink-0
      p-6 no-print select-none
    ">

      {/* 1. Brand Logo: VedaAI */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-red-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-sm border border-red-500/10 shrink-0">
          V
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Veda<span className="text-slate-800">AI</span>
        </h1>
      </div>

      {/* 2. "+ Create Assignment" Button */}
      <Link href="/create-assignment" className="w-full mb-8 block">
        <button className="w-full bg-[#2F2F2F] hover:bg-[#1F1F1F] text-white rounded-full py-3.5 px-6 flex items-center justify-center gap-2 font-bold text-sm border-2 border-orange-500 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
          <Sparkles className="w-4 h-4 text-white fill-white shrink-0" />
          <span>Create Assignment</span>
        </button>
      </Link>

      {/* 3. Navigation Links */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isAssignments = item.name === 'Assignments';
          const isActive = isAssignments && pathname === '/';
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="block">
              <span className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all group ${
                isActive
                  ? 'bg-slate-100 text-slate-800'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}>
                <span className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  <span>{item.name}</span>
                </span>

                {item.badge !== undefined && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold leading-none ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 4. Settings & Profile Footer */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <Link href="#" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl text-sm font-bold transition-all group">
          <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
          <span>Settings</span>
        </Link>

        {/* Delhi Public School profile card */}
        <div className="bg-slate-100 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#FFE4D6] border border-orange-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            <svg className="w-11 h-11" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="50" fill="#FFE4D6" />
              <circle cx="24" cy="52" r="11" fill="#E8BCA0" stroke="#334155" strokeWidth="2.5" />
              <circle cx="24" cy="52" r="6" fill="#F1C2A5" />
              <circle cx="76" cy="52" r="11" fill="#E8BCA0" stroke="#334155" strokeWidth="2.5" />
              <circle cx="76" cy="52" r="6" fill="#F1C2A5" />
              <path d="M28 58C28 42 34 32 50 32C66 32 72 42 72 58C72 74 65 82 50 82C35 82 28 74 28 58Z" fill="#E8BCA0" stroke="#334155" strokeWidth="2.5" />
              <path d="M33 65C33 55 40 50 50 50C60 50 67 55 67 65C67 75 60 80 50 80C40 80 33 75 33 65Z" fill="#D2A488" stroke="#334155" strokeWidth="2.5" />
              <path d="M42 66C44 68 47 69 50 69C53 69 56 68 58 66" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M33 46H67" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
              <rect x="34" y="42" width="12" height="9" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="2" />
              <rect x="54" y="42" width="12" height="9" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="2" />
              <line x1="46" y1="46" x2="54" y2="46" stroke="#334155" strokeWidth="3" />
              <path d="M32 36C34 26 40 22 50 22C60 22 66 26 68 36H32Z" fill="#78716C" stroke="#334155" strokeWidth="2.5" />
              <path d="M42 22C46 17 54 17 58 22" fill="#78716C" stroke="#334155" strokeWidth="2.5" />
              <rect x="31" y="33" width="38" height="5" rx="1.5" fill="#57534E" stroke="#334155" strokeWidth="2" />
              <path d="M38 82C40 86 44 89 50 89C56 89 60 86 62 82" stroke="#EAB308" strokeWidth="3.5" strokeLinecap="round" />
              <rect x="47" y="87" width="6" height="7" rx="1" fill="#EAB308" />
            </svg>
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-800 truncate">Delhi Public School</h4>
            <p className="text-xs text-slate-400 font-semibold truncate">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

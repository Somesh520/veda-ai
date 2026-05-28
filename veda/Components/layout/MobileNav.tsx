'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, FolderPlus, Sparkles } from 'lucide-react';

const tabs = [
  { name: 'Home',       icon: LayoutGrid, href: '/'  },
  { name: 'My Groups',  icon: Users,      href: '#'  },
  { name: 'Library',    icon: FolderPlus, href: '#'  },
  { name: 'AI Toolkit', icon: Sparkles,   href: '#'  },
];

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '#') return false;
    return pathname.startsWith(href);
  };

  return (
    /* Floating pill nav — centered above iPhone home indicator */
    <nav
      className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 no-print"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Dark pill container */}
      <div className="flex items-center gap-1 bg-[#1C1C1E] rounded-[32px] px-3 py-2.5 shadow-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex flex-col items-center select-none active:scale-95 transition-transform"
              style={{ minWidth: '72px' }}
            >
              {/* Icon wrapper — white pill when active */}
              <div
                className={`flex items-center justify-center w-11 h-9 rounded-[18px] transition-all duration-200 ${
                  active
                    ? 'bg-white shadow-sm'
                    : 'bg-transparent'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    active ? 'text-slate-900' : 'text-slate-500'
                  }`}
                  strokeWidth={active ? 2.2 : 1.8}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] mt-1 transition-colors duration-200 ${
                  active
                    ? 'font-bold text-white'
                    : 'font-medium text-slate-500'
                }`}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

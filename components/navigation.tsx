'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, LayoutGrid, Shield, BookOpen, MessageSquare } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Gallery', icon: LayoutGrid, exact: true },
    { href: '/papers', label: 'Papers', icon: BookOpen, exact: false },
    { href: '/prompts', label: 'Prompts', icon: MessageSquare, exact: false },
    { href: '/admin', label: 'Admin', icon: Shield, exact: false },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F9FAFB]/90 backdrop-blur-md border-b border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#3A5A40] flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <div>
              <span className="font-semibold text-[#1F2937] text-sm tracking-tight">AI × Mental Health</span>
              <span className="hidden sm:block text-xs text-[#6B7280] leading-none mt-0.5">Knowledge Repository</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#3A5A40] text-white'
                      : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#1F2937]'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Music2, List } from 'lucide-react';

const tabs = [
  { href: '/',        icon: Users,  label: 'Grupos'    },
  { href: '/songs',   icon: Music2, label: 'Canciones' },
  { href: '/setlist', icon: List,   label: 'Setlist'   },
];

export function Navigation() {
  const pathname = usePathname();

  if (pathname.startsWith('/stage')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border/60">
      <div className="mx-auto flex max-w-lg px-2 pb-safe">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/'
            ? pathname === '/'
            : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2 pt-3"
            >
              <div className={`flex flex-col items-center gap-1 rounded-2xl px-5 py-1.5 transition-all duration-200 ${
                isActive
                  ? 'bg-primary/12 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-primary' : ''}`}>
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

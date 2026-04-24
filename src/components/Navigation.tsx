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

  // No mostrar nav en modo escenario
  if (pathname.startsWith('/stage')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-lg">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/'
            ? pathname === '/'
            : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

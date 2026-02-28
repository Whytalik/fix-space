'use client';

import { LogoIcon } from '@nucleus/ui';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const HeaderActions = dynamic(() => import('./header-actions').then((m) => m.HeaderActions), { ssr: false });

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stroke bg-[rgba(15,15,17,0.85)] backdrop-blur-md">
      <div className="flex items-center justify-between px-6 h-15">
        <Link href="/" className="flex items-center gap-2.25">
          <LogoIcon size={28} />
          <span className="font-extrabold text-base tracking-[-0.04em] text-ink">Nucleus</span>
        </Link>
        <HeaderActions />
      </div>
    </header>
  );
}

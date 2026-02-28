'use client';

import { ApiError } from '@/lib/api/client';
import { getMe } from '@/lib/api/user';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const AUTH_PAGES = ['/login', '/register'];

export function HeaderActions() {
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('access_token'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'));

  const isAuthPage = AUTH_PAGES.includes(pathname);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    getMe()
      .then((user) => {
        setUsername(user.username);
        localStorage.setItem('username', user.username);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('username');
          setIsLoggedIn(false);
          setUsername(null);
        }
      });
  }, []);

  if (isAuthPage) return null;

  return (
    <div className="flex items-center gap-2">
      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          <div className="w-7.5 h-7.5 rounded-full bg-accent-muted border border-accent flex items-center justify-center text-xs font-bold text-accent shrink-0">
            {username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <span className="text-[13.5px] font-semibold text-ink-secondary">{username}</span>
        </div>
      ) : (
        <>
          <Link
            href="/login"
            className="px-3.5 py-1.75 rounded-lg text-[13.5px] font-semibold text-ink-secondary border border-stroke transition-all duration-150 hover:text-ink hover:border-ink-muted"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="px-4 py-1.75 rounded-lg text-[13.5px] font-semibold text-white bg-accent shadow-accent transition-colors duration-150 hover:bg-accent-hover"
          >
            Get started
          </Link>
        </>
      )}
    </div>
  );
}

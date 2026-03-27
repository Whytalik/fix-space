"use client";

import "./globals.css";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-dvh gap-6 px-6 text-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-error"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>

          <div className="flex flex-col gap-2">
            <h1 className="text-[clamp(28px,5vw,42px)] font-extrabold tracking-[-0.04em] text-ink leading-none">
              Something went wrong
            </h1>
            <p className="text-sm text-ink-secondary max-w-72 leading-relaxed">
              An unexpected error occurred. You can try again or return to your workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full max-w-50">
            <div className="flex-1 h-px bg-stroke" />
            <span className="text-[11px] font-semibold tracking-widest text-ink-muted uppercase">Error</span>
            <div className="flex-1 h-px bg-stroke" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-lg bg-accent text-white text-[13px] font-semibold transition-colors duration-150 hover:bg-accent-hover cursor-pointer"
            >
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="px-5 py-2.5 rounded-lg bg-elevated border border-stroke text-ink text-[13px] font-semibold transition-colors duration-150 hover:bg-hover"
            >
              Go to workspace
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

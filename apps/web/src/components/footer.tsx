import { LogoIcon } from '@nucleus/ui';

export function Footer() {
  return (
    <footer className="px-6 py-8 border-t border-stroke">
      <div className="flex items-center justify-between gap-4 mx-auto max-w-180">
        <div className="flex items-center gap-2">
          <LogoIcon size={20} />
          <span className="font-bold text-sm tracking-[-0.03em] text-ink">
            Nucleus
          </span>
        </div>

        <span className="text-[13px] text-ink-secondary">
          Diploma project · {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}

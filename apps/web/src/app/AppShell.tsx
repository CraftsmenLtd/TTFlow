import { LogIn } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router';
import { cn } from '../lib/cn';
import { NAV_ITEMS } from './nav';

function BrandMark({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8 shrink-0">
        <circle cx="13" cy="13" r="10" className={onDark ? 'fill-white' : 'fill-brand'} />
        <rect
          x="18.5"
          y="18.5"
          width="4"
          height="11"
          rx="2"
          transform="rotate(-45 20.5 24)"
          className={onDark ? 'fill-white' : 'fill-brand'}
        />
        <circle cx="25" cy="7" r="3.5" className="fill-action" />
      </svg>
      <span className="leading-tight">
        <span className={cn('block font-bold', onDark ? 'text-on-brand' : 'text-brand')}>
          SpinDesk
        </span>
        <span className={cn('block text-xs', onDark ? 'text-on-brand/80' : 'text-ink-secondary')}>
          TT Tournament 2026
        </span>
      </span>
    </Link>
  );
}

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-brand text-on-brand lg:flex">
      <div className="px-6 py-5">
        <BrandMark onDark />
      </div>
      <nav aria-label="Primary" className="flex-1 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-11 items-center gap-3 rounded-lg border-l-4 px-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-lime bg-white/10 font-semibold'
                      : 'border-transparent hover:bg-white/5',
                  )
                }
              >
                <Icon aria-hidden="true" className="size-5" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-white/15 p-3">
        <NavLink
          to="/login"
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-white/5"
        >
          <LogIn aria-hidden="true" className="size-5" />
          Log in
        </NavLink>
      </div>
    </aside>
  );
}

function MobileHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-2 backdrop-blur lg:hidden">
      <BrandMark />
      <Link
        to="/login"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-brand hover:bg-hover"
      >
        <LogIn aria-hidden="true" className="size-5" />
        Log in
      </Link>
    </header>
  );
}

function BottomBar() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.filter((item) => item.inBottomBar).map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-16 flex-col items-center justify-center gap-1 text-xs',
                  isActive
                    ? 'font-semibold text-brand before:absolute before:inset-x-4 before:top-0 before:h-1 before:rounded-b before:bg-brand'
                    : 'text-ink-secondary',
                )
              }
            >
              <Icon aria-hidden="true" className="size-5" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function AppShell() {
  return (
    <div className="min-h-dvh lg:pl-64">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Sidebar />
      <MobileHeader />
      <main
        id="main"
        className="mx-auto w-full max-w-6xl px-4 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pt-8 lg:pb-8"
      >
        <Outlet />
        <footer className="mt-12 border-t border-border pt-4 text-sm text-ink-secondary">
          Internal Craftsmen event ·{' '}
          <Link to="/privacy" className="font-medium text-brand underline-offset-2 hover:underline">
            Privacy
          </Link>
        </footer>
      </main>
      <BottomBar />
    </div>
  );
}

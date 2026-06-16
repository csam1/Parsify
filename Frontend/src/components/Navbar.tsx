import { NavLink } from 'react-router-dom';
import ParsifyIcon from '../assets/ParsifyIcon';
import { NAV_LINKS } from '../constants/navLinks';

export default function Navbar() {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <ParsifyIcon />
          </div>
          <span className="font-semibold text-zinc-900 text-sm tracking-tight">Parsify</span>
        </NavLink>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors no-underline ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

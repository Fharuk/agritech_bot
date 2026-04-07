import { useState } from 'react'
import { Menu, X, Globe } from 'lucide-react'
import { useLang } from '../App'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const { lang, setLang, t, langs } = useLang()

  const links = [
    { href: '#how-it-works', label: t('nav_how_it_works') },
    { href: '#crops',        label: t('nav_crops') },
    { href: '#diagnose',     label: t('nav_diagnose') },
    { href: '#history',      label: t('nav_history') },
    { href: '#library',      label: t('nav_library') },
    { href: '#pricing',      label: 'Pricing' },
  ]

  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#" className="nav-logo">
          <span className="nav-mark">T6</span>
          Terra VI
        </a>

        <ul className="nav-links">
          {links.map(l => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', position: 'relative' }}>

          {/* Language switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangOpen(o => !o)}
              style={{
                background: 'none', border: '1px solid var(--soil-600)', borderRadius: 'var(--r2)',
                color: 'var(--ash-300)', cursor: 'pointer', padding: '6px 10px',
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
                fontFamily: 'var(--font-mono)',
              }}
              title="Change language"
            >
              <Globe size={13} />
              {lang.toUpperCase()}
            </button>

            {langOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 6,
                background: 'var(--soil-800)', border: '1px solid var(--soil-600)',
                borderRadius: 'var(--r3)', overflow: 'hidden', zIndex: 200,
                minWidth: 140, boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              }}>
                {langs.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '10px 14px', background: 'none',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      fontSize: 13, color: lang === l.code ? 'var(--canopy-300)' : 'var(--ash-300)',
                      fontFamily: 'var(--font-sans)',
                      borderLeft: lang === l.code ? '2px solid var(--canopy-400)' : '2px solid transparent',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{l.flag}</span>
                    {l.label}
                    {lang === l.code && (
                      <span style={{ marginLeft: 'auto', color: 'var(--canopy-400)', fontSize: 11 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <a href="#diagnose" className="btn btn-amber" style={{ padding: '8px 18px', fontSize: 12, display: 'none' }}>
            {t('hero_cta')}
          </a>
          <button
            onClick={() => setOpen(!open)}
            style={{ background: 'none', border: 'none', color: 'var(--ash-300)', padding: 4, display: 'none' }}
            className="mobile-menu-btn"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .btn-amber { display: flex !important; }
        }
        .mobile-menu {
          border-top: 1px solid var(--soil-700);
          padding: var(--s4) var(--s5);
          display: flex;
          flex-direction: column;
          gap: var(--s3);
        }
        .mobile-menu a {
          color: var(--ash-300);
          text-decoration: none;
          font-size: 14px;
          padding: var(--s2) 0;
          font-family: var(--font-sans);
        }
        .mobile-menu a:hover { color: var(--ash-100); }
      `}</style>
    </nav>
  )
}

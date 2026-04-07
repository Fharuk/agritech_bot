export function Footer() {
  return (
    <footer style={{
      background: 'var(--obsidian)',
      borderTop: '1px solid var(--glass-edge)',
      padding: 'var(--s8) 0 var(--s6)',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 'var(--s8)', marginBottom: 'var(--s7)' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', marginBottom: 'var(--s4)' }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--em-500), var(--em-400))', borderRadius: 'var(--r2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}>T6</span>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontStyle: 'italic', fontSize: 22, letterSpacing: '-0.02em', color: 'var(--n-50)' }}>
                Terra VI
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--n-500)', maxWidth: 260, lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>
              AI-powered crop disease diagnostics for Nigerian smallholder farmers.
              IITA-vetted treatment plans. Organic-first protocol.
            </p>
            <div style={{ marginTop: 'var(--s5)', display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap' }}>
              {['Tomato', 'Maize', 'Rice', 'Cassava'].map(c => (
                <span key={c} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--n-600)', padding: '2px 8px', border: '1px solid var(--glass-edge)', borderRadius: 99 }}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          {[
            { heading: 'Product', links: ['How it works', 'Crops covered', 'Disease library', 'Diagnostic tool'] },
            { heading: 'Company', links: ['About', 'Research', 'Data sources', 'Contact'] },
            { heading: 'Resources', links: ['IITA guidelines', 'NAFDAC products', 'Extension offices', 'GitHub'] },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <div className="t-label" style={{ marginBottom: 'var(--s4)' }}>{heading}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                {links.map(l => (
                  <li key={l}>
                    <a href="#" style={{ fontSize: 13, color: 'var(--n-400)', fontFamily: 'var(--font-body)', transition: 'color var(--fast)' }}
                      onMouseEnter={e => e.target.style.color = 'var(--n-100)'}
                      onMouseLeave={e => e.target.style.color = 'var(--n-400)'}
                    >{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div style={{ paddingTop: 'var(--s5)', borderTop: '1px solid var(--glass-edge)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--s3)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--n-600)' }}>
            © 2026 Terra VI · Built for Nigerian agriculture · All treatment data sourced from IITA extension manuals
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)' }}>
            {['tomato', 'maize', 'rice'].map(c => (
              <span key={c} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="pulse pulse-em" style={{ width: 5, height: 5 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--n-600)', textTransform: 'capitalize' }}>{c}</span>
              </span>
            ))}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--n-600)' }}>· local inference · no API</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

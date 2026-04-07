import { useEffect, useState } from 'react'
import { RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

async function fetchHistory(limit = 20) {
  const r = await fetch(`/api/v1/history?limit=${limit}`)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

const CROP_COLORS = {
  tomato:  'var(--rust-400)',
  maize:   'var(--gold-400)',
  rice:    'var(--sky-400)',
  cassava: 'var(--em-300)',
}

const SEV_COLORS = {
  1: 'var(--em-400)', 2: 'var(--em-400)',
  3: 'var(--em-400)', 4: 'var(--gold-300)',
  5: 'var(--gold-400)', 6: 'var(--gold-400)',
  7: 'var(--rust-300)', 8: 'var(--rust-400)',
  9: 'var(--rust-400)', 10: 'var(--rust-400)',
}

export function DiagnosisHistory() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true); setError(null)
    fetchHistory().then(setData).catch(e => setError(e.message)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <section id="history" className="section" style={{ background: 'var(--obsidian)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--s7)' }}>
          <div>
            <div className="section-tag">Audit log</div>
            <h2 className="t-display" style={{ fontSize: 'clamp(28px, 3.5vw, 46px)' }}>Diagnosis history</h2>
          </div>
          <button className="btn btn-ghost" onClick={load} disabled={loading} style={{ gap: 8 }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', color: 'var(--n-500)' }}>
            <span className="pulse pulse-em" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>Loading history…</span>
          </div>
        )}

        {error && (
          <div className="glass" style={{ padding: 'var(--s4)', border: '1px solid rgba(216,80,48,0.25)', fontSize: 13, color: 'var(--danger)' }}>
            {error} — backend may not be running
          </div>
        )}

        {data && data.items?.length === 0 && (
          <div className="glass" style={{ padding: 'var(--s8)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--n-400)' }}>No diagnoses yet</p>
            <p style={{ fontSize: 13, color: 'var(--n-500)', marginTop: 8 }}>Run a diagnosis above to see your history here.</p>
          </div>
        )}

        {data && data.items?.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 100px 80px 80px', gap: 'var(--s4)', padding: '8px var(--s5)', borderBottom: '1px solid var(--glass-edge)' }}>
              {['Disease / Crop', 'Status', 'Confidence', 'Urgency', 'Time'].map(h => (
                <span key={h} className="t-label">{h}</span>
              ))}
            </div>

            {data.items.map(item => {
              const statusConfig = !item.treatment_found && !item.low_confidence
                ? { color: 'var(--danger)', Icon: XCircle, label: 'error' }
                : item.low_confidence
                ? { color: 'var(--gold-400)', Icon: AlertTriangle, label: 'low conf' }
                : { color: 'var(--em-400)', Icon: CheckCircle, label: 'diagnosed' }

              const cropColor = CROP_COLORS[item.crop] || 'var(--n-400)'
              const date = new Date(item.created_at)

              return (
                <div key={item.session_id} className="glass" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 90px 100px 80px 80px',
                  gap: 'var(--s4)',
                  padding: 'var(--s4) var(--s5)',
                  alignItems: 'center',
                  transition: 'border-color var(--fast)',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--glass-edge-bright)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-edge)'}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--n-50)', lineHeight: 1.3 }}>
                      {item.disease_slug
                        ? item.disease_slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                        : '—'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cropColor, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: 'var(--n-500)', textTransform: 'capitalize', fontFamily: 'var(--font-body)' }}>{item.crop}</span>
                      <span style={{ fontSize: 11, color: 'var(--n-600)', fontFamily: 'var(--font-mono)' }}>·</span>
                      <span style={{ fontSize: 11, color: 'var(--n-600)', fontFamily: 'var(--font-mono)' }}>{item.session_id?.slice(0, 8)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <statusConfig.Icon size={12} color={statusConfig.color} />
                    <span style={{ fontSize: 11, color: statusConfig.color, fontFamily: 'var(--font-body)', fontWeight: 500 }}>{statusConfig.label}</span>
                  </div>

                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: item.confidence ? 'var(--n-200)' : 'var(--n-600)' }}>
                    {item.confidence ? `${Math.round(item.confidence * 100)}%` : '—'}
                  </div>

                  <div>
                    {item.severity_score ? (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: SEV_COLORS[item.severity_score] || 'var(--n-400)', background: `${SEV_COLORS[item.severity_score] || 'var(--n-600)'}15`, padding: '2px 8px', borderRadius: 99 }}>
                        {item.severity_score}/10
                      </span>
                    ) : <span style={{ fontSize: 12, color: 'var(--n-600)' }}>—</span>}
                  </div>

                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--n-500)' }}>
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  )
}

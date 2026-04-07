import { useState } from 'react'
import { Search, AlertTriangle, Eye, Leaf, Shield, ChevronDown, ChevronUp } from 'lucide-react'
import treatmentData from '../data/treatments.json'

const ALL_KEYS = Object.keys(treatmentData).filter(k => !k.startsWith('_'))
const CROP_FILTERS = ['all', 'tomato', 'maize', 'rice', 'cassava']

const CROP_META = {
  tomato:  { color: 'var(--rust-400)',  dim: 'rgba(216,80,48,0.1)',   border: 'rgba(216,80,48,0.25)' },
  cassava: { color: 'var(--em-300)',    dim: 'rgba(78,200,122,0.1)', border: 'rgba(78,200,122,0.25)' },
  maize:   { color: 'var(--gold-400)', dim: 'rgba(240,172,24,0.1)', border: 'rgba(240,172,24,0.25)' },
  rice:    { color: 'var(--sky-300)',   dim: 'rgba(74,158,200,0.1)', border: 'rgba(74,158,200,0.25)' },
}

const TYPE_COLORS = {
  fungal:    'var(--em-400)',
  oomycete:  'var(--rust-300)',
  bacterial: 'var(--sky-400)',
  viral:     'var(--gold-300)',
  pest:      'var(--gold-400)',
  healthy:   'var(--em-300)',
}

function getSteps(organic) {
  const steps = []
  for (let i = 1; i <= 8; i++) if (organic?.[`step_${i}`]) steps.push(organic[`step_${i}`])
  return steps
}

export function DiseaseLibrary() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  const filtered = ALL_KEYS.filter(key => {
    const d = treatmentData[key]
    if (!d || !d.crop) return false
    const matchCrop = filter === 'all' || d.crop === filter
    const q = search.toLowerCase()
    const matchSearch = !q || d.disease_name?.toLowerCase().includes(q) ||
      d.local_name?.toLowerCase().includes(q) || d.pathogen?.toLowerCase().includes(q)
    return matchCrop && matchSearch
  })

  const cropCount = CROP_FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? ALL_KEYS.length : ALL_KEYS.filter(k => treatmentData[k]?.crop === f).length
    return acc
  }, {})

  return (
    <section id="library" className="section" style={{ background: 'var(--obsidian)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--s8)' }}>
          <div className="section-tag">Disease database</div>
          <h2 className="t-display" style={{ fontSize: 'clamp(30px, 4vw, 50px)', marginBottom: 'var(--s4)' }}>
            Complete treatment database
          </h2>
          <p className="t-body" style={{ maxWidth: 560, margin: '0 auto', color: 'var(--n-300)' }}>
            {ALL_KEYS.length} disease entries across {Object.keys(CROP_META).length} crops.
            Every diagnosis maps to IITA-vetted treatment data. No AI-generated dosages.
          </p>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 'var(--s3)', marginBottom: 'var(--s5)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--glass-1)', border: '1px solid var(--glass-edge)', borderRadius: 'var(--r3)', backdropFilter: 'blur(8px)' }}>
            {CROP_FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 14px', borderRadius: 'var(--r2)',
                background: filter === f ? 'var(--glass-3)' : 'transparent',
                border: filter === f ? '1px solid var(--glass-edge-bright)' : '1px solid transparent',
                color: filter === f ? 'var(--n-50)' : 'var(--n-400)',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12,
                cursor: 'pointer', transition: 'all var(--fast)',
                textTransform: 'capitalize',
              }}>
                {f === 'all' ? `All (${cropCount.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${cropCount[f]})`}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} color="var(--n-500)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search diseases, pathogens…"
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                background: 'var(--glass-1)', backdropFilter: 'blur(8px)',
                border: '1px solid var(--glass-edge)', borderRadius: 'var(--r3)',
                color: 'var(--n-100)', fontFamily: 'var(--font-body)', fontSize: 13,
                outline: 'none', transition: 'border-color var(--fast)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--glass-edge-bright)'}
              onBlur={e => e.target.style.borderColor = 'var(--glass-edge)'}
            />
          </div>
        </div>

        {/* Count */}
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--n-500)', marginBottom: 'var(--s5)' }}>
          Showing {filtered.length} of {ALL_KEYS.length} entries
        </p>

        {/* Disease cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
          {filtered.map(key => {
            const d = treatmentData[key]
            if (!d) return null
            const meta = CROP_META[d.crop] || CROP_META.tomato
            const typeColor = TYPE_COLORS[d.type?.toLowerCase()] || 'var(--n-400)'
            const isOpen = expanded === key
            const steps = getSteps(d.organic_treatment)

            return (
              <div key={key} className="glass" style={{
                overflow: 'hidden',
                border: isOpen ? meta.border : 'var(--glass-edge)',
                transition: 'border-color var(--mid)',
              }}>
                {/* Header row */}
                <button onClick={() => setExpanded(isOpen ? null : key)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'var(--s4) var(--s5)', background: 'transparent', border: 'none',
                  cursor: 'pointer', gap: 'var(--s4)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)', flex: 1, minWidth: 0 }}>
                    {/* Crop pill */}
                    <div style={{ padding: '3px 10px', background: meta.dim, border: `1px solid ${meta.border}`, borderRadius: 99, flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, color: meta.color, textTransform: 'capitalize' }}>{d.crop}</span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--n-50)', lineHeight: 1.2 }}>
                        {d.disease_name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontStyle: 'italic', color: 'var(--n-400)', marginTop: 2 }}>
                        {d.local_name}
                      </div>
                    </div>

                    {/* Type badge */}
                    <div style={{ padding: '3px 10px', background: `${typeColor}12`, border: `1px solid ${typeColor}25`, borderRadius: 99, flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: typeColor, textTransform: 'capitalize' }}>{d.type}</span>
                    </div>
                  </div>

                  {isOpen ? <ChevronUp size={15} color="var(--n-500)" /> : <ChevronDown size={15} color="var(--n-500)" />}
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ padding: '0 var(--s5) var(--s5)', borderTop: '1px solid var(--glass-edge)' }}>

                    {/* Pathogen */}
                    <div style={{ padding: 'var(--s3) var(--s4)', background: 'var(--glass-1)', borderRadius: 'var(--r2)', marginTop: 'var(--s4)', marginBottom: 'var(--s4)' }}>
                      <span className="t-label" style={{ marginRight: 8 }}>Pathogen:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontStyle: 'italic', color: 'var(--n-300)' }}>{d.pathogen}</span>
                    </div>

                    {/* Visual markers */}
                    {d.visual_markers && (
                      <div style={{ marginBottom: 'var(--s4)' }}>
                        <div className="t-label" style={{ marginBottom: 'var(--s3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Eye size={11} color="var(--n-400)" /> Visual symptoms
                        </div>
                        {d.visual_markers.slice(0, 4).map((m, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--n-300)', marginBottom: 6, lineHeight: 1.55 }}>
                            <span style={{ color: meta.color, flexShrink: 0, fontWeight: 700 }}>—</span>{m}
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s3)' }}>
                      {/* Organic */}
                      <div className="glass-sm" style={{ padding: 'var(--s4)' }}>
                        <div className="t-label" style={{ marginBottom: 'var(--s3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Leaf size={11} color="var(--em-400)" /> Organic treatment
                        </div>
                        <ul className="step-list">
                          {steps.slice(0, 3).map((step, i) => (
                            <li key={i}><span className="step-num" style={{ fontSize: 9 }}>0{i+1}</span><span style={{ fontSize: 12 }}>{step}</span></li>
                          ))}
                        </ul>
                      </div>

                      {/* Chemical */}
                      <div className="glass-sm" style={{ padding: 'var(--s4)' }}>
                        <div className="t-label" style={{ marginBottom: 'var(--s3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Shield size={11} color="var(--sky-400)" /> Chemical option
                        </div>
                        {d.chemical_treatment?.product_name && d.chemical_treatment.product_name !== 'N/A' && d.chemical_treatment.product_name !== 'No treatment needed' ? (
                          <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--n-200)', marginBottom: 4 }}>{d.chemical_treatment.product_name}</div>
                            {d.chemical_treatment.common_brand_in_nigeria && (
                              <div style={{ fontSize: 11, color: 'var(--n-400)', marginBottom: 4 }}>{d.chemical_treatment.common_brand_in_nigeria}</div>
                            )}
                            {d.chemical_treatment.dosage && (
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--sky-400)' }}>{d.chemical_treatment.dosage}</div>
                            )}
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: 'var(--n-500)', fontStyle: 'italic' }}>
                            {d.chemical_treatment?.note || 'No chemical treatment applicable'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Extension warning */}
                    {d.when_to_seek_extension_officer && (
                      <div style={{ marginTop: 'var(--s3)', padding: 'var(--s3) var(--s4)', background: 'rgba(240,172,24,0.06)', border: '1px solid rgba(240,172,24,0.15)', borderRadius: 'var(--r2)', display: 'flex', gap: 8 }}>
                        <AlertTriangle size={13} color="var(--gold-400)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <p style={{ fontSize: 12, color: 'var(--n-400)', lineHeight: 1.5 }}>{d.when_to_seek_extension_officer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

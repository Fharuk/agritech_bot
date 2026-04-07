import { useState, useRef, useEffect } from 'react'
import {
  Upload, Loader2, AlertTriangle, CheckCircle,
  Leaf, Shield, ChevronDown, ChevronUp, Cpu, Info,
  WifiOff, RefreshCw, Clock, Download, HardDrive, Camera, X,
} from 'lucide-react'
import { useDiagnose, STATES } from '../hooks/useDiagnose'
import { getHealth } from '../services/api'
import { useLang } from '../App'

const CROPS = [
  {
    id: 'tomato', label: 'Tomato', photo: 'https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?w=200&q=80',
    modelId: 'wellCh4n/tomato-leaf-disease-classification-vit', modelSize: '~350MB', stack: 'PyTorch · ViT',
    diseases: '9 diseases · 99.7% accuracy', available: true,
  },
  {
    id: 'maize', label: 'Maize', photo: 'https://images.unsplash.com/photo-1601593768799-76e41a1b2a0a?w=200&q=80',
    modelId: 'eligapris/maize-diseases-detection', modelSize: '~25MB', stack: 'TensorFlow · CNN',
    diseases: 'Fall Armyworm · Leaf Blight', available: true,
  },
  {
    id: 'rice', label: 'Rice', photo: 'https://images.unsplash.com/photo-1591087822174-b10dafe6c89f?w=200&q=80',
    modelId: 'prithivMLmods/Rice-Leaf-Disease', modelSize: '~93MB', stack: 'PyTorch · SigLIP2',
    diseases: '5 diseases · 94.8% accuracy', available: true,
  },
  {
    id: 'cassava', label: 'Cassava', photo: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&q=80',
    modelId: null, modelSize: null, stack: null,
    diseases: 'Model in development', available: false,
  },
]

const SEVERITY_CONFIG = {
  label: (score) => {
    if (!score) return null
    if (score <= 2) return { text: 'Monitor', color: 'var(--em-400)', bg: 'rgba(52,160,93,0.1)' }
    if (score <= 5) return { text: 'Treat this week', color: 'var(--gold-400)', bg: 'rgba(240,172,24,0.1)' }
    if (score <= 8) return { text: 'Act today', color: 'var(--rust-300)', bg: 'rgba(216,80,48,0.1)' }
    return { text: 'Emergency', color: 'var(--rust-400)', bg: 'rgba(216,80,48,0.15)' }
  }
}

function getSteps(organic) {
  const steps = []
  for (let i = 1; i <= 8; i++) if (organic?.[`step_${i}`]) steps.push(organic[`step_${i}`])
  return steps
}

function Accordion({ title, badge, badgeColor, icon: Icon, iconColor, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ border: '1px solid var(--glass-edge)', borderRadius: 'var(--r3)', overflow: 'hidden' }}>
      <button className="accordion-trigger" onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--r2)', background: `${iconColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={15} color={iconColor} />
          </div>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--n-100)' }}>{title}</span>
          {badge && (
            <span style={{ fontSize: 10, fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: badgeColor, background: `${badgeColor}15`, padding: '2px 10px', borderRadius: 999 }}>
              {badge}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={15} color="var(--n-500)" /> : <ChevronDown size={15} color="var(--n-500)" />}
      </button>
      {open && (
        <div style={{ padding: 'var(--s4) var(--s5) var(--s5)', borderTop: '1px solid var(--glass-edge)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function ResultPanel({ state, result, error }) {
  if (!result && state !== STATES.ERROR) return null

  const confPct = result?.confidence ? Math.round(result.confidence * 100) : 0
  const confColor = confPct >= 85 ? 'var(--em-400)' : confPct >= 65 ? 'var(--gold-400)' : 'var(--rust-400)'
  const t = result?.treatment
  const sev = result?.severity_score
  const sevConfig = SEVERITY_CONFIG.label(sev)

  if (state === STATES.ERROR && (error?.includes('coming soon') || error?.includes('Coming soon'))) {
    return (
      <div className="glass" style={{ padding: 'var(--s5)', display: 'flex', gap: 'var(--s4)' }}>
        <Clock size={18} color="var(--sky-400)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--sky-300)', marginBottom: 6 }}>Coming soon</div>
          <p style={{ fontSize: 13, color: 'var(--n-300)', lineHeight: 1.7 }}>{error}</p>
        </div>
      </div>
    )
  }

  if (state === STATES.ERROR) {
    return (
      <div className="glass" style={{ padding: 'var(--s5)', border: '1px solid rgba(216,80,48,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--s3)' }}>
          <AlertTriangle size={14} color="var(--danger)" />
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--danger)' }}>Diagnostic Error</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--n-300)', lineHeight: 1.7 }}>{error}</p>
      </div>
    )
  }

  if (state === STATES.LOW_CONFIDENCE) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)', animation: 'rise 0.3s var(--ease-out) both' }}>
        <div className="glass" style={{ padding: 'var(--s5)', border: '1px solid rgba(240,172,24,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--s3)' }}>
            <span className="pulse pulse-gold" />
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-400)' }}>Low Confidence — {confPct}%</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--n-300)', lineHeight: 1.7 }}>{result?.low_confidence_message}</p>
        </div>
        <div className="glass" style={{ padding: 'var(--s4)' }}>
          <div className="t-label" style={{ marginBottom: 'var(--s3)' }}>Tips for a clearer photo</div>
          {['Natural daylight — avoid shade or indoor light', 'Fill the frame with the most symptomatic leaf', 'Hold 20–30cm from the leaf, keep steady', 'Focus on clearest spots or lesions visible'].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--n-300)', marginBottom: 8, lineHeight: 1.55 }}>
              <span style={{ color: 'var(--em-400)', fontWeight: 700, flexShrink: 0 }}>—</span>{tip}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (state === STATES.SUCCESS && (result?.disease_slug?.endsWith('_healthy'))) {
    return (
      <div className="glass" style={{ padding: 'var(--s6)', textAlign: 'center', border: '1px solid rgba(52,160,93,0.25)', animation: 'rise 0.4s var(--ease-out) both' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 'var(--s3)', color: 'var(--em-300)' }}>✓</div>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--em-200)', marginBottom: 8 }}>Healthy Plant</h4>
        <p style={{ fontSize: 13, color: 'var(--n-300)', lineHeight: 1.7 }}>
          Your plant appears healthy ({confPct}% confidence). Continue your current management practices and monitor weekly.
        </p>
        <div style={{ marginTop: 'var(--s4)', fontSize: 11, color: 'var(--n-500)', fontFamily: 'var(--font-mono)' }}>
          {result.model_used?.split('/')[1]} · {result.inference_ms}ms · local
        </div>
      </div>
    )
  }

  if (state !== STATES.SUCCESS || !t) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)', animation: 'rise 0.4s var(--ease-out) both' }}>

      {/* Diagnosis header card */}
      <div className="glass-bold" style={{ padding: 'var(--s5)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--s4)' }}>
          <CheckCircle size={14} color="var(--em-400)" />
          <span style={{ fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--em-400)' }}>Diagnosis complete</span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--n-500)', fontFamily: 'var(--font-mono)' }}>
            <HardDrive size={10} /> local model
          </span>
        </div>

        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, letterSpacing: '-0.02em', color: 'var(--n-50)', marginBottom: 4 }}>
          {t.disease_name}
        </h4>
        <p style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--n-400)', marginBottom: 'var(--s4)', fontFamily: 'var(--font-body)' }}>
          {t.local_name} · {t.crop?.charAt(0).toUpperCase()}{t.crop?.slice(1)}
        </p>

        {/* Severity badge */}
        {sevConfig && (
          <div style={{ marginBottom: 'var(--s4)', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: sevConfig.bg, border: `1px solid ${sevConfig.color}30`, borderRadius: 99 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: sevConfig.color, letterSpacing: '0.06em' }}>
              URGENCY {sev}/10 — {sevConfig.text.toUpperCase()}
            </span>
          </div>
        )}

        {/* Confidence bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span className="t-label">Confidence</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: confColor }}>{confPct}%</span>
          </div>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${confPct}%`, background: confColor }} /></div>
        </div>
      </div>

      {/* Critical note */}
      {t.critical_note && (
        <div className="glass" style={{ padding: 'var(--s4)', border: '1px solid rgba(74,158,200,0.25)', display: 'flex', gap: 'var(--s3)' }}>
          <AlertTriangle size={14} color="var(--sky-400)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: 'var(--sky-300)', lineHeight: 1.6 }}>{t.critical_note}</p>
        </div>
      )}

      {/* Organic treatment */}
      <Accordion title="Organic treatment" badge="Recommended first" badgeColor="var(--em-400)" icon={Leaf} iconColor="var(--em-400)" defaultOpen>
        <ul className="step-list">
          {getSteps(t.organic_treatment).map((step, i) => (
            <li key={i}><span className="step-num">0{i + 1}</span><span style={{ fontSize: 13 }}>{step}</span></li>
          ))}
        </ul>
        {t.organic_treatment?.source && (
          <p style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--n-500)', marginTop: 'var(--s3)' }}>Source: {t.organic_treatment.source}</p>
        )}
      </Accordion>

      {/* Chemical treatment */}
      <Accordion title="Chemical treatment" badge="NAFDAC verified" badgeColor="var(--sky-400)" icon={Shield} iconColor="var(--sky-400)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
          {t.chemical_treatment?.note && (
            <div style={{ fontSize: 12, color: 'var(--gold-300)', padding: 'var(--s2) var(--s3)', background: 'rgba(240,172,24,0.08)', borderRadius: 'var(--r2)' }}>
              {t.chemical_treatment.note}
            </div>
          )}
          {t.chemical_treatment?.option_1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
              {[t.chemical_treatment.option_1, t.chemical_treatment.option_2].filter(Boolean).map((opt, i) => (
                <div key={i} style={{ padding: 'var(--s3)', background: 'var(--glass-1)', border: '1px solid var(--glass-edge)', borderRadius: 'var(--r2)' }}>
                  <div className="t-label" style={{ color: 'var(--em-400)', marginBottom: 4 }}>Option {i + 1}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--n-200)', marginBottom: 2 }}>{opt.product}</div>
                  <div style={{ fontSize: 11, color: 'var(--n-400)' }}>{opt.dosage}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s2)' }}>
              {[
                { label: 'Product', val: t.chemical_treatment?.product_name },
                { label: 'Nigerian brands', val: t.chemical_treatment?.common_brand_in_nigeria },
                { label: 'Dosage', val: t.chemical_treatment?.dosage },
                { label: 'Frequency', val: t.chemical_treatment?.frequency },
              ].filter(x => x.val && x.val !== 'N/A').map(({ label, val }) => (
                <div key={label} style={{ padding: 'var(--s3)', background: 'var(--glass-1)', border: '1px solid var(--glass-edge)', borderRadius: 'var(--r2)' }}>
                  <div className="t-label" style={{ marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--n-200)' }}>{val}</div>
                </div>
              ))}
            </div>
          )}
          {t.chemical_treatment?.phe_warning && t.chemical_treatment.phe_warning !== 'N/A' && (
            <div style={{ padding: 'var(--s3) var(--s4)', background: 'rgba(216,80,48,0.08)', border: '1px solid rgba(216,80,48,0.25)', borderRadius: 'var(--r2)', display: 'flex', gap: 8 }}>
              <AlertTriangle size={13} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 12, color: 'var(--rust-200)', lineHeight: 1.5 }}>{t.chemical_treatment.phe_warning}</p>
            </div>
          )}
        </div>
      </Accordion>

      {/* Prevention */}
      <Accordion title="Prevention tips" icon={CheckCircle} iconColor="var(--gold-400)">
        {t.prevention?.map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: 'var(--s3)', fontSize: 13, color: 'var(--n-300)', marginBottom: 'var(--s2)' }}>
            <span style={{ color: 'var(--gold-400)', fontWeight: 700, flexShrink: 0 }}>—</span>{tip}
          </div>
        ))}
      </Accordion>

      {/* Extension officer */}
      <div className="glass" style={{ padding: 'var(--s4)', border: '1px solid rgba(240,172,24,0.2)', display: 'flex', gap: 'var(--s3)' }}>
        <AlertTriangle size={15} color="var(--gold-400)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, color: 'var(--gold-400)', marginBottom: 4 }}>When to call your extension officer</div>
          <p style={{ fontSize: 13, color: 'var(--n-300)', lineHeight: 1.6 }}>{t.when_to_seek_extension_officer}</p>
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--n-500)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 'var(--s4)', flexWrap: 'wrap' }}>
        <span>{result.model_used?.split('/').pop()}</span>
        <span>{result.inference_ms}ms</span>
        <span>local · no API</span>
      </div>
    </div>
  )
}

export function DiagnoseTool() {
  const [preview, setPreview]         = useState(null)
  const [file, setFile]               = useState(null)
  const [crop, setCrop]               = useState('tomato')
  const [fileError, setFileError]     = useState(null)
  const [dragging, setDragging]       = useState(false)
  const [health, setHealth]           = useState(null)
  const [backendDown, setBackendDown] = useState(false)
  const [healthLoading, setHealthLoading] = useState(true)
  const inputRef = useRef(null)
  const { state, result, error, uploadPct, submit, reset } = useDiagnose()
  const { t } = useLang()

  const busy      = state === STATES.UPLOADING || state === STATES.PROCESSING
  const hasResult = [STATES.SUCCESS, STATES.LOW_CONFIDENCE, STATES.ERROR].includes(state)

  const checkHealth = async () => {
    setHealthLoading(true)
    try { const data = await getHealth(); setHealth(data); setBackendDown(false) }
    catch { setBackendDown(true); setHealth(null) }
    finally { setHealthLoading(false) }
  }

  useEffect(() => { checkHealth() }, [])

  const handleFile = (f) => {
    setFileError(null)
    if (!f) return
    if (!f.type.startsWith('image/')) { setFileError('Please upload an image file — JPG, PNG, or WebP.'); return }
    if (f.size > 10 * 1024 * 1024) { setFileError('File too large — maximum 10 MB.'); return }
    setFile(f); setPreview(URL.createObjectURL(f)); reset()
  }

  const handleReset = () => {
    setPreview(null); setFile(null); setFileError(null)
    if (inputRef.current) inputRef.current.value = ''
    reset()
  }

  const isReady = (cropId) => {
    if (cropId === 'tomato') return health?.ready_to_diagnose_tomato
    if (cropId === 'maize') return health?.ready_to_diagnose_maize
    if (cropId === 'rice') return health?.ready_to_diagnose_rice
    return false
  }

  const selectedCrop = CROPS.find(c => c.id === crop)
  const cropReady = isReady(crop)
  const canSubmit = file && !busy && !backendDown && selectedCrop?.available && (health ? cropReady : false)

  return (
    <section id="diagnose" className="section" style={{ background: 'var(--obsidian-2)', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient light */}
      <div style={{ position: 'absolute', top: '20%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,160,93,0.07) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--s8)' }}>
          <div className="section-tag">Live diagnostic tool</div>
          <h2 className="t-display" style={{ fontSize: 'clamp(30px, 4vw, 50px)', marginBottom: 'var(--s4)' }}>
            Submit a crop photo
          </h2>
          <p className="t-body" style={{ maxWidth: 560, margin: '0 auto', color: 'var(--n-300)' }}>
            Three models run locally — no API key, no cloud, no cold starts. Results in 1–5 seconds.
          </p>
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto' }}>

          {/* Backend offline banner */}
          {backendDown && (
            <div className="glass" style={{ padding: 'var(--s5)', marginBottom: 'var(--s5)', border: '1px solid rgba(216,80,48,0.3)', display: 'flex', gap: 'var(--s4)' }}>
              <WifiOff size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'var(--danger)', marginBottom: 8 }}>Cannot reach backend server</div>
                <p style={{ fontSize: 12, color: 'var(--n-300)', lineHeight: 1.7 }}>
                  Start the backend: <code style={{ background: 'var(--glass-2)', padding: '2px 8px', borderRadius: 4, fontSize: 11, color: 'var(--em-300)' }}>uvicorn app.main:app --reload --port 8000</code>
                </p>
              </div>
            </div>
          )}

          {/* Model status strip */}
          {!backendDown && health && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s2)', marginBottom: 'var(--s5)' }}>
              {['tomato','maize','rice'].map(id => {
                const m = CROPS.find(c => c.id === id)
                const ready = isReady(id)
                const downloaded = id === 'tomato' ? health?.tomato_model_downloaded : id === 'maize' ? health?.maize_model_downloaded : health?.rice_model_downloaded
                return (
                  <div key={id} className="glass-sm" style={{ padding: 'var(--s3)', borderColor: ready ? 'rgba(52,160,93,0.25)' : 'var(--glass-edge)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: ready ? 'var(--em-400)' : downloaded ? 'var(--gold-400)' : 'var(--n-600)', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: ready ? 'var(--em-300)' : 'var(--n-400)' }}>{m?.label} {m?.stack?.split(' · ')[1]}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--n-500)' }}>
                      {downloaded ? <span style={{ color: 'var(--em-400)' }}>✓ local</span> : <span style={{ color: 'var(--gold-400)' }}>⬇ downloading…</span>}
                      {' · '}{m?.modelSize}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: hasResult ? '1fr 1fr' : '1fr', gap: 'var(--s6)', alignItems: 'start' }}>

            {/* ── Upload panel ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>

              {/* Drop zone */}
              <div
                onClick={() => !busy && inputRef.current?.click()}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]) }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                className={busy ? 'scanning' : ''}
                style={{
                  border: `1px dashed ${dragging ? 'var(--em-400)' : fileError ? 'var(--danger)' : 'var(--glass-edge)'}`,
                  borderRadius: 'var(--r4)',
                  background: dragging ? 'rgba(52,160,93,0.04)' : 'var(--glass-1)',
                  backdropFilter: 'var(--blur-sm)',
                  cursor: busy ? 'default' : 'pointer',
                  overflow: 'hidden', minHeight: 220,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', transition: 'border-color var(--fast), background var(--fast)',
                }}
              >
                <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} disabled={busy} />

                {preview ? (
                  <>
                    <img src={preview} alt="Crop" style={{ width: '100%', height: 220, objectFit: 'cover', opacity: busy ? 0.4 : 1 }} />
                    {!busy && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(7,10,14,0.9))', padding: 'var(--s4)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: 11, color: 'var(--n-400)', fontFamily: 'var(--font-mono)' }}>
                          {file?.name?.slice(0, 30)} · {(file?.size / 1024).toFixed(0)}KB
                        </span>
                        <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 11, gap: 4 }} onClick={e => { e.stopPropagation(); handleReset() }}>
                          <X size={12} /> Change
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: 'var(--s7) var(--s6)' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 'var(--r4)', background: 'rgba(52,160,93,0.08)', border: '1px solid rgba(52,160,93,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--s4)' }}>
                      <Upload size={26} color="var(--em-400)" />
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--n-200)', marginBottom: 'var(--s2)' }}>
                      Drop photo here or click to select
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--n-500)' }}>JPG · PNG · WebP · max 10 MB</div>
                  </div>
                )}
              </div>

              {fileError && (
                <div style={{ padding: 'var(--s3) var(--s4)', background: 'rgba(216,80,48,0.08)', border: '1px solid rgba(216,80,48,0.25)', borderRadius: 'var(--r2)', fontSize: 13, color: 'var(--danger)' }}>
                  {fileError}
                </div>
              )}

              {state === STATES.UPLOADING && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span className="t-label">Uploading</span>
                    <span style={{ fontSize: 11, color: 'var(--gold-400)', fontFamily: 'var(--font-mono)' }}>{uploadPct}%</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill bar-fill-gold" style={{ width: `${uploadPct}%` }} /></div>
                </div>
              )}

              {state === STATES.PROCESSING && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', padding: 'var(--s3) var(--s4)', background: 'rgba(52,160,93,0.06)', border: '1px solid rgba(52,160,93,0.18)', borderRadius: 'var(--r2)' }}>
                  <Loader2 size={14} color="var(--em-400)" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--em-300)', fontFamily: 'var(--font-mono)' }}>
                    Running {crop} model locally…
                  </span>
                </div>
              )}

              {/* Crop selector */}
              <div>
                <span className="t-label" style={{ display: 'block', marginBottom: 'var(--s2)' }}>Select crop</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s2)' }}>
                  {CROPS.map(c => {
                    const isSelected = crop === c.id
                    return (
                      <button key={c.id} onClick={() => !busy && c.available && setCrop(c.id)} style={{
                        background: isSelected ? 'rgba(52,160,93,0.1)' : 'var(--glass-1)',
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${!c.available ? 'var(--glass-edge)' : isSelected ? 'rgba(52,160,93,0.4)' : 'var(--glass-edge)'}`,
                        borderRadius: 'var(--r3)', padding: 'var(--s3)', textAlign: 'left',
                        cursor: busy || !c.available ? 'not-allowed' : 'pointer',
                        opacity: busy || !c.available ? 0.45 : 1, transition: 'all var(--fast)',
                      }}>
                        <div style={{ height: 36, borderRadius: 'var(--r2)', overflow: 'hidden', marginBottom: 8 }}>
                          <img src={c.photo} alt={c.label} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: c.available ? 'brightness(0.8)' : 'grayscale(1) brightness(0.5)' }} />
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, color: !c.available ? 'var(--n-500)' : isSelected ? 'var(--em-300)' : 'var(--n-200)' }}>
                          {c.label}
                        </div>
                        {!c.available && <div style={{ fontSize: 9, color: 'var(--n-500)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>Soon</div>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: 'var(--s3)' }}>
                <button className="btn btn-gold" style={{ flex: 1, justifyContent: 'center', padding: 'var(--s4)', fontSize: 14 }} disabled={!canSubmit} onClick={() => submit(file, crop)}>
                  <Cpu size={15} />
                  {busy ? 'Analysing…' : 'Run Diagnostic'}
                </button>
                {(preview || hasResult) && (
                  <button className="btn btn-ghost" onClick={handleReset} disabled={busy}>Reset</button>
                )}
              </div>

              {/* Photo tips */}
              {!preview && (
                <div className="glass-sm" style={{ padding: 'var(--s4)' }}>
                  <div className="t-label" style={{ marginBottom: 'var(--s3)' }}>Photo tips for best accuracy</div>
                  {['Natural daylight — avoid indoor light or shade', 'Fill the frame with the most symptomatic leaf', 'Focus clearly on spots, lesions, or damage', 'Hold camera still — avoid any blur'].map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--n-400)', marginBottom: 7, lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--em-400)', fontWeight: 700 }}>—</span>{tip}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Result panel ── */}
            {hasResult && (
              <div style={{ animation: 'rise 0.35s var(--ease-out) both' }}>
                <ResultPanel state={state} result={result} error={error} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

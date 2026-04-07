import { ArrowRight, Camera, Shield, Leaf, Zap, Scan, Activity } from 'lucide-react'
import { useLang } from '../App'

export function Hero() {
  const { t } = useLang()

  return (
    <section className="hero" style={{ minHeight: '100vh', paddingTop: 64 }}>

      {/* ── Background: real aerial Nigerian farmland ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: "url('https://images.pexels.com/photos/1146708/pexels-photo-1146708.jpeg?auto=compress&cs=tinysrgb&w=1920')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        filter: 'brightness(0.22) saturate(1.1)',
      }} />

      {/* ── Layered atmospheric overlays ── */}
      {/* Top vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,10,14,0.55) 0%, transparent 35%, transparent 60%, rgba(7,10,14,0.95) 100%)', pointerEvents: 'none' }} />
      {/* Left fade for text legibility */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(7,10,14,0.6) 0%, rgba(7,10,14,0.2) 50%, transparent 100%)', pointerEvents: 'none' }} />

      {/* ── Ambient light orbs bleeding through glass ── */}
      <div style={{ position: 'absolute', top: '18%', right: '12%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,160,93,0.14) 0%, transparent 68%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '22%', left: '8%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,172,24,0.09) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '55%', right: '32%', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,158,200,0.07) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%', paddingTop: 'var(--s8)', paddingBottom: 'var(--s8)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 460px', gap: 'var(--s9)', alignItems: 'center' }}>

          {/* ── Left: Headline ── */}
          <div className="animate-rise">

            {/* Status pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '8px 16px',
              background: 'rgba(7,10,14,0.5)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 99,
              marginBottom: 'var(--s6)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
            }}>
              <span className="pulse pulse-em" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--em-300)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Built for Nigerian Agriculture
              </span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.12)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--n-500)' }}>3 models live</span>
            </div>

            {/* Hero headline — Cormorant Garamond at maximum size */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(58px, 7vw, 100px)',
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
              color: 'var(--n-50)',
              marginBottom: 'var(--s5)',
            }}>
              Diagnose your<br />
              <span style={{
                fontWeight: 600,
                fontStyle: 'normal',
                background: 'linear-gradient(135deg, var(--em-200) 0%, var(--em-300) 50%, var(--em-100) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>crop disease</span><br />
              <span style={{ fontWeight: 300, color: 'rgba(240,237,232,0.45)', fontSize: '0.58em', letterSpacing: '-0.01em', fontStyle: 'normal' }}>
                in under thirty seconds.
              </span>
            </h1>

            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.82,
              maxWidth: 500,
              marginBottom: 'var(--s7)',
              color: 'rgba(192,185,174,0.75)',
            }}>
              Upload a leaf photo. Our computer vision models — running fully offline,
              no cloud dependency — return an IITA-vetted treatment plan in seconds.
              Organic options first. Nigerian-market chemicals as backup.
            </p>

            {/* CTA row */}
            <div style={{ display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap', marginBottom: 'var(--s8)' }}>
              <a href="#diagnose" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '15px 32px',
                background: 'var(--em-500)',
                border: '1px solid var(--em-400)',
                borderRadius: 'var(--r4)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600, fontSize: 15,
                color: 'white',
                textDecoration: 'none',
                transition: 'all 200ms',
                boxShadow: '0 12px 40px rgba(39,128,71,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--em-400)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(39,128,71,0.45), inset 0 1px 0 rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--em-500)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(39,128,71,0.35), inset 0 1px 0 rgba(255,255,255,0.15)' }}
              >
                <Camera size={17} />
                Start a Diagnosis
                <ArrowRight size={15} />
              </a>
              <a href="#how-it-works" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '15px 28px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--r4)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600, fontSize: 15,
                color: 'var(--n-200)',
                textDecoration: 'none',
                transition: 'all 200ms',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = 'var(--n-50)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--n-200)' }}
              >
                See How It Works
              </a>
            </div>

            {/* Trust indicators */}
            <div style={{
              display: 'flex', gap: 'var(--s6)', flexWrap: 'wrap',
              paddingTop: 'var(--s5)',
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}>
              {[
                { icon: Shield, text: 'IITA-verified treatments' },
                { icon: Leaf,   text: 'Organic-first protocol' },
                { icon: Zap,    text: 'Local AI · no internet' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={13} color="var(--em-400)" strokeWidth={2} />
                  <span style={{ fontSize: 12, color: 'rgba(160,152,144,0.7)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Maximum glassmorphism diagnostic card ── */}
          <div className="animate-rise-2" style={{ position: 'relative' }}>

            {/* Depth layer 1 — outermost blur glow */}
            <div style={{
              position: 'absolute',
              inset: -20,
              background: 'radial-gradient(ellipse at center, rgba(52,160,93,0.1) 0%, transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }} />

            {/* Main glass card — maximum blur + layered borders */}
            <div style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.15) inset',
            }}>

              {/* Top refraction line — the signature glass shine */}
              <div style={{
                position: 'absolute', top: 0, left: 24, right: 24, height: 1,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 70%, transparent 100%)',
                borderRadius: '50%',
              }} />

              {/* Left refraction edge */}
              <div style={{
                position: 'absolute', top: 24, bottom: 24, left: 0, width: 1,
                background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.08) 70%, transparent 100%)',
              }} />

              {/* Inner content */}
              <div style={{ padding: 'var(--s5)' }}>

                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Scan size={13} color="var(--em-400)" />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--em-300)', letterSpacing: '0.1em' }}>LIVE DIAGNOSTIC</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="pulse pulse-em" style={{ width: 6, height: 6 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--n-500)' }}>processing</span>
                  </div>
                </div>

                {/* Leaf photo */}
                <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 'var(--s4)', position: 'relative', height: 190 }}>
                  <img
                    src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=85&auto=format&fit=crop"
                    alt="Leaf being analysed"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.82) saturate(1.1)' }}
                  />

                  {/* Scan animation */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(52,160,93,0.12) 50%, transparent 60%)', animation: 'scanLine 3s linear infinite' }} />

                  {/* Corner crosshair markers */}
                  {[{ top: 10, left: 10 }, { top: 10, right: 10 }, { bottom: 10, left: 10 }, { bottom: 10, right: 10 }].map((pos, i) => {
                    const isLeft = 'left' in pos; const isTop = 'top' in pos
                    return (
                      <div key={i} style={{
                        position: 'absolute', width: 18, height: 18, ...pos,
                        borderTop: isTop ? '2px solid rgba(52,160,93,0.8)' : 'none',
                        borderBottom: !isTop ? '2px solid rgba(52,160,93,0.8)' : 'none',
                        borderLeft: isLeft ? '2px solid rgba(52,160,93,0.8)' : 'none',
                        borderRight: !isLeft ? '2px solid rgba(52,160,93,0.8)' : 'none',
                      }} />
                    )
                  })}

                  {/* Overlay confidence readout */}
                  <div style={{
                    position: 'absolute', bottom: 10, right: 10,
                    background: 'rgba(7,10,14,0.7)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, padding: '5px 10px',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--em-300)', fontWeight: 500 }}>94%</span>
                  </div>
                </div>

                {/* Diagnosis result — glass within glass */}
                <div style={{
                  background: 'rgba(52,160,93,0.07)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(52,160,93,0.18)',
                  borderRadius: 12,
                  padding: 'var(--s4)',
                  marginBottom: 'var(--s3)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Inner refraction */}
                  <div style={{ position: 'absolute', top: 0, left: 12, right: 12, height: 1, background: 'linear-gradient(90deg, transparent, rgba(52,160,93,0.3), transparent)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--em-400)', letterSpacing: '0.1em', marginBottom: 5 }}>DETECTED</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--n-50)', lineHeight: 1.1 }}>Early Blight</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--n-500)', fontStyle: 'italic', marginTop: 3 }}>Alternaria solani · Tomato</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 500, color: 'var(--em-300)', lineHeight: 1 }}>94<span style={{ fontSize: 14 }}>%</span></div>
                      <div style={{ fontSize: 10, color: 'var(--n-500)', fontFamily: 'var(--font-body)' }}>confidence</div>
                    </div>
                  </div>
                </div>

                {/* Urgency + inference time row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--s2)', marginBottom: 'var(--s3)' }}>
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(240,172,24,0.08)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(240,172,24,0.18)',
                    borderRadius: 8,
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold-300)', letterSpacing: '0.06em' }}>URGENCY 7/10 — ACT TODAY</span>
                  </div>
                  <div style={{
                    padding: '8px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <Activity size={11} color="var(--n-500)" />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--n-500)' }}>2.4s</span>
                  </div>
                </div>

                {/* Model badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--em-400)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--n-600)' }}>wellCh4n/tomato-vit · local · no API</span>
                </div>
              </div>
            </div>

            {/* Floating chip — top right (layered glass) */}
            <div style={{
              position: 'absolute', top: -18, right: -18,
              background: 'rgba(7,10,14,0.65)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.13)',
              borderRadius: 12,
              padding: '9px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 12px 36px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
              <span style={{ fontSize: 16 }}>🌾</span>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--n-100)' }}>Rice model live</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--n-500)' }}>SigLIP2 · 94.8% acc</div>
              </div>
            </div>

            {/* Floating chip — bottom left */}
            <div style={{
              position: 'absolute', bottom: -16, left: -18,
              background: 'rgba(7,10,14,0.65)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '9px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 12px 36px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}>
              <Shield size={13} color="var(--em-400)" />
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--n-100)' }}>No API required</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--n-500)' }}>fully local inference</div>
              </div>
            </div>

            {/* Floating chip — left middle */}
            <div style={{
              position: 'absolute', top: '42%', left: -64,
              background: 'rgba(7,10,14,0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 10,
              padding: '8px 14px',
              display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              <Zap size={12} color="var(--gold-400)" />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold-300)' }}>&lt; 5s result</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom scene fade */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(transparent, var(--obsidian))', pointerEvents: 'none' }} />

      <style>{`
        @keyframes scanLine {
          0%   { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(190px); opacity: 0; }
        }
        @media (max-width: 960px) {
          .hero .container > div { grid-template-columns: 1fr !important; }
          .hero .container > div > div:last-child { display: none !important; }
        }
      `}</style>
    </section>
  )
}

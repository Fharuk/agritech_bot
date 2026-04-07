import { Camera, Upload, Cpu, FileText } from 'lucide-react'

const steps = [
  {
    n: '01', icon: Camera, color: 'var(--em-400)',
    title: 'Snap a leaf photo',
    body: 'Take a clear photo of the affected crop leaf with any phone. Focus on visible symptoms — spots, discolouration, or pest damage. Works on 2G.',
    detail: 'Any phone camera. No equipment needed.',
  },
  {
    n: '02', icon: Upload, color: 'var(--gold-400)',
    title: 'Upload to Terra VI',
    body: 'Submit via the web tool. Low-bandwidth optimised — compressed images work perfectly. WhatsApp channel also available for direct farmers.',
    detail: '2G/3G compatible across rural Nigeria.',
  },
  {
    n: '03', icon: Cpu, color: 'var(--sky-400)',
    title: 'Local AI analysis',
    body: 'Three dedicated models run entirely on the server — Tomato ViT (99.7%), Maize CNN, Rice SigLIP2 (94.8%). Photo quality pre-check runs first.',
    detail: 'No external API. Fully offline — no internet dependency.',
  },
  {
    n: '04', icon: FileText, color: 'var(--rust-300)',
    title: 'Vetted treatment plan',
    body: 'Receive a localised diagnosis with urgency score 1–10, organic treatments first, then NAFDAC-registered chemicals available in Nigerian agro stores.',
    detail: 'All dosages sourced from IITA extension manuals.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section" style={{ background: 'var(--obsidian)', position: 'relative', overflow: 'hidden' }}>

      {/* Background: blurred farmland at very low brightness */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: "url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=50&auto=format&fit=crop')",
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.06) saturate(0.5)',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--obsidian) 0%, transparent 15%, transparent 85%, var(--obsidian) 100%)', pointerEvents: 'none' }} />

      {/* Ambient emerald top */}
      <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 700, height: 300, background: 'radial-gradient(ellipse, rgba(52,160,93,0.08) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--s9)' }}>
          <div className="section-tag">Simple process</div>
          <h2 className="t-display" style={{ fontSize: 'clamp(32px, 4vw, 54px)', marginBottom: 'var(--s4)' }}>
            From photo to treatment plan
          </h2>
          <p className="t-body" style={{ maxWidth: 500, margin: '0 auto', color: 'var(--n-400)' }}>
            If you can take a photo, you can use Terra VI. No technical knowledge required.
          </p>
        </div>

        <div data-cols="4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s4)', position: 'relative' }}>

          {/* Connecting line */}
          <div style={{ position: 'absolute', top: 40, left: '14%', right: '14%', height: 1, background: 'linear-gradient(90deg, rgba(52,160,93,0.4), rgba(240,172,24,0.4), rgba(74,158,200,0.4), rgba(216,80,48,0.4))', opacity: 0.4, pointerEvents: 'none' }} />

          {steps.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.n} style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--r4)',
                padding: 'var(--s5)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform var(--mid) var(--ease-out), border-color var(--mid), box-shadow var(--mid)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.boxShadow = '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)'
                }}
              >
                {/* Top refraction */}
                <div style={{ position: 'absolute', top: 0, left: 12, right: 12, height: 1, background: `linear-gradient(90deg, transparent, ${s.color}40, transparent)` }} />

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: s.color, letterSpacing: '0.1em', marginBottom: 'var(--s4)', opacity: 0.8 }}>{s.n}</div>

                <div style={{ width: 50, height: 50, background: `${s.color}10`, border: `1px solid ${s.color}25`, borderRadius: 'var(--r3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--s4)' }}>
                  <Icon size={22} color={s.color} />
                </div>

                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--n-50)', marginBottom: 'var(--s3)', lineHeight: 1.2 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--n-400)', lineHeight: 1.7, marginBottom: 'var(--s3)' }}>{s.body}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: s.color, opacity: 0.65 }}>{s.detail}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Smallholder',
    price: 'Free',
    period: '',
    desc: 'For individual farmers getting started with crop disease detection.',
    features: ['5 scans per month', 'Tomato, Maize & Rice', 'Web diagnostic tool', 'Basic treatment plans', 'English & Hausa support'],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Farmer Pro',
    price: '₦2,500',
    period: '/month',
    desc: 'For serious farmers and cooperatives needing unlimited access.',
    features: ['Unlimited scans', 'All supported crops', 'Priority processing (<5s)', 'Detailed plans with dosages', 'Severity scoring + alerts', 'Diagnosis history', 'Hausa, Yoruba, Igbo'],
    cta: 'Start 14-day trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For agro-dealers, state ADPs, NGOs, and agricultural organisations.',
    features: ['Everything in Farmer Pro', 'Multi-user dashboard', 'Disease outbreak maps', 'API access', 'Custom crop additions', 'Bulk farmer onboarding', 'Dedicated account manager'],
    cta: 'Contact sales',
    highlight: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="section" style={{ background: 'var(--obsidian-2)', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient gold light */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(240,172,24,0.05) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--s8)' }}>
          <div className="section-tag">Pricing</div>
          <h2 className="t-display" style={{ fontSize: 'clamp(32px, 4vw, 52px)', marginBottom: 'var(--s4)' }}>
            Simple, accessible pricing
          </h2>
          <p className="t-body" style={{ maxWidth: 480, margin: '0 auto', color: 'var(--n-300)' }}>
            Every Nigerian smallholder farmer deserves access to crop disease intelligence.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s4)', maxWidth: 900, margin: '0 auto' }}>
          {plans.map(plan => (
            <div key={plan.name} style={{
              position: 'relative',
              background: plan.highlight ? 'var(--glass-3)' : 'var(--glass-1)',
              backdropFilter: 'var(--blur-lg)',
              WebkitBackdropFilter: 'var(--blur-lg)',
              border: `1px solid ${plan.highlight ? 'rgba(52,160,93,0.4)' : 'var(--glass-edge)'}`,
              borderRadius: 'var(--r5)',
              padding: 'var(--s6)',
              transition: 'transform var(--mid) var(--ease-out)',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', background: 'var(--em-500)', borderRadius: 99, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{ marginBottom: 'var(--s5)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--n-50)', marginBottom: 'var(--s2)' }}>{plan.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 'var(--s3)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, color: plan.highlight ? 'var(--em-300)' : 'var(--n-50)' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--n-400)' }}>{plan.period}</span>}
                </div>
                <p style={{ fontSize: 13, color: 'var(--n-400)', lineHeight: 1.6 }}>{plan.desc}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)', marginBottom: 'var(--s6)' }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <Check size={13} color={plan.highlight ? 'var(--em-400)' : 'var(--n-400)'} style={{ flexShrink: 0, marginTop: 3 }} />
                    <span style={{ fontSize: 13, color: 'var(--n-300)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <button className={plan.highlight ? 'btn btn-em' : 'btn btn-ghost'} style={{ width: '100%', justifyContent: 'center', padding: 'var(--s4)' }}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

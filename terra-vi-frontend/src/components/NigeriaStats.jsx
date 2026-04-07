import { Users, Smartphone, TrendingDown, Globe } from 'lucide-react'

const stats = [
  { icon: Users,        value: '36M+',   label: 'Nigerian Farmers',         sub: '90% are smallholders' },
  { icon: Smartphone,   value: '100M+',  label: 'WhatsApp Users',           sub: '53% mobile penetration' },
  { icon: TrendingDown, value: '30–40%', label: 'Crop Losses to Disease',   sub: '₦2.3T annual value lost' },
  { icon: Globe,        value: '#1',     label: 'Global Cassava Producer',  sub: "World's largest output" },
]

export function NigeriaStats() {
  return (
    <section style={{
      background: 'var(--obsidian-2)',
      borderTop: '1px solid var(--glass-edge)',
      borderBottom: '1px solid var(--glass-edge)',
      padding: 'var(--s8) 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle green light from top */}
      <div style={{
        position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 200,
        background: 'radial-gradient(ellipse, rgba(52,160,93,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--s7)' }}>
          <p className="t-label" style={{ color: 'var(--em-400)' }}>
            The opportunity — Nigerian agriculture by the numbers
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--s4)',
        }}>
          {stats.map(({ icon: Icon, value, label, sub }) => (
            <div key={label} className="glass" style={{
              padding: 'var(--s5)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color var(--mid), transform var(--mid) var(--ease-out)',
              cursor: 'default',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--glass-edge-bright)'
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--glass-edge)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <Icon size={16} color="var(--em-400)" style={{ marginBottom: 'var(--s3)' }} />
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 36,
                letterSpacing: '-0.03em',
                color: 'var(--n-50)',
                lineHeight: 1,
                marginBottom: 6,
              }}>{value}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--n-200)', fontWeight: 600, marginBottom: 3 }}>
                {label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--n-400)' }}>
                {sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

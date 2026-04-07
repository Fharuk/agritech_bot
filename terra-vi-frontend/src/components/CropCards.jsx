import { ChevronRight, Clock } from 'lucide-react'

const crops = [
  {
    id: 'tomato',
    photo: 'https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?w=600&q=80&auto=format&fit=crop',
    label: 'Tomato',
    model: 'ViT · 99.7% accuracy',
    modelSize: '~350MB · PyTorch',
    live: true,
    diseases: [
      { name: 'Early Blight',                type: 'Fungal',    color: 'var(--em-400)' },
      { name: 'Late Blight',                 type: 'Oomycete',  color: 'var(--rust-400)' },
      { name: 'Leaf Miner (Tuta absoluta)',  type: 'Pest',      color: 'var(--gold-400)' },
      { name: 'Leaf Mold',                   type: 'Fungal',    color: 'var(--em-400)' },
      { name: 'Bacterial Spot',              type: 'Bacterial', color: 'var(--sky-400)' },
      { name: 'Septoria Leaf Spot',          type: 'Fungal',    color: 'var(--em-400)' },
      { name: 'Target Spot',                 type: 'Fungal',    color: 'var(--em-400)' },
      { name: 'Yellow Leaf Curl Virus',      type: 'Viral',     color: 'var(--gold-300)' },
      { name: 'Spider Mites',               type: 'Pest',      color: 'var(--gold-400)' },
    ],
    accent: 'var(--rust-400)',
    accentLight: 'rgba(216,80,48,0.12)',
  },
  {
    id: 'maize',
    photo: 'https://images.unsplash.com/photo-1601593768799-76e41a1b2a0a?w=600&q=80&auto=format&fit=crop',
    label: 'Maize',
    model: 'CNN · TensorFlow',
    modelSize: '~25MB · SavedModel',
    live: true,
    diseases: [
      { name: 'Fall Armyworm',           type: 'Pest',   color: 'var(--gold-400)' },
      { name: 'Northern Leaf Blight',    type: 'Fungal', color: 'var(--em-400)' },
    ],
    accent: 'var(--gold-400)',
    accentLight: 'rgba(240,172,24,0.1)',
  },
  {
    id: 'rice',
    photo: 'https://images.unsplash.com/photo-1591087822174-b10dafe6c89f?w=600&q=80&auto=format&fit=crop',
    label: 'Rice',
    model: 'SigLIP2 · 94.8% accuracy',
    modelSize: '~93MB · PyTorch',
    live: true,
    diseases: [
      { name: 'Bacterial Blight',  type: 'Bacterial', color: 'var(--sky-400)' },
      { name: 'Blast',             type: 'Fungal',    color: 'var(--em-400)' },
      { name: 'Brown Spot',        type: 'Fungal',    color: 'var(--em-400)' },
      { name: 'Tungro Disease',    type: 'Viral',     color: 'var(--gold-300)' },
    ],
    accent: 'var(--em-300)',
    accentLight: 'rgba(78,200,122,0.1)',
  },
  {
    id: 'cassava',
    photo: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80&auto=format&fit=crop',
    label: 'Cassava',
    model: 'Model research ongoing',
    modelSize: 'Coming soon',
    live: false,
    diseases: [
      { name: 'Mosaic Disease (CMD)',    type: 'Viral',     color: 'var(--gold-300)' },
      { name: 'Bacterial Blight (CBB)', type: 'Bacterial', color: 'var(--sky-400)' },
    ],
    accent: 'var(--n-400)',
    accentLight: 'rgba(122,114,104,0.1)',
  },
]

const typeColors = {
  Fungal:    'var(--em-400)',
  Oomycete:  'var(--rust-300)',
  Pest:      'var(--gold-400)',
  Bacterial: 'var(--sky-400)',
  Viral:     'var(--gold-300)',
}

export function CropCards() {
  return (
    <section id="crops" className="section" style={{ background: 'var(--obsidian-2)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--s8)' }}>
          <div className="section-tag">Supported crops</div>
          <h2 className="t-display" style={{ fontSize: 'clamp(32px, 4vw, 52px)', marginBottom: 'var(--s4)' }}>
            Three crops live. More coming.
          </h2>
          <p className="t-body" style={{ maxWidth: 540, margin: '0 auto', color: 'var(--n-300)' }}>
            Each crop runs a dedicated AI model downloaded once and served locally.
            Treatment data sourced from IITA extension manuals — never AI-generated dosages.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--s4)',
        }}>
          {crops.map((crop) => (
            <div key={crop.id} style={{
              position: 'relative',
              borderRadius: 'var(--r5)',
              overflow: 'hidden',
              border: '1px solid var(--glass-edge)',
              background: 'var(--glass-1)',
              backdropFilter: 'var(--blur-md)',
              WebkitBackdropFilter: 'var(--blur-md)',
              transition: 'transform var(--mid) var(--ease-out), border-color var(--mid)',
              opacity: crop.live ? 1 : 0.7,
            }}
              onMouseEnter={e => {
                if (!crop.live) return
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.borderColor = crop.accent.replace('var(--', '').replace(')', '')
                  ? `${crop.accentLight.replace('rgba', 'rgba').replace(/[\d.]+\)$/, '0.35)')}` : 'var(--glass-edge-bright)'
                e.currentTarget.style.borderColor = 'var(--glass-edge-bright)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'var(--glass-edge)'
              }}
            >
              {/* Photo */}
              <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                <img
                  src={crop.photo}
                  alt={crop.label}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    filter: crop.live ? 'brightness(0.75) saturate(0.9)' : 'brightness(0.4) saturate(0.2) grayscale(0.5)',
                    transition: 'transform var(--slow) var(--ease-out)',
                  }}
                />
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to bottom, transparent 40%, rgba(7,10,14,0.85) 100%)',
                }} />

                {/* Live / coming soon badge */}
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  padding: '4px 10px',
                  background: crop.live ? 'rgba(52,160,93,0.25)' : 'rgba(42,64,79,0.6)',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${crop.live ? 'rgba(52,160,93,0.4)' : 'var(--glass-edge)'}`,
                  borderRadius: 99,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {crop.live
                    ? <span className="pulse pulse-em" />
                    : <Clock size={9} color="var(--n-400)" />
                  }
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9,
                    color: crop.live ? 'var(--em-300)' : 'var(--n-400)',
                    letterSpacing: '0.08em',
                  }}>
                    {crop.live ? 'LIVE' : 'SOON'}
                  </span>
                </div>

                {/* Crop label on photo */}
                <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 24, fontWeight: 600,
                    color: 'var(--n-50)',
                    lineHeight: 1,
                  }}>{crop.label}</div>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: 'var(--s4)' }}>
                {/* Model info */}
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 2,
                  padding: 'var(--s3)',
                  background: crop.accentLight,
                  borderRadius: 'var(--r2)',
                  marginBottom: 'var(--s3)',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: crop.accent, fontWeight: 500 }}>
                    {crop.model}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--n-500)' }}>
                    {crop.modelSize}
                  </span>
                </div>

                {/* Disease tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s1)' }}>
                  {crop.diseases.map(d => (
                    <span key={d.name} style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      color: d.color,
                      background: `${d.color.replace('var(--', '').replace(')', '')}08`,
                      padding: '2px 8px',
                      borderRadius: 99,
                      border: `1px solid ${d.color}25`,
                      whiteSpace: 'nowrap',
                    }}>
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div style={{ textAlign: 'center', marginTop: 'var(--s7)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--n-500)' }}>
            Yam · Groundnut · Sorghum · Cowpea · Plantain — research in progress
            <span style={{ color: 'var(--n-600)', marginLeft: 8 }}>·</span>
            <span style={{ color: 'var(--n-600)', marginLeft: 8 }}>No HuggingFace models yet</span>
          </p>
        </div>
      </div>
    </section>
  )
}

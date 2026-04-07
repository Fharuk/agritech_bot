import { useState, useEffect } from 'react'
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Activity, Camera, TrendingUp, MapPin, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import { getAnalytics } from '../services/api'
import { useLang } from '../App'

const COLORS = [
  '#a84820', '#4a9e3f', '#c94040', '#34783b', '#e8960e',
  '#7ab8d4', '#614220', '#9b72cf', '#2b8c6e', '#d4750a',
]

function friendlyName(slug) {
  if (!slug) return 'Unknown'
  return slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function MetricCard({ label, value, sub, icon: Icon, color = 'var(--canopy-400)' }) {
  return (
    <div style={{ padding: 'var(--s4)', background: 'var(--soil-800)',
                  border: '1px solid var(--soil-700)', borderRadius: 'var(--r3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s3)' }}>
        <span className="t-label">{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 'var(--r2)', background: `${color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={color} />
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
                    color: 'var(--ash-50)', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ash-500)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export function Dashboard() {
  const { t } = useLang()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshTime, setRefreshTime] = useState(null)

  const fetchData = async () => {
    setLoading(true); setError(null)
    try {
      const d = await getAnalytics()
      setData(d)
      setRefreshTime(new Date())
    } catch {
      setError('Analytics unavailable — backend may be starting up')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const byDayChart = (data?.diagnoses_by_day || []).slice(-14).map(d => ({
    date: (d.date || '').slice(5), count: d.count,
  }))

  const byCropChart = Object.entries(data?.diagnoses_by_crop || {}).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1), value: v,
  }))

  const topDiseasesChart = (data?.top_diseases || []).slice(0, 7).map((d, i) => ({
    name: friendlyName(d.slug).split(' ').slice(0, 2).join(' '),
    count: d.count, fill: COLORS[i % COLORS.length],
  }))

  const byStateChart = Object.entries(data?.diagnoses_by_state || {})
    .sort((a, b) => b[1] - a[1]).slice(0, 6)

  return (
    <section id="dashboard" className="section" style={{ background: 'var(--soil-950, #0a0804)' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                      flexWrap: 'wrap', gap: 'var(--s4)', marginBottom: 'var(--s7)' }}>
          <div>
            <div className="section-tag">Analytics</div>
            <h2 className="t-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>Disease outbreak data</h2>
            <p className="t-body" style={{ color: 'var(--ash-400)', maxWidth: 520 }}>
              Real-time aggregates from all Terra VI diagnoses. Share with IITA, state ADPs, and agricultural institutions.
            </p>
          </div>
          <button onClick={fetchData} disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'none',
            border: '1px solid var(--soil-600)', borderRadius: 'var(--r2)',
            color: 'var(--ash-400)', cursor: 'pointer', padding: '8px 14px',
            fontSize: 12, fontFamily: 'var(--font-mono)',
          }}>
            {loading
              ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
              : <RefreshCw size={13} />}
            Refresh
          </button>
        </div>

        {error && (
          <div style={{ padding: 'var(--s4)', marginBottom: 'var(--s5)',
                        background: 'rgba(201,64,64,0.08)', border: '1px solid rgba(201,64,64,0.25)',
                        borderRadius: 'var(--r3)', display: 'flex', gap: 'var(--s3)',
                        alignItems: 'center', fontSize: 13, color: 'var(--ash-400)' }}>
            <AlertTriangle size={15} color="var(--danger)" />
            {error} — <span style={{ color: 'var(--ash-500)' }}>charts will populate once diagnoses are made</span>
          </div>
        )}

        {loading && !data && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--s8)',
                        color: 'var(--ash-500)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
            Loading analytics…
          </div>
        )}

        {!loading && (
          <>
            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                          gap: 'var(--s3)', marginBottom: 'var(--s6)' }}>
              <MetricCard label="Total diagnoses"
                value={data?.total_diagnoses != null ? data.total_diagnoses.toLocaleString() : '0'}
                sub={refreshTime ? `Updated ${refreshTime.toLocaleTimeString()}` : ''}
                icon={Camera} />
              <MetricCard label="Avg confidence"
                value={data?.avg_confidence ? `${Math.round(data.avg_confidence * 100)}%` : '—'}
                icon={Activity} color="var(--mango-400)" />
              <MetricCard label="Low confidence rate"
                value={data?.low_confidence_rate != null ? `${Math.round(data.low_confidence_rate * 100)}%` : '—'}
                sub="Retake photo prompts" icon={AlertTriangle} color="#c94040" />
              <MetricCard label="Avg inference time"
                value={data?.avg_inference_ms ? `${Math.round(data.avg_inference_ms)}ms` : '—'}
                sub="Local CPU inference" icon={TrendingUp} color="var(--harmattan-400, #7ab8d4)" />
            </div>

            {/* Daily trend */}
            {byDayChart.length > 0 && (
              <div style={{ background: 'var(--soil-800)', border: '1px solid var(--soil-700)',
                            borderRadius: 'var(--r3)', padding: 'var(--s5)', marginBottom: 'var(--s4)' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
                              color: 'var(--ash-200)', marginBottom: 'var(--s4)' }}>
                  Daily diagnoses — last 14 days
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={byDayChart}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34782b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#34782b" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#7a7063', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#7a7063', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ background: '#1a1510', border: '1px solid #2d2318',
                                            borderRadius: 6, fontSize: 12 }}
                             labelStyle={{ color: '#c9c5b8' }} itemStyle={{ color: '#34782b' }} />
                    <Area type="monotone" dataKey="count" stroke="#34782b" strokeWidth={2}
                          fill="url(#areaGrad)" dot={false} name="Diagnoses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bottom row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)',
                          marginBottom: 'var(--s4)' }}>

              {/* Top diseases */}
              <div style={{ background: 'var(--soil-800)', border: '1px solid var(--soil-700)',
                            borderRadius: 'var(--r3)', padding: 'var(--s5)' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
                              color: 'var(--ash-200)', marginBottom: 'var(--s4)' }}>
                  Top diseases detected
                </div>
                {topDiseasesChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topDiseasesChart} layout="vertical" margin={{ left: 0, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#7a7063', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#9b9589', fontSize: 11 }}
                             axisLine={false} tickLine={false} width={90} />
                      <Tooltip contentStyle={{ background: '#1a1510', border: '1px solid #2d2318',
                                              borderRadius: 6, fontSize: 12 }}
                               cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="count" name="Cases" radius={[0, 3, 3, 0]}>
                        {topDiseasesChart.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: 'var(--ash-500)', fontSize: 13 }}>
                    No diagnoses yet — run a diagnosis to see data here
                  </div>
                )}
              </div>

              {/* Crop + state */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>

                <div style={{ background: 'var(--soil-800)', border: '1px solid var(--soil-700)',
                              borderRadius: 'var(--r3)', padding: 'var(--s5)', flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
                                color: 'var(--ash-200)', marginBottom: 'var(--s4)' }}>
                    By crop
                  </div>
                  {byCropChart.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)' }}>
                      <ResponsiveContainer width={100} height={100}>
                        <PieChart>
                          <Pie data={byCropChart} cx={45} cy={45} innerRadius={28} outerRadius={45}
                               dataKey="value" paddingAngle={3}>
                            {byCropChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)', flex: 1 }}>
                        {byCropChart.map((c, i) => {
                          const total = byCropChart.reduce((s, x) => s + x.value, 0)
                          const pct = total ? Math.round(c.value / total * 100) : 0
                          return (
                            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0,
                                            background: COLORS[i % COLORS.length] }} />
                              <span style={{ fontSize: 12, color: 'var(--ash-300)', flex: 1 }}>{c.name}</span>
                              <span style={{ fontSize: 11, color: 'var(--ash-500)', fontFamily: 'var(--font-mono)' }}>
                                {pct}%
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--ash-500)', fontSize: 13 }}>No data yet</div>
                  )}
                </div>

                {byStateChart.length > 0 && (
                  <div style={{ background: 'var(--soil-800)', border: '1px solid var(--soil-700)',
                                borderRadius: 'var(--r3)', padding: 'var(--s5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--s3)' }}>
                      <MapPin size={13} color="var(--canopy-400)" />
                      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
                                     color: 'var(--ash-200)' }}>By state (top 6)</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                      {byStateChart.map(([state, count]) => {
                        const max = byStateChart[0][1]
                        return (
                          <div key={state}>
                            <div style={{ display: 'flex', justifyContent: 'space-between',
                                          fontSize: 11, marginBottom: 3 }}>
                              <span style={{ color: 'var(--ash-400)' }}>{state}</span>
                              <span style={{ color: 'var(--ash-500)', fontFamily: 'var(--font-mono)' }}>{count}</span>
                            </div>
                            <div style={{ height: 3, background: 'var(--soil-700)', borderRadius: 2 }}>
                              <div style={{ height: '100%', background: 'var(--canopy-600)',
                                            borderRadius: 2, width: `${(count / max) * 100}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p style={{ fontSize: 11, color: 'var(--ash-500)', fontFamily: 'var(--font-mono)',
                        textAlign: 'center', marginTop: 'var(--s4)' }}>
              Live data from Terra VI diagnoses · Refresh for latest
            </p>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  )
}

import { useState, createContext, useContext } from 'react'
import { Navbar }           from './components/Navbar'
import { Hero }             from './components/Hero'
import { NigeriaStats }     from './components/NigeriaStats'
import { HowItWorks }       from './components/HowItWorks'
import { CropCards }        from './components/CropCards'
import { DiagnoseTool }     from './components/DiagnoseTool'
import { DiseaseLibrary }   from './components/DiseaseLibrary'
import { DiagnosisHistory } from './components/DiagnosisHistory'
import { Dashboard }        from './components/Dashboard'
import { Pricing }          from './components/Pricing'
import { Footer }           from './components/Footer'
import { useTranslation }   from './i18n/translations'

// ── Language context — used by any component that needs translated strings ────
export const LangContext = createContext({ lang: 'en', t: (k) => k, setLang: () => {} })
export const useLang = () => useContext(LangContext)

const SUPPORTED_LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ha', label: 'Hausa',   flag: '🇳🇬' },
  { code: 'ig', label: 'Igbo',    flag: '🇳🇬' },
  { code: 'yo', label: 'Yorùbá',  flag: '🇳🇬' },
]

export default function App() {
  const [lang, setLang] = useState(() => {
    // Persist language preference in localStorage
    try { return localStorage.getItem('terra-vi-lang') || 'en' } catch { return 'en' }
  })

  const t = useTranslation(lang)

  const handleSetLang = (code) => {
    setLang(code)
    try { localStorage.setItem('terra-vi-lang', code) } catch {}
  }

  return (
    <LangContext.Provider value={{ lang, t, setLang: handleSetLang, langs: SUPPORTED_LANGS }}>
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <Hero />
        <NigeriaStats />
        <HowItWorks />
        <CropCards />
        <DiagnoseTool />
        <DiagnosisHistory />
        <DiseaseLibrary />
        <Dashboard />
        <Pricing />
        <Footer />
      </div>
    </LangContext.Provider>
  )
}

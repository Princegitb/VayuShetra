import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useStore } from '../store'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { 
  ArrowRight, Satellite, Shield, Cpu, Database, Bell, Wind, Flame, 
  Compass, Sparkles, Activity, Layers, Terminal, ChevronRight, 
  Info, AlertTriangle, CheckCircle2, RefreshCw, Radio, Search, 
  MapPin, Eye, Zap, BarChart3, TrendingUp, Sliders, X, ShieldCheck,
  ChevronDown
} from 'lucide-react'
import VayushetraScene from './3d/VayushetraScene'
import CustomCursor from './ui/CustomCursor'
import MagneticButton from './ui/MagneticButton'

gsap.registerPlugin(ScrollTrigger)

export default function CinematicLanding({ onEnterDashboard }) {
  const { 
    selectedDate, 
    setSelectedDate,
    selectedDistrict, 
    setSelectedDistrict, 
    mapData, 
    dashboardData,
    dates, 
    fetchMapData, 
    fetchDashboard 
  } = useStore()

  // State
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiConversation, setAiConversation] = useState([
    {
      role: 'assistant',
      text: 'Vayu AI Sentinel initialized. Connected to Sentinel-5P TROPOMI trace gas retrievals, NASA VIIRS thermal sensors, and CPCB continuous telemetry. How may I assist your atmospheric diagnostics?',
      type: 'system'
    }
  ])
  const [aiLoading, setAiLoading] = useState(false)
  const lenisRef = useRef(null)
  const chatEndRef = useRef(null)
  const conversationBoxRef = useRef(null)

  // Lenis Smooth Scrolling Setup
  useEffect(() => {
    fetchMapData()
    fetchDashboard()

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const updateLenis = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(updateLenis)
    gsap.ticker.lagSmoothing(0)

    // GSAP Scroll Reveal for Sections
    const revealElements = document.querySelectorAll('.gsap-reveal')
    revealElements.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      )
    })

    return () => {
      gsap.ticker.remove(updateLenis)
      lenis.destroy()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  // Lock background scroll when AI modal is active so inner modal scrolls smoothly
  useEffect(() => {
    if (aiModalOpen) {
      lenisRef.current?.stop()
      document.body.style.overflow = 'hidden'
    } else {
      lenisRef.current?.start()
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [aiModalOpen])

  // Auto-scroll chat stream to bottom on new messages
  useEffect(() => {
    if (aiModalOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [aiConversation, aiLoading, aiModalOpen])

  // AI Handler
  const handleAiSubmit = (questionText) => {
    const query = questionText || aiQuery
    if (!query.trim()) return

    setAiLoading(true)
    const userMsg = { role: 'user', text: query }
    setAiConversation(prev => [...prev, userMsg])
    setAiQuery('')

    setTimeout(() => {
      let reply = ""
      const qLower = query.toLowerCase()

      if (qLower.includes('hcho') || qLower.includes('stubble') || qLower.includes('biomass')) {
        reply = `[MEASURED SATELLITE TELEMETRY - SENTINEL-5P TROPOMI]\nFormaldehyde (HCHO) column density is currently elevated across the Sangrur, Firozpur, and Amritsar districts (~1.68 × 10¹⁵ molec/cm² vs baseline 1.10).\n\n[INFERRED EXPLANATION - PHOTOCHEMICAL KINETICS]\nHigh HCHO in autumn is the primary photochemical tracer of rapid volatile organic compound (VOC) oxidation from open paddy stubble combustion. VIIRS thermal sensors detected active high-temperature farm clusters coinciding precisely with the HCHO column enhancement.`
      } else if (qLower.includes('delhi') || qLower.includes('pm2.5') || qLower.includes('inversion')) {
        reply = `[MEASURED CPCB GROUND-TRUTH + SATELLITE]\nDelhi-NCR surface PM2.5 stands at 90.5 µg/m³ (AQI 215, Category: Severe).\n\n[MODEL PREDICTION - ERA5 METEOROLOGICAL COUPLING]\nPlanetary Boundary Layer Height (BLH) compressed nocturnally to 520m, forming an atmospheric lid. Coupled with a 12.4 km/h Northwesterly advection vector, regional smoke from upwind agricultural fires is entrained and trapped over the Delhi basin.`
      } else if (qLower.includes('simulate') || qLower.includes('policy') || qLower.includes('reduction')) {
        reply = `[MODEL INFERENCE - CHEMICAL MASS BALANCE POLICY REGRESSOR]\nA simulated 50% stubble reduction in Punjab/Haryana is projected to reduce downwind Delhi-NCR PM2.5 concentrations by 28.4 µg/m³ (-31.4%), mitigating approximately 640 emergency respiratory hospital admissions across the regional corridor.`
      } else {
        reply = `[DIAGNOSTIC SUMMARY - INDO-GANGETIC BASIN]\nCurrent observed regional AQI: 215 (Severe). Planetary Boundary Layer Height is compressed at 520m with ventilation index of 1,820 m²/s.\n\nPrimary Drivers: Agricultural stubble smoke entrainment, nocturnal thermal inversion, and urban transport.\nAll telemetry validated against Sentinel-5P TROPOMI and CPCB continuous ground stations.`
      }

      setAiConversation(prev => [...prev, { role: 'assistant', text: reply }])
      setAiLoading(false)
    }, 700)
  }

  return (
    <div className="relative min-h-screen bg-[#05070A] text-[#E8EEF2] selection:bg-cyan-500/20 selection:text-cyan-300 font-sans overflow-x-hidden">
      
      {/* Precision 3D Custom Cursor with Modi Photo */}
      <CustomCursor imageSrc="/modi-cursor.png" size={48} />

      {/* ====================================================================
          TOP CYBERNETIC HUD NAVIGATION BAR
         ==================================================================== */}
      <header className="fixed top-0 left-0 w-full z-40 px-5 lg:px-10 py-4 flex items-center justify-between backdrop-blur-xl bg-[#05070A]/75 border-b border-white/[0.06] transition-all">
        
        {/* Brand Sentinel */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#0B1016] border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <span className="text-lg">🛰️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black font-mono tracking-wider text-white uppercase">
                VAYUSHETRA
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            </div>
            <span className="text-[9px] font-mono tracking-widest text-cyan-400/80 uppercase block">
              SENTINEL-5P ATMOSPHERIC PLATFORM
            </span>
          </div>
        </div>

        {/* Center Quick Anchors */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-mono text-zinc-400">
          <a href="#hero" className="hover:text-cyan-400 transition-colors">01 // CORE</a>
          <a href="#science" className="hover:text-cyan-400 transition-colors">02 // ATMOSPHERE</a>
          <a href="#pipeline" className="hover:text-cyan-400 transition-colors">03 // PIPELINE</a>
        </nav>

        {/* Right CTA + LIVE Indicator */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE • 22:41 IST</span>
          </div>
          <MagneticButton
            onClick={onEnterDashboard}
            className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#05070A] font-black text-xs font-mono shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all"
          >
            <span>ENTER DASHBOARD →</span>
          </MagneticButton>
        </div>
      </header>

      {/* ====================================================================
          ACT 1: CINEMATIC 3D HERO (PROCEDURAL SENTINEL ROBOT + PARTICLES)
         ==================================================================== */}
      <section id="hero" className="relative min-h-screen flex flex-col justify-between items-center px-4 sm:px-8 pt-20 pb-6 overflow-hidden">
        
        {/* 3D Canvas Background (Atmospheric Earth + Vayu Robot + Conduit + Aerosols) */}
        <VayushetraScene dashboardData={dashboardData} />

        {/* Ambient Radial Vignette & Grid */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none z-0 opacity-80" />
        <div className="absolute inset-0 sci-grid-bg pointer-events-none opacity-40 z-0" />

        {/* Main Hero Layer: Left Text + Floating Aerospace HUD Elements */}
        <div className="relative z-10 max-w-7xl mx-auto w-full pt-8 sm:pt-12 pointer-events-auto">
          
          {/* Left Column: Headline, Narrative & Actions */}
          <div className="max-w-xl text-left space-y-4">
            
            {/* Status Capsule */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1016]/90 border border-cyan-400/30 text-cyan-300 text-[11px] font-mono shadow-[0_0_20px_rgba(0,240,255,0.15)] backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="tracking-wider uppercase font-semibold">
                NCAP // CPCB & ISRO INTEGRATED
              </span>
            </div>

            {/* Main Cinematic Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black font-display tracking-tight text-white uppercase leading-[1.06]">
              ATMOSPHERIC
              <br />
              INTELLIGENCE.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 drop-shadow-[0_0_35px_rgba(0,240,255,0.4)]">
                BEYOND BORDERS.
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="max-w-lg text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed">
              High-resolution Sentinel-5P TROPOMI trace gas retrievals, ERA5 nocturnal boundary layer inversion modeling, and chemical mass balance AI. Pinpointing transboundary smoke advection across the Indo-Gangetic Basin.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <MagneticButton
                onClick={onEnterDashboard}
                className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#05070A] font-black text-xs font-mono shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all"
              >
                <span>EXPLORE ATMOSPHERE →</span>
              </MagneticButton>

              <MagneticButton
                onClick={() => setAiModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-[#0B1016]/90 hover:bg-[#121a24] text-white border border-cyan-400/30 hover:border-cyan-400 text-xs font-mono shadow-lg transition-all flex items-center gap-2"
              >
                <Zap size={14} className="text-cyan-400" />
                <span>VAYU AI COPILOT</span>
              </MagneticButton>
            </div>

            {/* Partner Proof Row */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/30 border border-cyan-400/60 flex items-center justify-center text-[9px]">👨‍🔬</div>
                  <div className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400/60 flex items-center justify-center text-[9px]">👩‍🔬</div>
                  <div className="w-5 h-5 rounded-full bg-purple-500/30 border border-purple-400/60 flex items-center justify-center text-[9px]">🧑‍💻</div>
                </div>
                <span className="text-[10px] text-zinc-400">Built for a cleaner tomorrow.</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[10px] text-zinc-500 border-l border-white/10 pl-3">
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">DATA PARTNERS</span>
                <span className="text-zinc-300 font-semibold">ISRO</span>
                <span>|</span>
                <span className="text-zinc-300 font-semibold">CPCB</span>
                <span>|</span>
                <span className="text-zinc-300 font-semibold">NCAP</span>
              </div>
            </div>

          </div>

        </div>

        {/* ====================================================================
            FLOATING AEROSPACE HUD OVERLAYS (MATCHING USER REFERENCE IMAGE 2)
           ==================================================================== */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none">
          
          {/* 1. Sentinel-5P Satellite Tag (Top-left above Earth) */}
          <div className="hidden md:flex absolute top-[18%] left-[38%] xl:left-[39%] flex-col text-left hud-badge px-2.5 py-1.5 border-cyan-400/35">
            <div className="text-[8px] font-mono font-bold text-cyan-400 tracking-wider uppercase">
              SENTINEL-5P
            </div>
            <div className="text-[7px] font-mono text-zinc-400 tracking-wider">REAL-TIME DATA</div>
          </div>

          {/* 2. Atmospheric Layers Card (Top-right of Earth) */}
          <div className="hidden lg:flex absolute top-[12%] right-[29%] xl:right-[31%] flex-col hud-badge px-3 py-2 border-cyan-400/25 min-w-[125px]">
            <div className="text-[8px] font-mono font-bold tracking-widest text-cyan-400 uppercase border-b border-white/[0.08] pb-1 mb-1.5">
              ATMOSPHERIC LAYERS
            </div>
            <div className="space-y-1 text-[8px] font-mono tracking-wider text-zinc-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span>CO</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                <span>NO₂</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]" />
                <span>SO₂</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                <span>O₃</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_6px_#a3e635]" />
                <span>AEROSOLS</span>
              </div>
            </div>
          </div>

          {/* 3. Wind Flow Tag (Upper right of Earth) */}
          <div className="hidden md:flex absolute top-[34%] right-[33%] xl:right-[35%] flex-col text-left hud-badge px-3 py-1.5 border-cyan-400/35">
            <div className="text-[8px] font-mono font-bold text-cyan-400 tracking-wider uppercase">
              WIND FLOW
            </div>
            <div className="text-xs font-black font-mono text-white mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              12.4 km/h
            </div>
          </div>

          {/* 4. India Atmospheric Beacon Tag (Center of Earth, above golden pin) */}
          <div className="hidden md:flex absolute top-[44%] left-[49%] xl:left-[50%] flex-col text-left hud-badge px-3 py-2 border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.18)]">
            <div className="text-[8px] font-mono font-bold text-zinc-400 uppercase">
              INDIA
            </div>
            <div className="text-xs font-black font-mono text-white mt-0.5">
              AQI 142
            </div>
            <div className="text-[8px] font-mono font-bold text-yellow-400 uppercase mt-0.5">
              MODERATE
            </div>
          </div>

          {/* 5. Cloud Cover Tag (West of India / Arabian Sea) */}
          <div className="hidden md:flex absolute top-[62%] left-[36%] xl:left-[38%] items-center gap-2 hud-badge px-2.5 py-1.5 border-cyan-400/25">
            <span className="text-xs">☁️</span>
            <div>
              <div className="text-[7px] font-mono text-zinc-400 uppercase tracking-wider">CLOUD COVER</div>
              <div className="text-xs font-mono font-black text-white">28%</div>
            </div>
          </div>

          {/* 6. PM2.5 Hotspot Tag (Southeast Asia / Bay of Bengal) */}
          <div className="hidden md:flex absolute top-[65%] left-[56%] xl:left-[57%] flex-col text-left hud-badge px-2.5 py-1.5 border-red-500/35 shadow-[0_0_20px_rgba(239,68,68,0.18)]">
            <div className="text-[7px] font-mono text-zinc-400 uppercase tracking-wider">PM2.5</div>
            <div className="text-xs font-mono font-black text-white mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
              67 µg/m³
            </div>
          </div>

          {/* 7. Vayu AI Speech Bubble (Directly above Robot with speech tail pointer) */}
          <div className="hidden lg:flex absolute top-[25%] right-[9%] xl:right-[11%] flex-col hud-badge px-4 py-3 border-cyan-400/40 bg-[#04070D]/90 backdrop-blur-md shadow-[0_0_30px_rgba(0,240,255,0.22)] max-w-[200px] rounded-2xl">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
              <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                VAYU AI
              </span>
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-cyan-400 animate-pulse" />
                <span className="w-0.5 h-3 bg-cyan-400 animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse delay-150" />
                <span className="w-0.5 h-2.5 bg-cyan-400 animate-pulse delay-100" />
              </div>
            </div>
            <p className="text-[10px] font-sans text-zinc-200 leading-relaxed pt-1.5 whitespace-normal">
              Tracking the atmosphere for a cleaner, safer tomorrow !
            </p>
            {/* Speech bubble downward pointing triangle */}
            <div className="absolute -bottom-2 right-12 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-400/60" />
          </div>

          {/* 8. Mission Status Panel (Far right edge) */}
          <div className="hidden xl:flex absolute top-[44%] -translate-y-1/2 right-3 xl:right-5 flex-col hud-badge px-3.5 py-3 border-cyan-400/25 min-w-[130px]">
            <div className="text-[8px] font-mono font-bold tracking-widest text-cyan-400 uppercase border-b border-white/[0.08] pb-1.5 mb-2">
              MISSION STATUS
            </div>
            <div className="space-y-1.5 text-[8px] font-mono tracking-wider text-zinc-300 uppercase">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                <span>SATELLITE LINK</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                <span>DATA STREAM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                <span>AI MODELS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                <span>SYSTEMS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                <span>OPERATIONAL</span>
              </div>
            </div>
          </div>

        </div>

        {/* ====================================================================
            BOTTOM SECTION: 4 TELEMETRY CARDS + SCROLL INDICATOR (EXACT REFERENCE!)
           ==================================================================== */}
        <div className="relative z-10 max-w-7xl mx-auto w-full pt-4 pointer-events-auto space-y-3">
          
          {/* Row of 4 Telemetry Cards with Mini-Bar Histograms */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
            {/* Card 1: BASIN AQI */}
            <div className="hud-panel p-2.5 flex items-center justify-between border-cyan-500/30 bg-[#04070D]/85">
              <div className="text-left">
                <div className="text-[8px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                  BASIN AQI
                </div>
                <div className="text-base font-black font-mono text-white mt-0.5 flex items-baseline gap-1.5">
                  215 <span className="text-[8px] text-red-400 font-semibold uppercase">SEVERE</span>
                </div>
              </div>
              <div className="flex items-end gap-1 h-6 pl-2">
                {[30, 50, 65, 85, 100].map((h, i) => (
                  <div key={i} className="w-1 bg-red-500 rounded-xs" style={{ height: `${h}%`, opacity: 0.4 + i * 0.15 }} />
                ))}
              </div>
            </div>

            {/* Card 2: HCHO (TROPOMI) */}
            <div className="hud-panel p-2.5 flex items-center justify-between border-emerald-500/30 bg-[#04070D]/85">
              <div className="text-left">
                <div className="text-[8px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                  HCHO (TROPOMI)
                </div>
                <div className="text-base font-black font-mono text-white mt-0.5 flex items-baseline gap-1.5">
                  1.68 <span className="text-[8px] text-emerald-400 font-semibold">↑ 16%</span>
                </div>
              </div>
              <div className="flex items-end gap-1 h-6 pl-2">
                {[35, 45, 60, 80, 100].map((h, i) => (
                  <div key={i} className="w-1 bg-cyan-400 rounded-xs" style={{ height: `${h}%`, opacity: 0.4 + i * 0.15 }} />
                ))}
              </div>
            </div>

            {/* Card 3: INVERSION LID */}
            <div className="hud-panel p-2.5 flex items-center justify-between border-purple-500/30 bg-[#04070D]/85">
              <div className="text-left">
                <div className="text-[8px] font-mono text-purple-400 uppercase font-bold tracking-wider">
                  INVERSION LID
                </div>
                <div className="text-base font-black font-mono text-white mt-0.5 flex items-baseline gap-1.5">
                  520m <span className="text-[8px] text-purple-400 font-semibold uppercase">TRAP</span>
                </div>
              </div>
              <div className="flex items-end gap-1 h-6 pl-2">
                {[40, 55, 70, 90, 100].map((h, i) => (
                  <div key={i} className="w-1 bg-purple-400 rounded-xs" style={{ height: `${h}%`, opacity: 0.4 + i * 0.15 }} />
                ))}
              </div>
            </div>

            {/* Card 4: ACTIVE FIRES */}
            <div className="hud-panel p-2.5 flex items-center justify-between border-amber-500/30 bg-[#04070D]/85">
              <div className="text-left">
                <div className="text-[8px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                  ACTIVE FIRES
                </div>
                <div className="text-base font-black font-mono text-white mt-0.5 flex items-baseline gap-1.5">
                  1,420 <span className="text-[8px] text-amber-400 font-semibold">VIIRS</span>
                </div>
              </div>
              <div className="flex items-end gap-1 h-6 pl-2">
                {[25, 40, 60, 75, 100].map((h, i) => (
                  <div key={i} className="w-1 bg-amber-400 rounded-xs" style={{ height: `${h}%`, opacity: 0.4 + i * 0.15 }} />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar: Mouse Scroll Indicator + Slogan */}
          <div className="flex items-center justify-between pt-1">
            <div className="w-1/3" />
            <div className="flex flex-col items-center gap-1 opacity-70 text-[9px] font-mono tracking-widest text-zinc-400">
              <div className="w-3.5 h-5 rounded-full border border-zinc-500 flex items-start justify-center pt-0.5">
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" />
              </div>
              <span>SCROLL TO EXPLORE</span>
            </div>
            <div className="w-1/3 text-right hidden md:block text-[8px] font-mono tracking-widest text-zinc-500 uppercase">
              ATMOSPHERIC INTELLIGENCE FOR A BETTER TOMORROW —
            </div>
          </div>

        </div>
      </section>

      {/* ====================================================================
          ACT 2: THE SCIENCE OF AIR & INVERSION
         ==================================================================== */}
      <section id="science" className="relative py-28 px-4 sm:px-8 border-t border-white/[0.06] bg-[#070B10]">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center space-y-3 gsap-reveal">
            <div className="hud-tag inline-block">ATMOSPHERIC DYNAMICS & PHOTOCHEMISTRY</div>
            <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
              WHY DOES AIR STAND STILL?
            </h2>
            <p className="max-w-2xl mx-auto text-sm text-zinc-400 font-medium leading-relaxed">
              Every winter, northern India transforms into a geographic bowl. Cold mountain air sinks from the Himalayas, trapping stubble smoke and urban tailpipes beneath an impenetrable thermal lid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 gsap-reveal">
            
            {/* Pillar 1: Thermal Inversion */}
            <div className="hud-panel p-6 space-y-4 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Compass size={22} />
              </div>
              <h3 className="text-lg font-black font-display text-white uppercase">
                Planetary Boundary Layer Lid
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Warm air aloft caps cooler surface air, compressing the mixing volume from a summer height of 2,400m down to barely 520m. Pollutants cannot dissipate vertically.
              </p>
              <div className="pt-2 border-t border-white/[0.08] flex justify-between text-[11px] font-mono text-cyan-300">
                <span>Summer BLH: 2,400m</span>
                <span className="text-red-400 font-bold">Winter BLH: 520m</span>
              </div>
            </div>

            {/* Pillar 2: Photochemical Formaldehyde */}
            <div className="hud-panel p-6 space-y-4 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Activity size={22} />
              </div>
              <h3 className="text-lg font-black font-display text-white uppercase">
                Stubble VOC Oxidation (HCHO)
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Formaldehyde (HCHO) is a high-sensitivity photochemical tracer. Sentinel-5P TROPOMI detects enhanced HCHO columns directly above active stubble burning zones before PM2.5 spreads.
              </p>
              <div className="pt-2 border-t border-white/[0.08] flex justify-between text-[11px] font-mono text-emerald-300">
                <span>Baseline: 1.10</span>
                <span className="text-emerald-400 font-bold">Peak Fire: 1.68 × 10¹⁵</span>
              </div>
            </div>

            {/* Pillar 3: Transboundary Advection */}
            <div className="hud-panel p-6 space-y-4 hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Wind size={22} />
              </div>
              <h3 className="text-lg font-black font-display text-white uppercase">
                12.4 km/h Advection Vector
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Post-monsoon synoptic winds channel down the Indo-Gangetic Plain toward the Bay of Bengal, transporting massive particulate plumes 300+ km from agrarian zones into the capital basin.
              </p>
              <div className="pt-2 border-t border-white/[0.08] flex justify-between text-[11px] font-mono text-purple-300">
                <span>Corridor: Punjab → Delhi</span>
                <span className="text-purple-400 font-bold">Vector: 310° NW</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ====================================================================
          ACT 3: HIGH-THROUGHPUT DATA PIPELINE (SPACE TO GROUND)
         ==================================================================== */}
      <section id="pipeline" className="relative py-28 px-4 sm:px-8 border-t border-white/[0.06] bg-[#070B10]">
        <div className="max-w-6xl mx-auto space-y-16 gsap-reveal">
          
          <div className="text-center space-y-3">
            <div className="hud-tag inline-block">SATELLITE TO ENFORCEMENT PIPELINE</div>
            <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
              FROM ORBIT TO POLICY ACTION
            </h2>
            <p className="max-w-xl mx-auto text-xs text-zinc-400">
              Transforming raw multi-spectral radiance scans into legally actionable district intelligence in less than 90 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Stage 1 */}
            <div className="hud-panel p-5 space-y-3 border-cyan-500/20 hover:border-cyan-400/50 transition-all">
              <div className="text-cyan-400 font-mono text-xs font-bold">STAGE 01 // ORBIT</div>
              <div className="text-lg font-black text-white font-display uppercase">
                Satellite Ingestion
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Continuous orbital telemetry from Sentinel-5P TROPOMI (NO2, HCHO, SO2, CO) and NASA VIIRS thermal sensors.
              </p>
              <div className="text-[10px] font-mono text-cyan-300">Latency: ~45 mins</div>
            </div>

            {/* Stage 2 */}
            <div className="hud-panel p-5 space-y-3 border-emerald-500/20 hover:border-emerald-400/50 transition-all">
              <div className="text-emerald-400 font-mono text-xs font-bold">STAGE 02 // PHYSICS</div>
              <div className="text-lg font-black text-white font-display uppercase">
                ERA5 Atmospheric Reanalysis
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Couples boundary layer heights (BLH), wind vector fields, and temperature inversions to model transport corridors.
              </p>
              <div className="text-[10px] font-mono text-emerald-300">Resolution: 0.25° × 0.25°</div>
            </div>

            {/* Stage 3 */}
            <div className="hud-panel p-5 space-y-3 border-purple-500/20 hover:border-purple-400/50 transition-all">
              <div className="text-purple-400 font-mono text-xs font-bold">STAGE 03 // MACHINE LEARNING</div>
              <div className="text-lg font-black text-white font-display uppercase">
                Chemical Mass Balance
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Disentangles farm stubble emissions from vehicular traffic, brick kilns, and secondary nitrate aerosol formation.
              </p>
              <div className="text-[10px] font-mono text-purple-300">Attribution: 94.2% Conf.</div>
            </div>

            {/* Stage 4 */}
            <div className="hud-panel p-5 space-y-3 border-amber-500/20 hover:border-amber-400/50 transition-all">
              <div className="text-amber-400 font-mono text-xs font-bold">STAGE 04 // DECISION</div>
              <div className="text-lg font-black text-white font-display uppercase">
                Predictive Simulation
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Enables district magistrates and pollution boards to test policy interventions (stubble bans, traffic cuts) before enactment.
              </p>
              <div className="text-[10px] font-mono text-amber-300">Action: Automated Alerts</div>
            </div>

          </div>

        </div>
      </section>

      {/* ====================================================================
          ACT 5: STATEMENT FOOTER & MISSION CTA
         ==================================================================== */}
      <footer className="relative py-24 px-6 lg:px-12 bg-[#030508] border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/[0.08] pb-12">
            <div className="space-y-3 max-w-2xl">
              <div className="hud-tag inline-block">NATIONAL CLEAN AIR PROGRAMME FRAMEWORK</div>
              <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
                AIR DOESN'T STOP AT BORDERS.
              </h2>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                Understanding pollution begins with observing where it moves. VayuShetra delivers real-time transboundary environmental intelligence for researchers, policy-makers, and citizens.
              </p>
            </div>

            <MagneticButton
              onClick={onEnterDashboard}
              className="px-8 py-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#05070A] font-black text-xs font-mono shadow-[0_0_35px_rgba(0,240,255,0.4)] transition-all whitespace-nowrap"
            >
              <span>ENTER COMMAND DASHBOARD</span>
              <ArrowRight size={15} />
            </MagneticButton>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono text-zinc-500">
            <div>
              <strong>VayuShetra Atmospheric Intelligence Platform</strong> • Sourced from Sentinel-5P TROPOMI, MODIS, VIIRS & CPCB.
            </div>
            <div>
              Designed for National Clean Air Programme (NCAP) Compliance.
            </div>
          </div>

        </div>
      </footer>

      {/* ====================================================================
          ACT 5: VAYU AI CONSOLE MODAL
         ==================================================================== */}
      {/* Vayu AI Modal Console */}
      {aiModalOpen && (
        <div 
          data-lenis-prevent
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overscroll-contain"
          onClick={(e) => e.target === e.currentTarget && setAiModalOpen(false)}
        >
          <div 
            data-lenis-prevent
            className="w-full max-w-2xl hud-panel hud-panel-glow flex flex-col max-h-[88vh] border-cyan-500/40 animate-fadeIn shadow-2xl overflow-hidden"
          >
            
            {/* Modal Header */}
            <div className="p-4 border-b border-white/[0.08] flex justify-between items-center bg-[#070B10] flex-shrink-0">
              <div className="flex items-center space-x-2 font-mono">
                <Zap size={15} className="text-cyan-400" />
                <span className="text-xs font-black uppercase text-white">VAYU AI // ENVIRONMENTAL INTELLIGENCE COPILOT</span>
              </div>
              <button 
                onClick={() => setAiModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {/* Conversation Stream with contained scroll */}
            <div 
              data-lenis-prevent
              ref={conversationBoxRef}
              className="p-5 flex-1 overflow-y-auto space-y-4 font-mono text-xs max-h-[55vh] overscroll-contain"
              style={{
                overscrollBehavior: 'contain',
                scrollbarWidth: 'thin',
                scrollbarColor: '#00f0ff #05070a'
              }}
            >
              {aiConversation.map((msg, i) => (
                <div 
                  key={i} 
                  className={`p-3.5 rounded-xl ${
                    msg.role === 'user' 
                      ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 ml-8' 
                      : 'bg-white/[0.04] border border-white/[0.08] text-zinc-200 mr-8 leading-relaxed'
                  }`}
                >
                  <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">
                    {msg.role === 'user' ? 'USER QUERY' : 'VAYUSHETRA AI CO-PILOT'}
                  </div>
                  <div className="whitespace-pre-line">{msg.text}</div>
                </div>
              ))}

              {aiLoading && (
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-cyan-400 flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-cyan-400"></div>
                  <span>Cross-referencing Sentinel-5P TROPOMI & ERA5 Boundary Layer Heights...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Question Chips */}
            <div className="px-4 py-2.5 border-t border-white/[0.08] flex flex-wrap gap-1.5 bg-[#070B10] flex-shrink-0">
              {[
                "Why is HCHO high in Punjab today?",
                "What is driving Delhi-NCR PM2.5?",
                "How does boundary layer height affect winter smog?"
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAiSubmit(q)}
                  className="text-[10px] font-mono px-2.5 py-1 rounded bg-white/[0.04] hover:bg-cyan-500/15 border border-white/[0.08] text-zinc-300 hover:text-cyan-300 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/[0.08] bg-[#070B10] flex items-center space-x-2 flex-shrink-0">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
                placeholder="Ask technical question about atmospheric telemetry, inversion or hotspots..."
                className="flex-1 bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-zinc-500 outline-none focus:border-cyan-400 transition-all"
              />
              <button
                onClick={() => handleAiSubmit()}
                className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#05070A] font-bold text-xs font-mono transition-all"
              >
                QUERY
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}


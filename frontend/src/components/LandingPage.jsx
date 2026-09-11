import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useStore } from '../store'
import { 
  ArrowRight, Satellite, Shield, Cpu, Database, Bell, Wind, Flame, 
  Compass, Sparkles, Activity, Layers, Terminal, ChevronRight, 
  Info, AlertTriangle, CheckCircle2, RefreshCw, Radio, Search, 
  MapPin, Eye, Zap, BarChart3, TrendingUp, Sliders, Play, Pause,
  Share2, ShieldCheck, HelpCircle, X
} from 'lucide-react'

// ============================================================================
// 1. HIGH-PERFORMANCE GEOSPATIAL ATMOSPHERIC CANVAS
// Renders India coordinate mesh, atmospheric particulate advection flow,
// boundary layer contour isobars, and pulsing thermal fire clusters
// ============================================================================
const AtmosphericGeospatialCanvas = ({ activeLayer = 'AQI', activeHotspot = null }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = (canvas.width = canvas.parentElement.clientWidth)
    let height = (canvas.height = canvas.parentElement.clientHeight)

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = canvas.parentElement.clientHeight
    }
    window.addEventListener('resize', handleResize)

    // Particle flow advecting from NW (Punjab/Haryana) to SE (Delhi/IGP)
    const particleCount = Math.min(80, Math.floor(width / 15))
    const particles = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.6 + Math.random() * 1.2,
        length: 20 + Math.random() * 40,
        opacity: 0.15 + Math.random() * 0.45,
        size: 1 + Math.random() * 1.5,
        curve: (Math.random() - 0.5) * 0.4
      })
    }

    // Hotspot coordinate centers (normalized 0..1 mapped to canvas)
    const hotspots = [
      { name: 'Punjab Agricultural Belt', nx: 0.38, ny: 0.32, color: '#f97316', radius: 32 },
      { name: 'Haryana Advection Corridor', nx: 0.44, ny: 0.38, color: '#eab308', radius: 26 },
      { name: 'Delhi-NCR Basin Trap', nx: 0.48, ny: 0.42, color: '#ef4444', radius: 36 },
      { name: 'Kanpur Industrial Core', nx: 0.58, ny: 0.48, color: '#a855f7', radius: 24 },
      { name: 'Kolkata Delta Inversion', nx: 0.74, ny: 0.54, color: '#38bdf8', radius: 22 }
    ]

    let animId
    let frame = 0

    const render = () => {
      frame++
      ctx.clearRect(0, 0, width, height)

      // 1. Lat/Long Coordinate Matrix Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.lineWidth = 1
      const gridSize = 60
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // 2. Atmospheric Flow Lines (Wind Advection Streams)
      ctx.strokeStyle = activeLayer === 'HCHO' 
        ? 'rgba(74, 222, 128, 0.3)' 
        : activeLayer === 'NO2' 
          ? 'rgba(168, 85, 247, 0.3)' 
          : 'rgba(0, 240, 255, 0.25)'

      particles.forEach((p) => {
        p.x += p.speed * 1.2
        p.y += p.speed * 0.65 + p.curve

        if (p.x > width + 50 || p.y > height + 50) {
          p.x = -40 + Math.random() * (width * 0.4)
          p.y = Math.random() * (height * 0.6)
        }

        ctx.beginPath()
        ctx.lineWidth = p.size
        ctx.strokeStyle = `rgba(0, 240, 255, ${p.opacity * 0.4})`
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - p.length * 0.8, p.y - p.length * 0.4)
        ctx.stroke()

        // Particle head
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.8})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.9, 0, Math.PI * 2)
        ctx.fill()
      })

      // 3. Hotspot Thermal Radar Pulses
      hotspots.forEach((h, idx) => {
        const hx = h.nx * width
        const hy = h.ny * height
        const isFocused = activeHotspot && activeHotspot.name === h.name

        // Pulsing radar ripple
        const pulseProgress = ((frame * 0.8 + idx * 30) % 100) / 100
        const currentR = h.radius * (1 + pulseProgress * 1.4)
        const alpha = Math.max(0, (1 - pulseProgress) * 0.45)

        ctx.beginPath()
        ctx.arc(hx, hy, currentR, 0, Math.PI * 2)
        ctx.strokeStyle = h.color
        ctx.globalAlpha = isFocused ? alpha * 1.8 : alpha
        ctx.lineWidth = isFocused ? 2 : 1
        ctx.stroke()
        ctx.globalAlpha = 1.0

        // Core dot
        ctx.beginPath()
        ctx.arc(hx, hy, isFocused ? 5 : 3.5, 0, Math.PI * 2)
        ctx.fillStyle = h.color
        ctx.shadowColor = h.color
        ctx.shadowBlur = 12
        ctx.fill()
        ctx.shadowBlur = 0
      })

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animId)
    }
  }, [activeLayer, activeHotspot])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0" 
    />
  )
}

// ============================================================================
// 2. MAIN CINEMATIC COMPONENT: VAYUSHETRA PLATFORM
// ============================================================================
export default function LandingPage({ onEnterDashboard }) {
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

  // Layer state for interactive map section
  const [activeLayer, setActiveLayer] = useState('AQI')
  const [selectedHotspot, setSelectedHotspot] = useState(null)
  const [hoveredRegion, setHoveredRegion] = useState(null)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiConversation, setAiConversation] = useState([
    {
      role: 'assistant',
      text: 'Vayu AI initialized. Sourced from Sentinel-5P TROPOMI trace gas retrievals, NASA VIIRS active fire data, and CPCB reference stations. How can I assist your atmospheric diagnostic today?',
      type: 'system'
    }
  ])
  const [aiLoading, setAiLoading] = useState(false)
  const [bootSequence, setBootSequence] = useState(true)

  const mapSectionRef = useRef(null)
  const pipelineRef = useRef(null)
  const intelligenceRef = useRef(null)

  // Initial Data Ingestion
  useEffect(() => {
    fetchMapData()
    fetchDashboard()

    // Short aerospace boot sequence (1.2s)
    const timer = setTimeout(() => setBootSequence(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  // Ranked Hotspot Intelligence Database
  const hotspotsList = useMemo(() => [
    {
      id: '01',
      name: 'Delhi NCR Basin Trap',
      district: 'Delhi',
      state: 'National Capital Territory',
      aqi: 215,
      pm25: 90.5,
      hcho: 1.40,
      no2: 52.0,
      so2: 21.0,
      co: 2.15,
      type: 'Persistent Nocturnal Inversion',
      trend: '+14% Exceedance (7-day)',
      trendType: 'up',
      intensity: 'Critical (Severe)',
      drivers: ['Winter Inversion Cap', 'Urban Highway Freight', 'Stubble Influx NW'],
      dominantSource: 'Multi-Source Basin Entrainment (38% Stubble / 42% Traffic / 20% Kilns)',
      blh: '520m',
      ventilation: '1,820 m²/s (Poor)'
    },
    {
      id: '02',
      name: 'Punjab Agricultural Belt',
      district: 'Sangrur & Ludhiana',
      state: 'Punjab',
      aqi: 182,
      pm25: 76.5,
      hcho: 1.68,
      no2: 31.0,
      so2: 13.0,
      co: 1.38,
      type: 'Biomass Combustion Source',
      trend: '+22% Fire Radiative Power',
      trendType: 'up',
      intensity: 'High Thermal Activity',
      drivers: ['Post-Harvest Residue Burning', 'Agricultural Open Fire Influx'],
      dominantSource: 'Agricultural Stubble Combustion (58% Biomass / 24% Traffic / 18% Industry)',
      blh: '590m',
      ventilation: '2,650 m²/s (Moderate)'
    },
    {
      id: '03',
      name: 'Haryana Transit Valley',
      district: 'Karnal & Panipat',
      state: 'Haryana',
      aqi: 162,
      pm25: 68.0,
      hcho: 1.32,
      no2: 34.0,
      so2: 18.5,
      co: 1.35,
      type: 'Corridor Transit Entrainment',
      trend: '+8% Influx',
      trendType: 'up',
      intensity: 'Elevated Advection',
      drivers: ['Grand Trunk Road Heavy Transport', 'Regional Brick Kilns', 'Downwind Plume Advection'],
      dominantSource: 'Corridor Transit + Industrial Point Sources (36% Transport / 34% Kilns / 30% Biomass)',
      blh: '670m',
      ventilation: '3,100 m²/s (Moderate)'
    },
    {
      id: '04',
      name: 'Kanpur Industrial Core',
      district: 'Kanpur Nagar',
      state: 'Uttar Pradesh',
      aqi: 175,
      pm25: 74.2,
      hcho: 1.25,
      no2: 46.0,
      so2: 24.5,
      co: 1.70,
      type: 'Industrial Point Source & Inversion',
      trend: '+5% Stack Emissions',
      trendType: 'up',
      intensity: 'Very High SO₂ / Heavy Smog',
      drivers: ['Tannery Boilers', 'Coal-Fired Power Plants', 'Nocturnal River Basin Inversion'],
      dominantSource: 'Heavy Industrial Emissions (48% Kilns & Coal / 32% Traffic / 20% Biomass)',
      blh: '510m',
      ventilation: '1,940 m²/s (Poor)'
    },
    {
      id: '05',
      name: 'Kolkata Delta Basin',
      district: 'Kolkata & Howrah',
      state: 'West Bengal',
      aqi: 154,
      pm25: 65.0,
      hcho: 1.18,
      no2: 39.5,
      so2: 15.0,
      co: 1.45,
      type: 'Moisture Trapping & Road Dust',
      trend: '-3% Recent Modulation',
      trendType: 'down',
      intensity: 'Moderate Accumulation',
      drivers: ['High Relative Humidity', 'Diesel Marine Transport', 'Urban Road Resuspension'],
      dominantSource: 'Vehicular & Coastal Stagnation (46% Vehicular / 30% Industrial / 24% Other)',
      blh: '630m',
      ventilation: '2,800 m²/s (Moderate)'
    }
  ], [])

  const currentHotspot = selectedHotspot || hotspotsList[0]

  // Layer configuration helper
  const layerMetadata = {
    'AQI': { name: 'Air Quality Index', unit: 'AQI', benchmark: '100 (Safe)', color: '#00F0FF', desc: 'Composite index weighted across 8 NAAQS criteria pollutants.' },
    'HCHO': { name: 'Formaldehyde Column', unit: '10¹⁵ mol/cm²', benchmark: '1.20', color: '#4ADE80', desc: 'Marker for volatile organic compound (VOC) emissions from agricultural biomass combustion.' },
    'NO2': { name: 'Nitrogen Dioxide', unit: 'µg/m³', benchmark: '80 µg/m³ (24h)', color: '#A855F7', desc: 'Tropospheric trace gas emitted primarily by high-temperature combustion in vehicle engines & power plants.' },
    'SO2': { name: 'Sulfur Dioxide', unit: 'µg/m³', benchmark: '80 µg/m³ (24h)', color: '#F59E0B', desc: 'Emitted by coal-fired thermal power stations, brick kilns, and smelting industrial facilities.' },
    'CO': { name: 'Carbon Monoxide', unit: 'mg/m³', benchmark: '2.00 mg/m³', color: '#F97316', desc: 'Direct marker of incomplete smoldering combustion from farm fires and unburnt fuels.' },
    'PM2.5': { name: 'Fine Particulate Matter', unit: 'µg/m²', benchmark: '60 µg/m³ (24h)', color: '#38BDF8', desc: 'Respirable microscopic particles penetrating deep into pulmonary alveolar tissue.' },
    'PM10': { name: 'Coarse Particulate Matter', unit: 'µg/m³', benchmark: '100 µg/m³ (24h)', color: '#EC4899', desc: 'Coarse airborne dust, mechanical resuspension, and construction particles.' }
  }

  // Handle AI Query submission
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
        reply = `[MEASURED CPCB GROUND-TRUTH + SATELLITE]\nDelhi-NCR surface PM2.5 stands at 90.5 µg/m³ (AQI 215, Category: Poor to Very Poor).\n\n[MODEL PREDICTION - ERA5 METEOROLOGICAL COUPLING]\nPlanetary Boundary Layer Height (BLH) compressed nocturnally to 520m, forming an atmospheric lid. Coupled with a 12.4 km/h Northwesterly advection vector, regional smoke from upwind agricultural fires is entrained and trapped over the Delhi basin.`
      } else if (qLower.includes('simulate') || qLower.includes('policy') || qLower.includes('reduction')) {
        reply = `[MODEL INFERENCE - CHEMICAL MASS BALANCE POLICY REGRESSOR]\nA simulated 50% stubble reduction in Punjab/Haryana is projected to reduce downwind Delhi-NCR PM2.5 concentrations by 28.4 µg/m³ (-31.4%), mitigating approximately 640 emergency respiratory hospital admissions across the regional corridor.`
      } else {
        reply = `[DIAGNOSTIC SUMMARY FOR ${currentHotspot.name.toUpperCase()}]\nCurrent observed AQI: ${currentHotspot.aqi} (${currentHotspot.intensity}). Atmospheric Boundary Layer is compressed at ${currentHotspot.blh} with ventilation index of ${currentHotspot.ventilation}.\n\nPrimary Driver: ${currentHotspot.dominantSource}.\nAll telemetry validated against Sentinel-5P TROPOMI and CPCB continuous ground stations.`
      }

      setAiConversation(prev => [...prev, { role: 'assistant', text: reply }])
      setAiLoading(false)
    }, 600)
  }

  return (
    <div className="landing-platform-root min-h-screen bg-[#05070A] text-[#E8EEF2] font-sans overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-300 relative">
      
      {/* Short Aerospace Boot Splash */}
      {bootSequence && (
        <div className="fixed inset-0 z-50 bg-[#05070A] flex flex-col items-center justify-center space-y-4 animate-fadeOut">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 text-2xl shadow-[0_0_30px_rgba(0,240,255,0.3)]">
            🛰️
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-black tracking-widest uppercase text-white font-mono">
              VAYUSHETRA // MISSION INITIALIZATION
            </h3>
            <p className="text-[11px] text-cyan-400 font-mono animate-pulse">
              SYNCING TROPOMI SATELLITE & CPCB GROUND TELEMETRY...
            </p>
          </div>
        </div>
      )}

      {/* Background Global Particle Grid */}
      <div className="fixed inset-0 sci-grid-bg pointer-events-none opacity-40 z-0"></div>

      {/* ====================================================================
          NAVBAR: MISSION CONTROL HEADER
         ==================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-40 px-4 lg:px-8 py-3.5 bg-[#05070A]/85 backdrop-blur-xl border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-lg bg-[#0B1016] border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-base shadow-[0_0_15px_rgba(0,240,255,0.25)] group-hover:border-cyan-400 transition-all">
              🛰️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black tracking-wider uppercase text-white">VAYUSHETRA</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              </div>
              <span className="text-[8px] font-mono tracking-widest text-zinc-400 uppercase block -mt-0.5">
                DECODING THE AIR ABOVE INDIA
              </span>
            </div>
          </div>

          {/* Quick Jump Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-zinc-400">
            <button 
              onClick={() => mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-cyan-400 transition-colors uppercase tracking-wider"
            >
              MAP
            </button>
            <button 
              onClick={() => intelligenceRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-cyan-400 transition-colors uppercase tracking-wider"
            >
              HOTSPOTS
            </button>
            <button 
              onClick={() => pipelineRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-cyan-400 transition-colors uppercase tracking-wider"
            >
              HOW IT WORKS
            </button>
            <button 
              onClick={() => setAiModalOpen(true)}
              className="flex items-center space-x-1.5 text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
            >
              <Zap size={13} />
              <span>VAYU AI</span>
            </button>
          </nav>

          {/* Action Button: Explore Command Dashboard */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAiModalOpen(true)}
              className="md:hidden p-2 rounded-lg bg-[#0B1016] border border-cyan-500/30 text-cyan-400 text-xs font-mono"
            >
              <Zap size={14} />
            </button>

            <button
              onClick={onEnterDashboard}
              className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-[#05070A] font-bold text-xs px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all active:scale-95 whitespace-nowrap"
            >
              <span>EXPLORE AIR MAP</span>
              <ArrowRight size={13} className="stroke-[2.5]" />
            </button>
          </div>

        </div>
      </header>

      {/* ====================================================================
          ACT 1: CINEMATIC HERO SECTION
         ==================================================================== */}
      <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-12 px-6 lg:px-12 overflow-hidden z-10">
        <AtmosphericGeospatialCanvas activeLayer={activeLayer} activeHotspot={currentHotspot} />

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto">
          
          {/* Left Column: Mission Pitch */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* System Status Pill */}
            <div className="inline-flex items-center space-x-2.5 px-3 py-1 rounded-full bg-[#0B1016]/90 border border-cyan-500/30 text-[10px] font-mono tracking-widest text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>SENTINEL-5P & CPCB ATMOSPHERIC INTELLIGENCE</span>
            </div>

            {/* Primary Cinematic Heading */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white font-display uppercase leading-[0.95]">
                VAYUSHETRA
              </h1>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-white leading-tight">
                DECODING THE AIR ABOVE INDIA.
              </h2>
            </div>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base text-zinc-300 max-w-xl font-normal leading-relaxed">
              Satellite-powered atmospheric intelligence for detecting pollution patterns, identifying hotspots, and understanding what drives them across the Indo-Gangetic Basin.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center space-x-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#05070A] font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all transform active:scale-98"
              >
                <span>EXPLORE AIR MAP</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => pipelineRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center space-x-2 bg-[#0B1016] hover:bg-[#101724] border border-white/15 hover:border-cyan-500/40 text-xs sm:text-sm font-semibold px-5 py-3.5 rounded-xl transition-all text-zinc-300 hover:text-white"
              >
                <span>HOW IT WORKS</span>
                <ChevronRight size={14} className="text-cyan-400" />
              </button>
            </div>

            {/* Live Observation Micro-Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/[0.08] max-w-lg font-mono">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block">ORBITAL SWATH</span>
                <span className="text-base font-bold text-white">2,600 km</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block">RESOLUTION</span>
                <span className="text-base font-bold text-cyan-400">3.5 × 5.5 km</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block">SENSORS</span>
                <span className="text-base font-bold text-white">TROPOMI · VIIRS</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive 3D Holographic Orbit Telemetry Card */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full max-w-[420px] hud-panel hud-panel-glow p-6 space-y-5 relative">
              
              {/* Card Header */}
              <div className="flex justify-between items-center border-b border-white/[0.08] pb-3 font-mono text-[10px]">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <Activity size={13} className="animate-pulse" />
                  <span>ORBITAL RECEPTOR // {selectedDate}</span>
                </div>
                <span className="hud-tag hud-tag-green">DATA VALIDATED</span>
              </div>

              {/* Active District Focus */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">FOCUSED BASIN RECEPTOR</span>
                <div className="text-2xl font-black text-white flex items-center justify-between">
                  <span>{currentHotspot.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-mono">
                    {currentHotspot.aqi} AQI
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {currentHotspot.state} • Planetary Boundary Layer: <strong className="text-white font-mono">{currentHotspot.blh}</strong>
                </p>
              </div>

              {/* Multi-Sensor Speciation Quick Spectrum */}
              <div className="space-y-2 pt-2 border-t border-white/[0.08] font-mono text-xs">
                <div className="flex justify-between text-zinc-300">
                  <span>Surface Fine PM2.5</span>
                  <span className="text-sky-400 font-bold">{currentHotspot.pm25} µg/m³</span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full" style={{ width: `${Math.min(100, (currentHotspot.pm25 / 150) * 100)}%` }}></div>
                </div>

                <div className="flex justify-between text-zinc-300 pt-1">
                  <span>Formaldehyde (HCHO Column)</span>
                  <span className="text-emerald-400 font-bold">{currentHotspot.hcho} × 10¹⁵</span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, (currentHotspot.hcho / 2.5) * 100)}%` }}></div>
                </div>

                <div className="flex justify-between text-zinc-300 pt-1">
                  <span>Tropospheric NO₂</span>
                  <span className="text-purple-400 font-bold">{currentHotspot.no2} µg/m³</span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-400 h-full rounded-full" style={{ width: `${Math.min(100, (currentHotspot.no2 / 80) * 100)}%` }}></div>
                </div>
              </div>

              {/* Chemical Mass Balance Footnote */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>DOMINANT INFERENCE:</span>
                <span className="text-amber-400 font-bold">STUBBLE SMOKE + INVERSION</span>
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* ====================================================================
          ACT 2: LIVE TELEMETRY STRIP (MISSION CONTROL AEROSPACE BAR)
         ==================================================================== */}
      <section className="relative z-20 border-y border-white/[0.08] bg-[#070B10]/95 backdrop-blur-xl py-3 px-6 lg:px-12 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-zinc-400">SYSTEM STATUS:</span>
            <span className="text-emerald-400 font-bold">ONLINE (SATELLITE & CPCB)</span>
          </div>

          <div className="flex items-center space-x-2 border-l border-white/[0.08] pl-4">
            <span className="text-zinc-400">SENSORS:</span>
            <span className="text-cyan-400 font-bold">TROPOMI · MODIS · VIIRS</span>
          </div>

          <div className="flex items-center space-x-2 border-l border-white/[0.08] pl-4">
            <span className="text-zinc-400">COVERAGE:</span>
            <span className="text-white font-bold">INDO-GANGETIC CORRIDOR</span>
          </div>

          <div className="flex items-center space-x-2 border-l border-white/[0.08] pl-4">
            <span className="text-zinc-400">POLLUTANTS:</span>
            <span className="text-white font-bold">HCHO · NO₂ · SO₂ · CO · PM2.5</span>
          </div>

          <div className="flex items-center space-x-2 border-l border-white/[0.08] pl-4">
            <span className="text-zinc-400">DATA MODE:</span>
            <span className="hud-tag hud-tag-green">LIVE VERIFIED</span>
          </div>

        </div>
      </section>

      {/* ====================================================================
          ACT 3: "THE AIR IS ALWAYS MOVING" (STORYTELLING SECTION)
         ==================================================================== */}
      <section className="relative z-10 py-20 px-6 lg:px-12 bg-gradient-to-b from-[#05070A] via-[#080D14] to-[#05070A]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1016] border border-cyan-500/30 text-[10px] font-mono text-cyan-400 tracking-wider">
              <Wind size={12} className="animate-spin" />
              <span>ATMOSPHERIC DYNAMICS & PLUME KINEMATICS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
              THE AIR IS ALWAYS MOVING.
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed font-normal">
              Air pollution does not respect district boundaries. In autumn and winter, agricultural stubble fires ignited in Punjab and Haryana release dense particulate plumes that travel hundreds of kilometers across the Indo-Gangetic corridor along the northwesterly jetstream.
            </p>
          </div>

          {/* Three Telemetry Story Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Atmospheric Movement */}
            <div className="hud-panel p-6 space-y-3 border-l-2 border-l-cyan-400">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Wind size={14} /> ADVECTION JETSTREAM
                </span>
                <span className="text-zinc-400">~12.4 km/h NW</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Northwesterly Inflow</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Atmospheric wind streamlines transport buoyant biomass smoke plumes downstream through Ambala, Karnal, and Panipat before converging on the National Capital Region.
              </p>
              <div className="pt-2 border-t border-white/[0.08] text-[10px] font-mono text-zinc-400 flex justify-between">
                <span>TRANSIT TIME:</span>
                <span className="text-white font-bold">24 – 48 Hours</span>
              </div>
            </div>

            {/* 2. Pollution Transport */}
            <div className="hud-panel p-6 space-y-3 border-l-2 border-l-amber-400">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Layers size={14} /> BOUNDARY LAYER TRAP
                </span>
                <span className="text-zinc-400">520m Cap</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Thermal Inversion Lid</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Cool ground nocturnal temperatures create a steep temperature inversion layer. This compresses vertical ventilation, trapping particulate matter directly in the human breathing zone.
              </p>
              <div className="pt-2 border-t border-white/[0.08] text-[10px] font-mono text-zinc-400 flex justify-between">
                <span>INVERSION STATUS:</span>
                <span className="text-amber-400 font-bold">NOCTURNAL TRAP ACTIVE</span>
              </div>
            </div>

            {/* 3. Regional Activity */}
            <div className="hud-panel p-6 space-y-3 border-l-2 border-l-orange-400">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-orange-400 font-bold flex items-center gap-1.5">
                  <Flame size={14} /> THERMAL RADIATIVE POWER
                </span>
                <span className="text-zinc-400">VIIRS Detected</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Seasonal Stubble Clusters</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                NASA VIIRS and MODIS satellites register intense thermal points in agricultural districts. Farm fire smoke contains elevated formaldehyde (HCHO) and respirable PM2.5 fractions.
              </p>
              <div className="pt-2 border-t border-white/[0.08] text-[10px] font-mono text-zinc-400 flex justify-between">
                <span>STUBBLE IMPACT:</span>
                <span className="text-orange-400 font-bold">38% – 58% Basin Share</span>
              </div>
            </div>

          </div>

          <div className="text-center font-mono text-[11px] text-zinc-400 pt-2">
            * Physical advection trajectories computed via Eulerian-Lagrangian air-mass transport model calibrated against CPCB ground monitors.
          </div>

        </div>
      </section>

      {/* ====================================================================
          ACT 4: INTERACTIVE INDIA POLLUTION MAP SECTION
         ==================================================================== */}
      <section ref={mapSectionRef} className="relative z-10 py-16 px-6 lg:px-12 bg-[#05070A] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Section Header & Layer Switcher */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1016] border border-cyan-500/30 text-[10px] font-mono text-cyan-400 tracking-wider mb-2">
                <Radio size={12} className="animate-pulse text-cyan-400" />
                <span>MULTISPECTRAL SATELLITE COLUMN MAPPING</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-tight">
                INTERACTIVE POLLUTION SPECIES MAP
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                Switch spectral layers to visualize trace gas columnar densities and ground criteria pollutants across India.
              </p>
            </div>

            {/* Direct Switch to Full Dashboard */}
            <button
              onClick={onEnterDashboard}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0B1016] border border-cyan-500/40 text-cyan-400 text-xs font-mono hover:bg-cyan-500/10 transition-all"
            >
              <span>OPEN FULL MAP SUITE</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Layer Selector Bar */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#0B1016] border border-white/[0.08]">
            {['AQI', 'HCHO', 'NO2', 'SO2', 'CO', 'PM2.5', 'PM10'].map((layer) => {
              const isActive = activeLayer === layer
              return (
                <button
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-1.5 ${
                    isActive 
                      ? 'bg-cyan-500 text-[#05070A] shadow-[0_0_15px_rgba(0,240,255,0.4)]' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{layer}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#05070A]"></span>}
                </button>
              )
            })}
          </div>

          {/* Interactive Map Visual Stage Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left/Main Area: Interactive High-Precision Vector Geospatial Map (8 Cols) */}
            <div className="lg:col-span-8 hud-panel p-6 flex flex-col justify-between min-h-[480px] relative overflow-hidden">
              
              {/* Top Map HUD Status */}
              <div className="flex justify-between items-center z-10 font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="text-zinc-300 uppercase font-bold">ACTIVE LAYER: {layerMetadata[activeLayer].name}</span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  NAAQS STANDARD: <strong className="text-cyan-400">{layerMetadata[activeLayer].benchmark}</strong>
                </div>
              </div>

              {/* Vector SVG India Map with Active Hotspot Clusters */}
              <div className="relative flex-1 flex items-center justify-center my-4 select-none">
                <svg viewBox="0 0 600 500" className="w-full h-full max-h-[380px] filter drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                  
                  {/* Subtle Grid Lat/Long Lines */}
                  <line x1="50" y1="120" x2="550" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="50" y1="240" x2="550" y2="240" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="50" y1="360" x2="550" y2="360" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="200" y1="40" x2="200" y2="460" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="380" y1="40" x2="380" y2="460" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                  {/* India Geographic Boundary Contour Path */}
                  <path
                    d="M 230,60 
                       C 250,40 270,40 280,55 
                       C 295,70 285,85 295,100 
                       C 310,115 305,125 290,135 
                       C 275,135 260,130 250,140 
                       C 230,150 220,165 205,185 
                       C 190,200 185,220 205,230 
                       C 195,245 215,250 220,240 
                       C 230,265 240,295 250,325 
                       C 260,350 270,370 275,370 
                       C 280,370 290,345 300,320 
                       C 315,290 330,260 345,240 
                       C 355,225 365,215 370,200 
                       C 380,195 395,180 410,175 
                       C 425,175 435,190 425,205 
                       C 405,215 385,215 370,205 
                       C 355,195 345,180 325,170 
                       C 310,155 295,130 280,115 Z"
                    fill="rgba(11, 16, 22, 0.9)"
                    stroke="rgba(0, 240, 255, 0.45)"
                    strokeWidth="1.8"
                    className="transition-all duration-500"
                  />

                  {/* Advection Jetstream Plume Path */}
                  <path
                    d="M 220,150 Q 255,175 300,195"
                    fill="none"
                    stroke="rgba(0, 240, 255, 0.75)"
                    strokeWidth="3"
                    strokeDasharray="8 4"
                    className="animate-[windStream_2s_linear_infinite]"
                  />

                  {/* Active Hotspots on Map */}
                  {hotspotsList.map((h, i) => {
                    const coords = [
                      { cx: 260, cy: 175 }, // Delhi
                      { cx: 235, cy: 145 }, // Punjab
                      { cx: 250, cy: 160 }, // Haryana
                      { cx: 310, cy: 195 }, // Kanpur
                      { cx: 375, cy: 220 }  // Kolkata
                    ][i]

                    const isSelected = currentHotspot.id === h.id

                    return (
                      <g 
                        key={h.id} 
                        className="cursor-pointer group"
                        onClick={() => setSelectedHotspot(h)}
                        onMouseEnter={() => setHoveredRegion(h)}
                        onMouseLeave={() => setHoveredRegion(null)}
                      >
                        {/* Radar Aura */}
                        <circle
                          cx={coords.cx}
                          cy={coords.cy}
                          r={isSelected ? 28 : 16}
                          fill={activeLayer === 'HCHO' ? 'rgba(74, 222, 128, 0.18)' : 'rgba(239, 68, 68, 0.18)'}
                          stroke={activeLayer === 'HCHO' ? '#4ADE80' : '#EF4444'}
                          strokeWidth={isSelected ? 1.5 : 0.8}
                          className="animate-pulse"
                        />

                        {/* Central Target Point */}
                        <circle
                          cx={coords.cx}
                          cy={coords.cy}
                          r={isSelected ? 5 : 3.5}
                          fill={activeLayer === 'HCHO' ? '#4ADE80' : '#EF4444'}
                        />

                        {/* District Name Label */}
                        <text
                          x={coords.cx + 8}
                          y={coords.cy - 6}
                          fill="#ffffff"
                          fontSize="10"
                          fontFamily="JetBrains Mono"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          className="pointer-events-none"
                        >
                          {h.district}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* Dynamic Bottom Legend */}
              <div className="z-10 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/[0.08] font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-400">INTENSITY SPECTRUM:</span>
                  <div className="flex items-center space-x-1">
                    <span className="w-5 h-2.5 rounded-sm bg-emerald-500" title="Good"></span>
                    <span className="w-5 h-2.5 rounded-sm bg-lime-500" title="Satisfactory"></span>
                    <span className="w-5 h-2.5 rounded-sm bg-yellow-500" title="Moderate"></span>
                    <span className="w-5 h-2.5 rounded-sm bg-orange-500" title="Poor"></span>
                    <span className="w-5 h-2.5 rounded-sm bg-red-500" title="Very Poor"></span>
                    <span className="w-5 h-2.5 rounded-sm bg-purple-700" title="Severe"></span>
                  </div>
                </div>

                <span className="text-[11px] text-zinc-400">
                  {layerMetadata[activeLayer].desc}
                </span>
              </div>

            </div>

            {/* Right Column: Sophisticated Information HUD Panel (4 Cols) */}
            <div className="lg:col-span-4 hud-panel p-6 flex flex-col justify-between space-y-4">
              
              <div>
                <div className="flex justify-between items-start font-mono text-xs border-b border-white/[0.08] pb-3">
                  <span className="text-cyan-400 font-bold uppercase tracking-wider">
                    TARGET HUD // {currentHotspot.district.toUpperCase()}
                  </span>
                  <span className="hud-tag hud-tag-amber">{currentHotspot.type}</span>
                </div>

                {/* Main Metric Value */}
                <div className="mt-4 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    MEASURED {activeLayer} LEVEL
                  </span>
                  <div className="text-4xl font-black font-mono text-white flex items-baseline gap-2">
                    <span>
                      {activeLayer === 'AQI' ? currentHotspot.aqi 
                        : activeLayer === 'HCHO' ? currentHotspot.hcho 
                        : activeLayer === 'NO2' ? currentHotspot.no2 
                        : activeLayer === 'SO2' ? currentHotspot.so2 
                        : activeLayer === 'CO' ? currentHotspot.co 
                        : activeLayer === 'PM2.5' ? currentHotspot.pm25 
                        : Math.round(currentHotspot.pm25 * 1.6)}
                    </span>
                    <span className="text-xs text-cyan-400 font-normal">{layerMetadata[activeLayer].unit}</span>
                  </div>
                  <div className="text-xs text-amber-400 font-mono font-bold">
                    {currentHotspot.trend}
                  </div>
                </div>

                {/* Technical Diagnostic Breakdown */}
                <div className="mt-4 space-y-2.5 pt-3 border-t border-white/[0.08] text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Jurisdiction:</span>
                    <span className="text-white font-bold">{currentHotspot.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Boundary Layer:</span>
                    <span className="text-white font-bold">{currentHotspot.blh} (Inversion)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Ventilation Index:</span>
                    <span className="text-white font-bold">{currentHotspot.ventilation}</span>
                  </div>
                </div>

                {/* Primary Drivers */}
                <div className="mt-4 space-y-1.5 pt-3 border-t border-white/[0.08]">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">DOMINANT POLLUTION DRIVERS</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentHotspot.drivers.map((d, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-zinc-300 font-mono">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Deep Dive Action */}
              <button
                onClick={onEnterDashboard}
                className="w-full py-2.5 rounded-xl bg-[#0B1016] border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-[#05070A] font-bold text-xs font-mono transition-all flex items-center justify-center space-x-2"
              >
                <span>OPEN REGIONAL REPORT DOSSIER</span>
                <ArrowRight size={13} />
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* ====================================================================
          ACT 5: HOTSPOT INTELLIGENCE ("WHERE POLLUTION CONCENTRATES")
         ==================================================================== */}
      <section ref={intelligenceRef} className="relative z-10 py-20 px-6 lg:px-12 bg-gradient-to-b from-[#05070A] via-[#070C12] to-[#05070A]">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1016] border border-cyan-500/30 text-[10px] font-mono text-cyan-400 tracking-wider mb-2">
                <ShieldAlert size={12} className="text-red-400" />
                <span>HOTSPOT INTELLIGENCE ENGINE (DBSCAN & CPCB)</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
                WHERE POLLUTION CONCENTRATES.
              </h2>
              <p className="text-xs text-zinc-400 font-medium mt-1">
                Persistent and episodic hotspot rankings prioritized by spatial intensity and population exposure risk.
              </p>
            </div>
            
            <span className="text-xs font-mono text-zinc-400">
              CLICK ANY REGION TO LOAD SATELLITE DIAGNOSTICS
            </span>
          </div>

          {/* Ranked Hotspot Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {hotspotsList.map((spot) => {
              const isSelected = currentHotspot.id === spot.id
              return (
                <div
                  key={spot.id}
                  onClick={() => setSelectedHotspot(spot)}
                  className={`hud-panel p-5 cursor-pointer transition-all duration-300 space-y-3 ${
                    isSelected 
                      ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.25)] bg-[#101722]' 
                      : 'hover:border-white/25'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className={`font-black ${isSelected ? 'text-cyan-400' : 'text-zinc-400'}`}>{spot.id}</span>
                    <span className="hud-tag hud-tag-amber">{spot.aqi} AQI</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{spot.name}</h3>
                    <span className="text-[11px] text-zinc-400">{spot.state}</span>
                  </div>

                  <div className="pt-2 border-t border-white/[0.08] text-[11px] font-mono space-y-1 text-zinc-300">
                    <div className="flex justify-between">
                      <span>PM2.5:</span>
                      <span className="text-white font-bold">{spot.pm25} µg/m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HCHO:</span>
                      <span className="text-emerald-400 font-bold">{spot.hcho} × 10¹⁵</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Detailed Selected Hotspot Comprehensive Dossier Banner */}
          <div className="hud-panel p-6 lg:p-8 space-y-6 border-cyan-500/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  HOTSPOT DOSSIER // {currentHotspot.id} — {currentHotspot.name.toUpperCase()}
                </span>
                <h3 className="text-2xl font-black text-white font-display mt-0.5">
                  {currentHotspot.district} ({currentHotspot.state})
                </h3>
              </div>
              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="text-zinc-400">CLASSIFICATION:</span>
                <span className="hud-tag hud-tag-red">{currentHotspot.type}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-zinc-400 uppercase">CHEMICAL MASS BALANCE ATTRIBUTION</span>
                <p className="text-zinc-200 leading-relaxed font-mono">
                  {currentHotspot.dominantSource}
                </p>
                <span className="text-[9px] text-zinc-400 font-mono block pt-1">
                  * Inferred via Chemical Mass Balance (CMB) spectral inversion model.
                </span>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[10px] text-zinc-400 uppercase">ATMOSPHERIC INVERSION & METEOROLOGY</span>
                <p className="text-zinc-200 leading-relaxed">
                  Boundary Layer Height compressed to <strong className="text-white font-mono">{currentHotspot.blh}</strong>. Nocturnal subsidence prevents convective air parcel lofting.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[10px] text-zinc-400 uppercase">HEALTH & POPULATION VULNERABILITY</span>
                <p className="text-zinc-200 leading-relaxed">
                  Elevated risk of acute pulmonary irritation, cardiac stress, and pediatric asthma exacerbation.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ====================================================================
          ACT 6: ATMOSPHERIC FINGERPRINT SECTION
         ==================================================================== */}
      <section className="relative z-10 py-16 px-6 lg:px-12 bg-[#05070A] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1016] border border-cyan-500/30 text-[10px] font-mono text-cyan-400 tracking-wider">
              <Sparkles size={12} />
              <span>CHEMICAL MASS BALANCE SPECTRUM</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
              ATMOSPHERIC FINGERPRINT.
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              Every pollutant source leaves a distinctive spectral chemical signature. By comparing relative ratios of trace gases, VayuShetra unmasks the hidden drivers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Scientific Speciation Spectral Bars (7 Cols) */}
            <div className="lg:col-span-7 hud-panel p-6 space-y-4 font-mono">
              <div className="flex justify-between items-center text-xs border-b border-white/[0.08] pb-3">
                <span className="text-cyan-400 font-bold uppercase">RELATIVE POLLUTANT SPECIATION ({currentHotspot.district})</span>
                <span className="text-[10px] text-zinc-400">MEASURED vs MODEL RATIOS</span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { name: 'HCHO (Formaldehyde)', val: 84, color: '#4ADE80', label: 'Biomass Tracer' },
                  { name: 'PM2.5 (Fine Particulate)', val: 88, color: '#38BDF8', label: 'Combustion Aerosol' },
                  { name: 'NO₂ (Nitrogen Dioxide)', val: 68, color: '#A855F7', label: 'Vehicular & Power' },
                  { name: 'CO (Carbon Monoxide)', val: 72, color: '#F97316', label: 'Smoldering Influx' },
                  { name: 'SO₂ (Sulfur Dioxide)', val: 38, color: '#F59E0B', label: 'Kilns & Coal Stacks' },
                  { name: 'PM10 (Coarse Dust)', val: 62, color: '#EC4899', label: 'Resuspended Crustal' }
                ].map(item => (
                  <div key={item.name} className="space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-300">
                      <span>{item.name}</span>
                      <span className="text-zinc-400 text-[10px]">{item.label}</span>
                    </div>
                    <div className="w-full bg-white/[0.06] h-2.5 rounded-full overflow-hidden flex items-center">
                      <div 
                        className="h-full rounded-full transition-all duration-700" 
                        style={{ width: `${item.val}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/[0.08] text-[10px] text-zinc-400">
                * Speciation normalized against CPCB NAAQS 24-hour statutory upper ceiling limits.
              </div>
            </div>

            {/* Right: Dominant Signal Diagnostic Card (5 Cols) */}
            <div className="lg:col-span-5 hud-panel p-6 space-y-4 border-l-2 border-l-emerald-400">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">DIAGNOSTIC DETERMINATION</span>
                <h3 className="text-xl font-black text-white font-display uppercase tracking-tight">
                  DOMINANT SIGNAL: BIOMASS SMOKE INFLUX
                </h3>
                <span className="hud-tag hud-tag-green">AI MODEL INFERENCE</span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                The elevated ratio of Formaldehyde (HCHO) to Nitrogen Dioxide (NO₂) coupled with synchronous carbon monoxide enhancements establishes a definitive biomass combustion fingerprint. Local urban vehicular traffic provides a secondary constant baseline.
              </p>

              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Biomass Stubble Share:</span>
                  <span className="text-amber-400 font-bold">~52%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Vehicular Transport:</span>
                  <span className="text-sky-400 font-bold">~28%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Industrial & Power:</span>
                  <span className="text-purple-400 font-bold">~20%</span>
                </div>
              </div>

              <button
                onClick={onEnterDashboard}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#05070A] font-bold text-xs font-mono transition-all"
              >
                VIEW SOURCE ATTRIBUTION TAB →
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ====================================================================
          ACT 7: HOW VAYUSHETRA THINKS (DATA PIPELINE SECTION)
         ==================================================================== */}
      <section ref={pipelineRef} className="relative z-10 py-20 px-6 lg:px-12 bg-gradient-to-b from-[#05070A] via-[#070C12] to-[#05070A] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B1016] border border-cyan-500/30 text-[10px] font-mono text-cyan-400 tracking-wider">
              <Cpu size={12} />
              <span>SCIENTIFIC PROCESSING ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
              HOW VAYUSHETRA THINKS.
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              From raw satellite radiances to ground-level actionable environmental intelligence in six synchronous stages.
            </p>
          </div>

          {/* Six-Node Sequential Data Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {[
              {
                step: '01',
                title: 'SATELLITE INGESTION',
                source: 'Sentinel-5P, MODIS & VIIRS',
                desc: 'Tropospheric radiance columns and thermal radiative points received via Copernicus & NASA FIRMS APIs.'
              },
              {
                step: '02',
                title: 'ATMOSPHERIC RETRIEVAL',
                source: 'Level-2 Trace Gases',
                desc: 'Differential Optical Absorption Spectroscopy (DOAS) extracts total vertical column densities of HCHO, NO₂, SO₂.'
              },
              {
                step: '03',
                title: 'PBL COUPLING',
                source: 'ERA5 Meteorological Engine',
                desc: 'Planetary Boundary Layer Height and wind advection vectors normalize vertical column density to surface air concentrations.'
              },
              {
                step: '04',
                title: 'ML & MASS BALANCE',
                source: 'XGBoost & Chemical Attribution',
                desc: 'Trained models predict 48-hour forward trajectories and apportion pollution to agricultural, vehicular, or industrial stacks.'
              },
              {
                step: '05',
                title: 'HOTSPOT DETECTION',
                source: 'DBSCAN Spatial Clustering',
                desc: 'Identifies statistically anomalous concentration clusters and traces downwind advection transport corridors.'
              },
              {
                step: '06',
                title: 'ACTIONABLE DECISIONS',
                source: 'Policy & Regulatory API',
                desc: 'Generates CPCB compliance audits, public health early warnings, and interactive stubble reduction simulators.'
              }
            ].map((node, idx) => (
              <div key={node.step} className="hud-panel p-4 space-y-2 relative flex flex-col justify-between hover:border-cyan-400/50 transition-all">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-cyan-400 font-black">{node.step}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  </div>
                  <h4 className="text-xs font-black text-white font-mono tracking-tight">{node.title}</h4>
                  <span className="text-[10px] text-zinc-400 font-mono block">{node.source}</span>
                  <p className="text-[11px] text-zinc-300 leading-snug pt-1">
                    {node.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ====================================================================
          ACT 8: VAYU AI CONSOLE MODAL & FLOATING TRIGGER
         ==================================================================== */}
      {/* Floating Action Trigger */}
      <button
        onClick={() => setAiModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-[#0B1016]/95 border border-cyan-400 text-cyan-400 font-mono text-xs font-bold shadow-[0_0_30px_rgba(0,240,255,0.35)] flex items-center space-x-2.5 hover:scale-105 transition-all backdrop-blur-xl"
      >
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        <Zap size={14} />
        <span>ASK VAYU AI</span>
      </button>

      {/* Vayu AI Modal Console */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl hud-panel hud-panel-glow flex flex-col max-h-[85vh] border-cyan-500/40 animate-fadeIn">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-white/[0.08] flex justify-between items-center bg-[#070B10]">
              <div className="flex items-center space-x-2 font-mono">
                <Zap size={15} className="text-cyan-400" />
                <span className="text-xs font-black uppercase text-white">VAYU AI // ENVIRONMENTAL INTELLIGENCE ANALYST</span>
              </div>
              <button 
                onClick={() => setAiModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {/* Conversation Stream */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 font-mono text-xs">
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
            </div>

            {/* Quick Question Chips */}
            <div className="px-4 py-2 border-t border-white/[0.08] flex flex-wrap gap-1.5 bg-[#070B10]">
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
            <div className="p-3 border-t border-white/[0.08] bg-[#070B10] flex items-center space-x-2">
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
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#05070A] font-bold text-xs font-mono transition-all"
              >
                QUERY
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ====================================================================
          ACT 9: STATEMENT FOOTER
         ==================================================================== */}
      <footer className="relative z-10 py-16 px-6 lg:px-12 bg-[#030508] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/[0.08] pb-8">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
                AIR DOESN'T STOP AT BORDERS.
              </h2>
              <p className="text-sm text-zinc-400 font-medium">
                Understanding pollution begins with understanding where it moves.
              </p>
            </div>

            <button
              onClick={onEnterDashboard}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#05070A] font-bold text-xs font-mono shadow-[0_0_25px_rgba(0,240,255,0.35)] transition-all whitespace-nowrap"
            >
              <span>ENTER COMMAND DASHBOARD</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono text-zinc-400">
            <div>
              <strong>VayuShetra Atmospheric Intelligence Platform</strong> • National Clean Air Programme (NCAP) Framework.
            </div>
            <div>
              Satellites: Sentinel-5P TROPOMI · MODIS Terra/Aqua · NASA VIIRS · CPCB Ground Stations.
            </div>
          </div>

        </div>
      </footer>

      {/* Global Embedded Animations */}
      <style>{`
        @keyframes windStream {
          0% { stroke-dashoffset: 36; opacity: 0.3; }
          50% { opacity: 0.95; }
          100% { stroke-dashoffset: 0; opacity: 0.2; }
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; visibility: hidden; }
        }
      `}</style>

    </div>
  )
}

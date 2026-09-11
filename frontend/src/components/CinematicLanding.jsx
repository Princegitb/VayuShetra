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
  const [activeLayer, setActiveLayer] = useState('AQI')
  const [selectedHotspotIndex, setSelectedHotspotIndex] = useState(0)
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

  // Hotspots dataset
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
      co: 1.25,
      type: 'Advection Transit Corridor',
      trend: '+8% Transboundary Drift',
      trendType: 'up',
      intensity: 'Elevated Advection',
      drivers: ['Stubble Smoke Plume Transit', 'GT Road Heavy Diesel Freight'],
      dominantSource: 'Transboundary Transit Plume (45% Upwind Smoke / 35% Transport / 20% Industrial)',
      blh: '610m',
      ventilation: '2,400 m²/s (Moderate)'
    },
    {
      id: '04',
      name: 'Kanpur Industrial Core',
      district: 'Kanpur Nagar',
      state: 'Uttar Pradesh',
      aqi: 198,
      pm25: 84.0,
      hcho: 1.15,
      no2: 48.0,
      so2: 38.0,
      co: 1.90,
      type: 'Industrial Point-Source Stack',
      trend: '+5% Stationary Stack Flux',
      trendType: 'up',
      intensity: 'High Industrial Density',
      drivers: ['Tannery Boilers & Chemical Stacks', 'High-Sulfur Fuel Combustion'],
      dominantSource: 'Industrial & Stationary Stacks (52% Industry / 28% Vehicular / 20% Domestic)',
      blh: '550m',
      ventilation: '1,980 m²/s (Poor)'
    },
    {
      id: '05',
      name: 'Kolkata Delta Inversion',
      district: 'Kolkata Urban',
      state: 'West Bengal',
      aqi: 145,
      pm25: 58.5,
      hcho: 1.05,
      no2: 39.0,
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

  const currentHotspot = hotspotsList[selectedHotspotIndex]

  // Layer metadata
  const layerMetadata = {
    'AQI': { name: 'Air Quality Index', unit: 'AQI', benchmark: '100 (Safe)', color: '#00F0FF', desc: 'Composite index weighted across 8 NAAQS criteria pollutants.' },
    'HCHO': { name: 'Formaldehyde Column', unit: '10¹⁵ mol/cm²', benchmark: '1.20', color: '#4ADE80', desc: 'Marker for volatile organic compound (VOC) emissions from agricultural biomass combustion.' },
    'NO2': { name: 'Nitrogen Dioxide', unit: 'µg/m³', benchmark: '80 µg/m³ (24h)', color: '#A855F7', desc: 'Tropospheric trace gas emitted primarily by high-temperature combustion in vehicle engines & power plants.' },
    'SO2': { name: 'Sulfur Dioxide', unit: 'µg/m³', benchmark: '80 µg/m³ (24h)', color: '#F59E0B', desc: 'Emitted by coal-fired thermal power stations, brick kilns, and smelting industrial facilities.' },
    'CO': { name: 'Carbon Monoxide', unit: 'mg/m³', benchmark: '2.00 mg/m³', color: '#F97316', desc: 'Direct marker of incomplete smoldering combustion from farm fires and unburnt fuels.' },
    'PM2.5': { name: 'Fine Particulate Matter', unit: 'µg/m³', benchmark: '60 µg/m³ (24h)', color: '#38BDF8', desc: 'Respirable microscopic particles penetrating deep into pulmonary alveolar tissue.' },
  }

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
        reply = `[DIAGNOSTIC SUMMARY FOR ${currentHotspot.name.toUpperCase()}]\nCurrent observed AQI: ${currentHotspot.aqi} (${currentHotspot.intensity}). Atmospheric Boundary Layer is compressed at ${currentHotspot.blh} with ventilation index of ${currentHotspot.ventilation}.\n\nPrimary Driver: ${currentHotspot.dominantSource}.\nAll telemetry validated against Sentinel-5P TROPOMI and CPCB continuous ground stations.`
      }

      setAiConversation(prev => [...prev, { role: 'assistant', text: reply }])
      setAiLoading(false)
    }, 700)
  }

  return (
    <div className="relative min-h-screen bg-[#05070A] text-[#E8EEF2] selection:bg-cyan-500/20 selection:text-cyan-300 font-sans overflow-x-hidden">
      
      {/* Precision 3D Custom Cursor */}
      <CustomCursor />

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
          <a href="#hotspots" className="hover:text-cyan-400 transition-colors">03 // HOTSPOTS</a>
          <a href="#pipeline" className="hover:text-cyan-400 transition-colors">04 // PIPELINE</a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAiModalOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 text-xs font-mono px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/40 text-cyan-400 transition-all"
          >
            <Zap size={13} />
            <span>AI INTEL</span>
          </button>

          <MagneticButton
            onClick={onEnterDashboard}
            className="px-4 lg:px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#05070A] font-black text-xs font-mono shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all"
          >
            <span>ENTER DASHBOARD</span>
            <ArrowRight size={13} />
          </MagneticButton>
        </div>
      </header>

      {/* ====================================================================
          ACT 1: CINEMATIC 3D HERO (PROCEDURAL SENTINEL ROBOT + PARTICLES)
         ==================================================================== */}
      <section id="hero" className="relative min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 pt-24 pb-16 overflow-hidden">
        
        {/* 3D Canvas Background (Sentinel Drone + Aerosol Simulation) */}
        <VayushetraScene dashboardData={dashboardData} />

        {/* Ambient Radial Vignette & Grid */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none z-0 opacity-80" />
        <div className="absolute inset-0 sci-grid-bg pointer-events-none opacity-40 z-0" />

        {/* Central Hero Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pointer-events-auto my-auto">
          
          {/* Left Column: Headline, Narrative & Actions */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Status Capsule */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#0B1016]/90 border border-cyan-400/30 text-cyan-300 text-xs font-mono shadow-[0_0_25px_rgba(0,240,255,0.15)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="tracking-wider uppercase font-semibold">
                NCAP // CPCB & ISRO INTEGRATED
              </span>
            </div>

            {/* Main Cinematic Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white uppercase leading-[1.08]">
              ATMOSPHERIC INTELLIGENCE.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 drop-shadow-[0_0_35px_rgba(0,240,255,0.35)]">
                BEYOND BORDERS.
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="max-w-xl text-sm sm:text-base text-zinc-400 font-medium leading-relaxed">
              High-resolution Sentinel-5P TROPOMI trace gas retrievals, ERA5 nocturnal boundary layer inversion modeling, and chemical mass balance AI. Pinpointing transboundary smoke advection across the Indo-Gangetic Basin.
            </p>

            {/* Magnetic Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <MagneticButton
                onClick={onEnterDashboard}
                className="px-7 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#05070A] font-black text-xs font-mono shadow-[0_0_30px_rgba(0,240,255,0.45)] transition-all"
              >
                <span>ENTER MISSION CONTROL</span>
                <ArrowRight size={14} />
              </MagneticButton>

              <MagneticButton
                onClick={() => setAiModalOpen(true)}
                className="px-5 py-3.5 rounded-xl bg-[#0B1016]/90 hover:bg-[#121a24] text-white border border-white/15 hover:border-cyan-400/40 text-xs font-mono shadow-lg transition-all"
              >
                <Zap size={14} className="text-cyan-400" />
                <span>VAYU AI COPILOT</span>
              </MagneticButton>
            </div>

            {/* Live Atmospheric Telemetry Ticker Strip */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl">
              <div className="hud-panel p-2.5 text-left border-cyan-500/30">
                <div className="text-[8px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                  BASIN AQI
                </div>
                <div className="text-lg font-black font-mono text-white mt-0.5">
                  215 <span className="text-[9px] text-red-400 font-semibold">SEVERE</span>
                </div>
              </div>

              <div className="hud-panel p-2.5 text-left border-emerald-500/30">
                <div className="text-[8px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                  HCHO (TROPOMI)
                </div>
                <div className="text-lg font-black font-mono text-white mt-0.5">
                  1.68 <span className="text-[9px] text-emerald-400 font-semibold">10¹⁵</span>
                </div>
              </div>

              <div className="hud-panel p-2.5 text-left border-purple-500/30">
                <div className="text-[8px] font-mono text-purple-400 uppercase font-bold tracking-wider">
                  INVERSION LID
                </div>
                <div className="text-lg font-black font-mono text-white mt-0.5">
                  520m <span className="text-[9px] text-purple-400 font-semibold">TRAP</span>
                </div>
              </div>

              <div className="hud-panel p-2.5 text-left border-amber-500/30">
                <div className="text-[8px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                  ACTIVE FIRES
                </div>
                <div className="text-lg font-black font-mono text-white mt-0.5">
                  1,420 <span className="text-[9px] text-amber-400 font-semibold">VIIRS</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Clear viewport area dedicated to 3D Sentinel drone */}
          <div className="lg:col-span-5 h-[340px] sm:h-[460px] lg:h-[580px] pointer-events-none" />

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-60 text-[10px] font-mono tracking-widest text-zinc-400">
          <span>SCROLL FOR INTELLIGENCE</span>
          <ChevronDown size={14} className="animate-bounce text-cyan-400" />
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
          ACT 3: INTERACTIVE HOTSPOT & ATMOSPHERIC SPECTROMETRY
         ==================================================================== */}
      <section id="hotspots" className="relative py-28 px-4 sm:px-8 border-t border-white/[0.06] bg-[#05070A]">
        <div className="max-w-6xl mx-auto space-y-12 gsap-reveal">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.08] pb-6">
            <div className="space-y-2">
              <div className="hud-tag inline-block">REGIONAL CRITICAL HOTSPOTS</div>
              <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
                INDO-GANGETIC AIR INTELLIGENCE
              </h2>
              <p className="text-xs text-zinc-400 max-w-xl">
                Select criteria pollutants and critical regional hotspots to inspect real-time satellite telemetry, mixing depths, and dominant emission sources.
              </p>
            </div>

            {/* Layer Filter Buttons */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#0B1016] border border-white/10">
              {Object.keys(layerMetadata).map((layer) => (
                <button
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeLayer === layer
                      ? 'bg-cyan-400 text-[#05070A] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>
          </div>

          {/* Hotspot Explorer Dual Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Hotspot List Selector */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest px-1">
                SELECT CRITICAL MONITORING ZONE
              </div>
              {hotspotsList.map((spot, idx) => {
                const isSelected = idx === selectedHotspotIndex
                return (
                  <div
                    key={spot.id}
                    onClick={() => setSelectedHotspotIndex(idx)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#0B1016] border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.15)] translate-x-1.5'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs text-cyan-400 font-bold">{spot.id}</span>
                        <h4 className="text-sm font-bold text-white font-sans">{spot.name}</h4>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        spot.aqi > 200 ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        AQI {spot.aqi}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-2">
                      <span>{spot.district}, {spot.state}</span>
                      <span className="text-cyan-300">{spot.intensity}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right: Selected Hotspot Deep Telemetry HUD */}
            <div className="lg:col-span-7 hud-panel p-6 border-cyan-500/40 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
                    TELEMETRY ANALYSIS // ZONE #{currentHotspot.id}
                  </span>
                  <h3 className="text-2xl font-black text-white font-display uppercase mt-0.5">
                    {currentHotspot.name}
                  </h3>
                  <span className="text-xs text-zinc-400 font-sans">
                    Classification: <strong className="text-cyan-300">{currentHotspot.type}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black font-mono text-cyan-400">
                    {activeLayer === 'AQI' && currentHotspot.aqi}
                    {activeLayer === 'HCHO' && `${currentHotspot.hcho} × 10¹⁵`}
                    {activeLayer === 'NO2' && `${currentHotspot.no2} µg/m³`}
                    {activeLayer === 'SO2' && `${currentHotspot.so2} µg/m³`}
                    {activeLayer === 'CO' && `${currentHotspot.co} mg/m³`}
                    {activeLayer === 'PM2.5' && `${currentHotspot.pm25} µg/m³`}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    Current {activeLayer} Observed Value
                  </span>
                </div>
              </div>

              {/* Driver Pills */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                  PRIMARY FORCING FACTORS & DRIVERS
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentHotspot.drivers.map((d, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-zinc-200">
                      ⚡ {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Source Attribution Breakdown */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-cyan-400 font-bold uppercase">SOURCE ATTRIBUTION BREAKDOWN</span>
                  <span className="text-zinc-400">{currentHotspot.trend}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {currentHotspot.dominantSource}
                </p>
              </div>

              {/* Boundary Layer & Ventilation Specs */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">PLANETARY BOUNDARY LAYER</span>
                  <span className="text-sm font-mono font-bold text-white">{currentHotspot.blh} (ERA5 Reanalysis)</span>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">VENTILATION INDEX</span>
                  <span className="text-sm font-mono font-bold text-white">{currentHotspot.ventilation}</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ====================================================================
          ACT 4: HIGH-THROUGHPUT DATA PIPELINE (SPACE TO GROUND)
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
          ACT 6: VAYU AI CONSOLE MODAL & FLOATING TRIGGER
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
                <span className="text-xs font-black uppercase text-white">VAYU AI // ENVIRONMENTAL INTELLIGENCE COPILOT</span>
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

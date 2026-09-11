import React, { useEffect, useState, useRef } from 'react'
import { useStore } from './store'
import DashboardView from './components/DashboardView'
import LiveMapView from './components/LiveMapView'
import ForecastView from './components/ForecastView'
import HotspotsView from './components/HotspotsView'
import FiresView from './components/FiresView'
import TransportView from './components/TransportView'
import AttributionView from './components/AttributionView'
import DistrictAnalyticsView from './components/DistrictAnalyticsView'
import ReportsView from './components/ReportsView'
import AlertsView from './components/AlertsView'
import DataExplorerView from './components/DataExplorerView'
import PolicySimulatorView from './components/PolicySimulatorView'
import CinematicLanding from './components/CinematicLanding'
import AtmosphericCommandBackground from './components/3d/AtmosphericCommandBackground'
import CustomCursor from './components/ui/CustomCursor'
import { 
  LayoutDashboard, Map, Compass, Activity, Flame, Wind, 
  Tag, BarChart3, FileSpreadsheet, BellRing, Database,
  Sun, Moon, Calendar, Sliders, ChevronDown, Download, Sparkles
} from 'lucide-react'

export default function App() {
  const { 
    activeTab, 
    setActiveTab, 
    selectedDate, 
    setSelectedDate, 
    dates, 
    fetchMetadata,
    theme,
    toggleTheme,
    setTheme
  } = useStore()

  const [enteredDashboard, setEnteredDashboard] = useState(false)
  const [analyticsDropdownOpen, setAnalyticsDropdownOpen] = useState(false)
  const [intelligenceDropdownOpen, setIntelligenceDropdownOpen] = useState(false)

  const analyticsRef = useRef(null)
  const intelligenceRef = useRef(null)

  useEffect(() => {
    // Sync initial theme
    const savedTheme = localStorage.getItem('vayu_theme') || 'dark'
    setTheme(savedTheme)
    fetchMetadata()
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (analyticsRef.current && !analyticsRef.current.contains(event.target)) {
        setAnalyticsDropdownOpen(false)
      }
      if (intelligenceRef.current && !intelligenceRef.current.contains(event.target)) {
        setIntelligenceDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!enteredDashboard) {
    return <CinematicLanding onEnterDashboard={() => setEnteredDashboard(true)} />
  }

  // Analytics tab group items
  const analyticsItems = [
    { name: 'AQI Forecast', icon: Compass },
    { name: 'HCHO Hotspots', icon: Activity },
    { name: 'Fire Detection', icon: Flame },
    { name: 'Wind Transport', icon: Wind },
  ]

  // Intelligence tab group items
  const intelligenceItems = [
    { name: 'Source Attribution', icon: Tag },
    { name: 'District Analytics', icon: BarChart3 },
    { name: 'Alerts', icon: BellRing },
  ]

  const isAnalyticsActive = analyticsItems.some(item => item.name === activeTab)
  const isIntelligenceActive = intelligenceItems.some(item => item.name === activeTab)

  // Render active view
  const renderView = () => {
    switch (activeTab) {
      case 'Dashboard':
      case 'Overview': return <DashboardView />
      case 'Live Map': return <LiveMapView />
      case 'Policy Simulator': return <PolicySimulatorView />
      case 'AQI Forecast': return <ForecastView />
      case 'HCHO Hotspots': return <HotspotsView />
      case 'Fire Detection': return <FiresView />
      case 'Wind Transport': return <TransportView />
      case 'Source Attribution': return <AttributionView />
      case 'District Analytics': return <DistrictAnalyticsView />
      case 'Reports': return <ReportsView />
      case 'Alerts': return <AlertsView />
      case 'Data Explorer': return <DataExplorerView />
      default: return <DashboardView />
    }
  }

  return (
    <div className="app-workspace min-h-screen flex flex-col font-outfit select-none relative z-0">
      
      {/* Global 3D Atmospheric Background Layer (Non-intrusive) */}
      <AtmosphericCommandBackground />

      {/* Desktop-Only Minimal Atmospheric Custom Cursor */}
      <CustomCursor />
      
      {/* 1. HORIZONTAL TOP FLOATING COMMAND BAR */}
      <header className="sticky top-0 z-50 px-4 lg:px-6 py-2.5 flex items-center justify-between backdrop-blur-2xl bg-[#04070D]/85 border-b border-cyan-500/15 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        
        {/* Left Brand Logo & Cinematic Story Switcher */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div 
            onClick={() => setEnteredDashboard(false)}
            className="flex items-center space-x-2.5 cursor-pointer group"
            title="Return to Cinematic Storytelling Platform"
          >
            <div className="w-8 h-8 rounded-lg bg-[#060B13] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)] group-hover:border-cyan-300 transition-all">
              <span className="text-base">🛰️</span>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider uppercase text-white flex items-center gap-1.5 font-display">
                VayuShetra
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              </h1>
              <span className="text-[8px] font-mono tracking-widest text-cyan-400 uppercase block -mt-0.5 font-bold">
                ATMOSPHERIC COMMAND
              </span>
            </div>
          </div>

          <button
            onClick={() => setEnteredDashboard(false)}
            className="hidden sm:flex items-center space-x-1.5 text-[10px] font-mono px-2.5 py-1 rounded-md bg-[#060B13] border border-white/10 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-400 transition-all ml-1 shadow-sm"
          >
            <span>← STORY</span>
          </button>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 text-xs font-semibold">
          
          {/* Overview */}
          <button
            onClick={() => setActiveTab('Dashboard')}
            className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all ${
              activeTab === 'Dashboard' || activeTab === 'Overview'
                ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white shadow-[0_0_16px_rgba(0,240,255,0.4)] border border-cyan-300/40 font-bold'
                : 'text-zinc-400 hover:text-cyan-300 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <LayoutDashboard size={13} />
            <span>Overview</span>
          </button>

          {/* Live Map */}
          <button
            onClick={() => setActiveTab('Live Map')}
            className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all ${
              activeTab === 'Live Map'
                ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white shadow-[0_0_16px_rgba(0,240,255,0.4)] border border-cyan-300/40 font-bold'
                : 'text-zinc-400 hover:text-cyan-300 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <Map size={13} />
            <span>Live Map</span>
          </button>

          {/* Analytics Dropdown */}
          <div className="relative" ref={analyticsRef}>
            <button
              onClick={() => setAnalyticsDropdownOpen(!analyticsDropdownOpen)}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all ${
                isAnalyticsActive
                  ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white shadow-[0_0_16px_rgba(0,240,255,0.4)] border border-cyan-300/40 font-bold'
                  : 'text-zinc-400 hover:text-cyan-300 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Activity size={13} />
              <span>{isAnalyticsActive ? activeTab : 'Analytics'}</span>
              <ChevronDown size={12} className={`transition-transform ${analyticsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {analyticsDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-48 rounded-2xl bg-[#060C14]/95 border border-cyan-500/25 shadow-2xl p-1.5 z-50 space-y-0.5 animate-fadeIn backdrop-blur-2xl">
                {analyticsItems.map(item => {
                  const Icon = item.icon
                  const isSelected = activeTab === item.name
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setActiveTab(item.name)
                        setAnalyticsDropdownOpen(false)
                      }}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                        isSelected 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm font-bold' 
                          : 'hover:bg-white/[0.06] text-zinc-300 hover:text-white'
                      }`}
                    >
                      <Icon size={13} />
                      <span>{item.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Intelligence Dropdown */}
          <div className="relative" ref={intelligenceRef}>
            <button
              onClick={() => setIntelligenceDropdownOpen(!intelligenceDropdownOpen)}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all ${
                isIntelligenceActive
                  ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white shadow-[0_0_16px_rgba(0,240,255,0.4)] border border-cyan-300/40 font-bold'
                  : 'text-zinc-400 hover:text-cyan-300 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Sparkles size={13} />
              <span>{isIntelligenceActive ? activeTab : 'Intelligence'}</span>
              <ChevronDown size={12} className={`transition-transform ${intelligenceDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {intelligenceDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-52 rounded-2xl bg-[#060C14]/95 border border-cyan-500/25 shadow-2xl p-1.5 z-50 space-y-0.5 animate-fadeIn backdrop-blur-2xl">
                {intelligenceItems.map(item => {
                  const Icon = item.icon
                  const isSelected = activeTab === item.name
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setActiveTab(item.name)
                        setIntelligenceDropdownOpen(false)
                      }}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                        isSelected 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm font-bold' 
                          : 'hover:bg-white/[0.06] text-zinc-300 hover:text-white'
                      }`}
                    >
                      <Icon size={13} />
                      <span>{item.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Policy Simulator */}
          <button
            onClick={() => setActiveTab('Policy Simulator')}
            className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all ${
              activeTab === 'Policy Simulator'
                ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white shadow-[0_0_16px_rgba(0,240,255,0.4)] border border-cyan-300/40 font-bold'
                : 'text-zinc-400 hover:text-cyan-300 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <Sliders size={13} />
            <span>Policy Simulator</span>
          </button>

          {/* Data Explorer */}
          <button
            onClick={() => setActiveTab('Data Explorer')}
            className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all ${
              activeTab === 'Data Explorer'
                ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white shadow-[0_0_16px_rgba(0,240,255,0.4)] border border-cyan-300/40 font-bold'
                : 'text-zinc-400 hover:text-cyan-300 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <Database size={13} />
            <span>Data Explorer</span>
          </button>

          {/* Reports */}
          <button
            onClick={() => setActiveTab('Reports')}
            className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all ${
              activeTab === 'Reports'
                ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white shadow-[0_0_16px_rgba(0,240,255,0.4)] border border-cyan-300/40 font-bold'
                : 'text-zinc-400 hover:text-cyan-300 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <FileSpreadsheet size={13} />
            <span>Reports</span>
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          
          {/* Telemetry Coordinate Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#060B13]/90 border border-cyan-500/20 text-[10px] font-mono text-zinc-300 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="tracking-wider">LAT 28.61°N | LON 77.21°E</span>
          </div>

          {/* Date Selector Pill */}
          <div className="relative flex items-center">
            <Calendar size={13} className="absolute left-3 text-cyan-400 pointer-events-none" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#060B13] border border-white/10 hover:border-cyan-500/40 pl-8 pr-3 py-1.5 text-xs font-semibold font-mono text-zinc-200 outline-none cursor-pointer rounded-xl transition-all min-w-[135px]"
            >
              {dates && dates.length > 0 ? (
                dates.map(d => (
                  <option key={d} value={d} className="bg-[#060B13] text-white">
                    {d}
                  </option>
                ))
              ) : (
                <option value={selectedDate} className="bg-[#060B13] text-white">
                  {selectedDate || "2025-11-05"}
                </option>
              )}
            </select>
          </div>

          {/* Theme Toggle Sun / Moon Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[#060B13] border border-white/10 hover:border-cyan-500/40 text-zinc-400 hover:text-white transition-all shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-cyan-400" />}
          </button>

          {/* Export Report Pill Button */}
          <button
            onClick={() => setActiveTab('Reports')}
            className="px-4 py-1.5 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center space-x-1.5 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all active:scale-95"
          >
            <Download size={13} />
            <span>Dossier Reports</span>
          </button>
        </div>

      </header>

      {/* 2. MAIN APPLICATION CONTENT VIEW */}
      <main className="flex-1 px-4 lg:px-8 py-5 overflow-y-auto max-w-[1800px] w-full mx-auto relative z-10">
        {renderView()}
      </main>

    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import Robot from './Robot'

/**
 * Compact 3D AI Sentinel Companion for Command Center Header
 * - Ocular sensors track desktop mouse movements
 * - Head articulates with fluid inertia damping
 * - Integrated atmospheric status indicator
 */
export default function SentinelHUDWidget({ aqi = 142, district = 'Ambala' }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate normalized mouse offset relative to screen
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Derive atmospheric sentinel state
  let statusColor = '#10b981' // Good
  let statusText = 'OPTIMAL'
  if (aqi > 200) {
    statusColor = '#ef4444' // Poor/Severe
    statusText = 'CRITICAL ALERT'
  } else if (aqi > 100) {
    statusColor = '#f59e0b' // Moderate
    statusText = 'MONITORING'
  }

  return (
    <div 
      ref={containerRef}
      className="flex items-center gap-3 bg-[#060b13]/85 border border-cyan-500/25 rounded-2xl px-3 py-1.5 shadow-[0_0_20px_rgba(0,240,255,0.08)] backdrop-blur-xl"
    >
      {/* 3D Sentinel Mini-Viewport */}
      <div className="w-14 h-14 relative flex-shrink-0 cursor-crosshair">
        <Canvas
          camera={{ position: [0, 0.25, 2.5], fov: 40 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={1.1} />
          <directionalLight position={[0, 2, 4]} intensity={2.4} color="#ffffff" />
          <directionalLight position={[-2, 1, 1]} intensity={1.5} color="#00f0ff" />
          <pointLight position={[0, 0.5, 2]} intensity={1.6} color="#38bdf8" distance={5} />
          
          <group scale={0.75} position={[0, -0.15, 0]}>
            <React.Suspense fallback={null}>
              <Robot mousePos={mousePos} isMobile={false} />
            </React.Suspense>
          </group>
        </Canvas>
        
        {/* Subtle scan ring */}
        <div 
          className="absolute inset-0 rounded-full border border-cyan-400/20 pointer-events-none animate-ping"
          style={{ animationDuration: '4s' }}
        />
      </div>

      {/* Sentinel Telemetry Readout */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span 
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-400">
            SENTINEL AI // ACTIVE
          </span>
        </div>
        <div className="text-[11px] font-bold text-white tracking-tight flex items-center gap-1.5">
          <span>{district}</span>
          <span className="text-zinc-500 font-mono text-[9px]">AQI {aqi}</span>
        </div>
        <div className="text-[8px] font-mono uppercase tracking-widest" style={{ color: statusColor }}>
          ● {statusText}
        </div>
      </div>
    </div>
  )
}

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

/**
 * Floating 3D Telemetry Badges orbiting directly around the sentinel
 */
export default function FloatingData({ dashboardData, isMobile = false }) {
  const group1Ref = useRef()
  const group2Ref = useRef()
  const group3Ref = useRef()

  const currentAqi = dashboardData?.summary?.avg_aqi || 215
  const currentPm25 = dashboardData?.summary?.avg_pm25 || 90.5
  const currentHcho = 1.40

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (group1Ref.current) {
      group1Ref.current.position.y = 0.85 + Math.sin(t * 1.4) * 0.07
      group1Ref.current.position.x = -1.55 + Math.cos(t * 0.9) * 0.04
    }
    if (group2Ref.current) {
      group2Ref.current.position.y = 0.35 + Math.cos(t * 1.6) * 0.07
      group2Ref.current.position.x = 1.55 + Math.sin(t * 1.1) * 0.04
    }
    if (group3Ref.current) {
      group3Ref.current.position.y = -1.35 + Math.sin(t * 1.2 + 1) * 0.05
    }
  })

  // Hide 3D floating html badges on small mobile screens to prevent overlay clutter
  if (isMobile) return null

  return (
    <group>
      {/* Left HUD: AQI & PM2.5 Telemetry */}
      <group ref={group1Ref} position={[-1.55, 0.85, 0]}>
        <Html center distanceFactor={11} className="pointer-events-none select-none">
          <div className="bg-[#070B10]/90 border border-cyan-500/40 backdrop-blur-md px-3 py-2 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.2)] min-w-[150px] text-left transform -rotate-1">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1 mb-1">
              <span className="text-[8px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                BASIN TELEMETRY
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-white tracking-tight">
                {currentAqi}
              </span>
              <span className="text-[9px] font-mono text-red-400 font-semibold uppercase">
                AQI // SEVERE
              </span>
            </div>
            <div className="text-[9px] font-mono text-zinc-400">
              PM2.5: <span className="text-cyan-300 font-semibold">{currentPm25} µg/m³</span>
            </div>
          </div>
        </Html>
      </group>

      {/* Right HUD: Satellite Retrival */}
      <group ref={group2Ref} position={[1.55, 0.35, 0]}>
        <Html center distanceFactor={11} className="pointer-events-none select-none">
          <div className="bg-[#070B10]/90 border border-emerald-500/40 backdrop-blur-md px-3 py-2 rounded-xl shadow-[0_0_20px_rgba(74,222,128,0.2)] min-w-[155px] text-left transform rotate-1">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1 mb-1">
              <span className="text-[8px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
                SENTINEL-5P TROPOMI
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-white tracking-tight">
                {currentHcho}
              </span>
              <span className="text-[8px] font-mono text-emerald-400 font-semibold">
                10¹⁵ mol/cm²
              </span>
            </div>
            <div className="text-[9px] font-mono text-zinc-400">
              VOC Tracer: <span className="text-emerald-300 font-semibold">Biomass Elevated</span>
            </div>
          </div>
        </Html>
      </group>

      {/* Bottom HUD: Boundary Layer Inversion */}
      <group ref={group3Ref} position={[0, -1.35, 0.4]}>
        <Html center distanceFactor={11} className="pointer-events-none select-none">
          <div className="bg-[#070B10]/90 border border-purple-500/40 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.2)] text-center min-w-[190px]">
            <div className="text-[8px] font-mono text-purple-300 font-bold tracking-widest uppercase flex items-center justify-center gap-1.5">
              <span>ERA5 BLH: 520m</span>
              <span className="text-zinc-500">•</span>
              <span>NW 12.4 km/h</span>
            </div>
          </div>
        </Html>
      </group>
    </group>
  )
}

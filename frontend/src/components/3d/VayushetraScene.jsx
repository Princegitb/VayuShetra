import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Robot from './Robot'
import AirParticles from './AirParticles'

// Camera Rig that adds subtle cinematic parallax to the mouse coordinates
function CameraRig({ mousePos, isMobile }) {
  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.1)
    const targetX = isMobile ? 0 : mousePos.x * 0.35
    const targetY = isMobile ? 0 : mousePos.y * 0.25

    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 2.5, safeDelta)
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 2.5, safeDelta)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export default function VayushetraScene({ dashboardData }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile & track normalized mouse position [-1, 1]
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    const handleMouseMove = (e) => {
      // Normalize from -1 to 1 centered on viewport
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 46 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.15
          scene.fog = new THREE.FogExp2('#05070a', 0.08)
        }}
      >
        {/* Cinematic Ambient & Key Lighting */}
        <ambientLight intensity={0.65} color="#0a1526" />
        
        {/* Main Sun/Key Light */}
        <directionalLight position={[4, 5, 4]} intensity={1.4} color="#f0f9ff" castShadow />
        
        {/* Electric Cyan Rim Light */}
        <directionalLight position={[-5, 2, -1]} intensity={2.8} color="#00f0ff" />
        
        {/* Atmospheric Blue Backlight */}
        <pointLight position={[0, -2, -3]} intensity={2.0} color="#0070f3" distance={8} />

        {/* Dynamic Camera Parallax */}
        <CameraRig mousePos={mousePos} isMobile={isMobile} />

        {/* Sentinel Robot (Positioned on the right on desktop, center on mobile, scaled elegantly) */}
        <group position={[isMobile ? 0 : 1.9, isMobile ? 0.1 : 0, 0]} scale={[0.95, 0.95, 0.95]}>
          <Robot mousePos={mousePos} isMobile={isMobile} />
        </group>

        {/* Air Particulate Stream (Permeating the entire scene volume) */}
        <AirParticles mousePos={mousePos} isMobile={isMobile} count={600} />
      </Canvas>
    </div>
  )
}

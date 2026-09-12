import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import AtmosphericEarth from './AtmosphericEarth'
import Robot from './Robot'
import DataConduit from './DataConduit'
import AirParticles from './AirParticles'

// Camera Rig that adds subtle cinematic parallax to the mouse coordinates
function CameraRig({ mousePos, isMobile }) {
  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.1)
    const targetX = isMobile ? 0 : mousePos.x * 0.28
    const targetY = isMobile ? 0 : mousePos.y * 0.18

    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 2.0, safeDelta)
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 2.0, safeDelta)
    state.camera.lookAt(isMobile ? 0 : 0.45, 0, 0)
  })
  return null
}

export default function VayushetraScene({ dashboardData }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [indiaWorldPos, setIndiaWorldPos] = useState([2.2, 0.6, 1.1])

  // Detect mobile & track normalized mouse position [-1, 1]
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    const handleMouseMove = (e) => {
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

  // Position calculations matching user reference image composition:
  // Earth = Center Hero Visual (middle of screen, extending behind UI)
  // Robot = Secondary AI Sentinel (lower-right foreground on holographic pedestal, pointing to India)
  const earthPos = isMobile ? [0, 0.4, -0.3] : [0.75, 0.08, -0.1]
  const robotPos = isMobile ? [0, -1.2, 1.1] : [2.35, -0.46, 1.35]
  const robotScale = isMobile ? [0.38, 0.38, 0.38] : [0.46, 0.46, 0.46]

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto z-0 overflow-hidden">
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
          gl.toneMappingExposure = 1.18
          scene.fog = new THREE.FogExp2('#05070a', 0.06)
        }}
      >
        {/* Cinematic Ambient & Key Lighting */}
        <ambientLight intensity={0.7} color="#08111e" />
        
        {/* Main Planetary Sun Light (Deep space solar illumination) */}
        <directionalLight position={[5, 4, 5]} intensity={2.0} color="#f8fafc" castShadow />
        
        {/* Electric Cyan Atmospheric Rim Light */}
        <directionalLight position={[-6, 2, -1]} intensity={2.8} color="#00f0ff" />
        
        {/* Dedicated Key Light for Robot Chassis & Face */}
        <directionalLight position={[2.5, 2, 4]} intensity={2.2} color="#ffffff" />
        <pointLight position={[robotPos[0], robotPos[1] + 1.0, robotPos[2] + 1.5]} intensity={1.8} color="#e0f2fe" distance={6} />

        {/* Deep Atmospheric Blue Backlight */}
        <pointLight position={[0, -2, -3]} intensity={2.0} color="#0070f3" distance={9} />

        {/* Subtle Deep Space Starfield */}
        <Stars radius={120} depth={50} count={1800} factor={3.2} saturation={0} fade speed={0.5} />

        {/* Dynamic Camera Parallax */}
        <CameraRig mousePos={mousePos} isMobile={isMobile} />

        {/* ====================================================================
            1. PRIMARY HERO VISUAL: 3D PHOTOREALISTIC ATMOSPHERIC EARTH (45-50% Viewport)
           ==================================================================== */}
        <group position={earthPos}>
          <React.Suspense fallback={
            <mesh>
              <sphereGeometry args={[1.55, 32, 32]} />
              <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.2} />
            </mesh>
          }>
            <AtmosphericEarth
              radius={1.55}
              mousePos={mousePos}
              isMobile={isMobile}
              onIndiaWorldPos={(pos) => setIndiaWorldPos([pos.x, pos.y, pos.z])}
            />
          </React.Suspense>
        </group>

        {/* ====================================================================
            2. SECONDARY AI GUIDE: 3D VAYU AI ROBOT (Lower-right foreground)
           ==================================================================== */}
        <group position={robotPos} scale={robotScale}>
          <React.Suspense fallback={null}>
            <Robot mousePos={mousePos} isMobile={isMobile} />
          </React.Suspense>
        </group>

        {/* ====================================================================
            3. EARTH + ROBOT INTERACTION: GLOWING TELEMETRY DATA CONDUIT
               (Satellite Data -> Earth -> Atmospheric Analysis -> Vayu AI)
           ==================================================================== */}
        {!isMobile && (
          <DataConduit
            startPos={indiaWorldPos}
            endPos={[robotPos[0] - 0.08, robotPos[1] + 0.18, robotPos[2]]}
          />
        )}

        {/* ====================================================================
            4. ATMOSPHERIC AEROSOL STREAMLINE PARTICLES
           ==================================================================== */}
        <AirParticles mousePos={mousePos} isMobile={isMobile} count={650} />
      </Canvas>
    </div>
  )
}

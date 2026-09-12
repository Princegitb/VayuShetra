import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import AtmosphericEarth from './AtmosphericEarth'
import Robot from './Robot'
import DataConduit from './DataConduit'
import AirParticles from './AirParticles'

// Camera Rig that adds subtle cinematic parallax to the mouse coordinates
function CameraRig({ mousePos, isMobile }) {
  const { viewport } = useThree()
  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.1)
    const targetX = isMobile ? 0 : mousePos.x * 0.22
    const targetY = isMobile ? 0 : mousePos.y * 0.15

    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 2.0, safeDelta)
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 2.0, safeDelta)
    const lookX = isMobile ? 0 : Math.min(0.45, viewport.width * 0.09)
    state.camera.lookAt(lookX, 0, 0)
  })
  return null
}

// Responsive Scene Content: Dynamically adjusts Earth and Robot positions and scales on Zoom In / Out!
function ResponsiveHeroScene({ mousePos, isMobile }) {
  const { viewport } = useThree()

  // Responsive calculations based on real-time canvas viewport (handles browser zoom in/out perfectly!)
  const isCompact = isMobile || viewport.width < 3.6

  // 1. Responsive Earth: scales proportionally with viewport, staying safely in right-center
  const earthRadius = isCompact
    ? Math.min(1.1, viewport.width * 0.28)
    : Math.min(1.35, Math.max(0.9, viewport.height * 0.44))

  const earthX = isCompact ? 0 : Math.min(1.25, Math.max(0.65, viewport.width * 0.22))
  const earthY = isCompact ? viewport.height * 0.15 : 0.04
  const earthPos = [earthX, earthY, -0.15]

  // 2. Responsive Robot: scales proportionally with viewport, staying inside the right viewport margin
  const robotScaleVal = isCompact
    ? Math.min(0.35, viewport.width * 0.1)
    : Math.min(0.48, Math.max(0.3, viewport.height * 0.16))
  const robotScale = [robotScaleVal, robotScaleVal, robotScaleVal]

  const robotX = isCompact ? 0 : Math.min(2.35, Math.max(1.45, viewport.width * 0.41))
  const robotY = isCompact ? -viewport.height * 0.32 : -Math.max(0.38, viewport.height * 0.18)
  const robotPos = [robotX, robotY, 1.3]

  // Dedicated light positioning for robot
  const robotLightPos = [robotPos[0], robotPos[1] + 1.0, robotPos[2] + 1.5]

  return (
    <>
      {/* Cinematic Ambient & Key Lighting */}
      <ambientLight intensity={0.7} color="#08111e" />
      
      {/* Main Planetary Sun Light */}
      <directionalLight position={[5, 4, 5]} intensity={2.0} color="#f8fafc" castShadow />
      
      {/* Electric Cyan Atmospheric Rim Light */}
      <directionalLight position={[-6, 2, -1]} intensity={2.8} color="#00f0ff" />
      
      {/* Dedicated Key Light for Robot Chassis & Face */}
      <directionalLight position={[2.5, 2, 4]} intensity={2.2} color="#ffffff" />
      <pointLight position={robotLightPos} intensity={1.8} color="#e0f2fe" distance={6} />

      {/* Deep Atmospheric Blue Backlight */}
      <pointLight position={[0, -2, -3]} intensity={2.0} color="#0070f3" distance={9} />

      {/* Subtle Deep Space Starfield */}
      <Stars radius={120} depth={50} count={1800} factor={3.2} saturation={0} fade speed={0.5} />

      {/* Dynamic Camera Parallax */}
      <CameraRig mousePos={mousePos} isMobile={isMobile} />

      {/* 1. PRIMARY HERO VISUAL: 3D PHOTOREALISTIC ATMOSPHERIC EARTH */}
      <group position={earthPos}>
        <React.Suspense fallback={
          <mesh>
            <sphereGeometry args={[earthRadius, 32, 32]} />
            <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.2} />
          </mesh>
        }>
          <AtmosphericEarth
            radius={earthRadius}
            mousePos={mousePos}
            isMobile={isMobile}
          />
        </React.Suspense>
      </group>

      {/* 2. SECONDARY AI GUIDE: 3D VAYU AI ROBOT (Auto-scales on Zoom in/out) */}
      <group position={robotPos} scale={robotScale}>
        <React.Suspense fallback={null}>
          <Robot mousePos={mousePos} isMobile={isMobile} />
        </React.Suspense>
      </group>

      {/* 3. EARTH + ROBOT INTERACTION: GLOWING TELEMETRY DATA CONDUIT */}
      {!isMobile && (
        <DataConduit
          startPos={[earthPos[0] + earthRadius * 0.22, earthPos[1] + earthRadius * 0.25, 0.2]}
          endPos={[robotPos[0] - 0.12, robotPos[1] + 0.2, robotPos[2]]}
        />
      )}

      {/* 4. ATMOSPHERIC AEROSOL STREAMLINE PARTICLES */}
      <AirParticles mousePos={mousePos} isMobile={isMobile} count={650} />
    </>
  )
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
        <ResponsiveHeroScene mousePos={mousePos} isMobile={isMobile} />
      </Canvas>
    </div>
  )
}

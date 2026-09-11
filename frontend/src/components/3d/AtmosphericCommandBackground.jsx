import React, { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Subtle 3D Atmospheric Background Layer for Command Center
 * - Atmospheric aerosol particles with Northwesterly drift
 * - Gentle depth parallax following mouse coordinates with smooth damping
 * - Distant glowing telemetry sensor stars
 * - Non-intrusive: rendered behind DOM interface with pointer-events-none
 */

function AmbientAtmosphere({ mousePos, reducedMotion }) {
  const pointsRef = useRef()
  const linesRef = useRef()
  const groupRef = useRef()

  const count = 420

  // Generate particulate coordinate buffers
  const [positions, colors, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const spd = new Float32Array(count * 3)

    const palette = [
      new THREE.Color('#00f0ff'), // Electric Cyan
      new THREE.Color('#0070f3'), // Atmospheric Blue
      new THREE.Color('#38bdf8'), // Sky Blue
      new THREE.Color('#8b5cf6'), // Violet
      new THREE.Color('#0ea5e9')  // Deep Cyan
    ]

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      pos[i3] = (Math.random() - 0.5) * 22
      pos[i3 + 1] = (Math.random() - 0.5) * 16
      pos[i3 + 2] = (Math.random() - 0.5) * 12 - 2

      // Drift velocities (NW to SE atmospheric flow)
      spd[i3] = 0.004 + Math.random() * 0.008
      spd[i3 + 1] = -0.002 - Math.random() * 0.004
      spd[i3 + 2] = (Math.random() - 0.5) * 0.002

      const color = palette[Math.floor(Math.random() * palette.length)]
      col[i3] = color.r
      col[i3 + 1] = color.g
      col[i3 + 2] = color.b
    }

    return [pos, col, spd]
  }, [])

  // Create soft glowing circular particle texture
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.35, 'rgba(0, 240, 255, 0.75)')
    gradient.addColorStop(0.8, 'rgba(0, 112, 243, 0.15)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 32, 32)
    return new THREE.CanvasTexture(canvas)
  }, [])

  // Animation Loop with damped parallax
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    const safeDelta = Math.min(delta, 0.1)

    // Damped parallax shift on entire background group
    if (groupRef.current && !reducedMotion) {
      const targetRotX = -mousePos.y * 0.06
      const targetRotY = mousePos.x * 0.08
      const targetPosX = mousePos.x * 0.45
      const targetPosY = mousePos.y * 0.35

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.04)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.04)
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.04)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.04)
    }

    // Drift particles continuously
    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.attributes.position
      const arr = posAttr.array

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        arr[i3] += speeds[i3] + Math.sin(time * 0.2 + arr[i3 + 1]) * 0.001
        arr[i3 + 1] += speeds[i3 + 1] + Math.cos(time * 0.2 + arr[i3]) * 0.001
        arr[i3 + 2] += speeds[i3 + 2]

        // Wraparound boundary
        if (arr[i3] > 11) arr[i3] = -11
        if (arr[i3] < -11) arr[i3] = 11
        if (arr[i3 + 1] > 8) arr[i3 + 1] = -8
        if (arr[i3 + 1] < -8) arr[i3 + 1] = 8
      }

      posAttr.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef}>
      {/* 1. Atmospheric Aerosol Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.11}
          vertexColors
          transparent
          opacity={0.65}
          map={particleTexture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* 2. Soft Atmospheric Ambient Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 4, -4]} color="#00f0ff" intensity={0.8} distance={18} />
      <pointLight position={[6, -4, -6]} color="#8b5cf6" intensity={0.6} distance={16} />
    </group>
  )
}

export default function AtmosphericCommandBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    const handler = (e) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [reducedMotion])

  return (
    <div 
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse 90% 70% at 50% -10%, #06111f 0%, #04070d 65%, #020408 100%)'
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: false
        }}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <AmbientAtmosphere mousePos={mousePos} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}

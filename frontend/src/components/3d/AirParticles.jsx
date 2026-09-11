import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Interactive 3D Atmospheric Particulate System
 * - Flowing aerosols with wind advection vector
 * - Cursor repulsion physics for atmospheric turbulence
 * - Multi-colored particulate spectrum (Cyan, Electric Blue, Amber Hotspots)
 */
export default function AirParticles({ count = 600, mousePos = { x: 0, y: 0 }, isMobile = false }) {
  const pointsRef = useRef()
  const actualCount = isMobile ? Math.min(200, count) : count

  // Generate particle buffer data
  const { positions, initialPositions, colors, scales, speeds } = useMemo(() => {
    const pos = new Float32Array(actualCount * 3)
    const initPos = new Float32Array(actualCount * 3)
    const col = new Float32Array(actualCount * 3)
    const sca = new Float32Array(actualCount)
    const spd = new Float32Array(actualCount * 3)

    const colorPalette = [
      new THREE.Color('#00f0ff'), // Cyan (Fresh Air / AQI)
      new THREE.Color('#0070f3'), // Deep Electric Blue
      new THREE.Color('#38bdf8'), // Sky Blue
      new THREE.Color('#f59e0b'), // Amber (Thermal Hotspot Tracer)
      new THREE.Color('#a855f7'), // Purple (NO2 Trace Gas)
    ]

    for (let i = 0; i < actualCount; i++) {
      const i3 = i * 3

      // Spread across a 3D atmospheric volume
      const x = (Math.random() - 0.5) * 16
      const y = (Math.random() - 0.5) * 12
      const z = (Math.random() - 0.5) * 10 - 1

      pos[i3] = x
      pos[i3 + 1] = y
      pos[i3 + 2] = z

      initPos[i3] = x
      initPos[i3 + 1] = y
      initPos[i3 + 2] = z

      // Velocity drift vector (Northwesterly wind drift)
      spd[i3] = 0.008 + Math.random() * 0.018 // drift right
      spd[i3 + 1] = -0.003 - Math.random() * 0.008 // drift slightly downward
      spd[i3 + 2] = (Math.random() - 0.5) * 0.005

      // Color pick with 80% cyan/blue, 20% trace alerts
      const pick = Math.random() > 0.8 ? (Math.random() > 0.5 ? 3 : 4) : (Math.random() > 0.5 ? 0 : 1)
      const c = colorPalette[pick]
      col[i3] = c.r
      col[i3 + 1] = c.g
      col[i3 + 2] = c.b

      sca[i] = 0.03 + Math.random() * 0.08
    }

    return {
      positions: pos,
      initialPositions: initPos,
      colors: col,
      scales: sca,
      speeds: spd
    }
  }, [actualCount])

  // Custom particle texture creation
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.3, 'rgba(0, 240, 255, 0.8)')
    gradient.addColorStop(0.7, 'rgba(0, 112, 243, 0.3)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 32, 32)
    return new THREE.CanvasTexture(canvas)
  }, [])

  // Animation Loop
  useFrame((state, delta) => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes.position
    const pArray = posAttr.array
    const time = state.clock.getElapsedTime()

    // 3D projected cursor coordinate
    const mouseX = mousePos.x * 5.5
    const mouseY = mousePos.y * 3.5

    for (let i = 0; i < actualCount; i++) {
      const i3 = i * 3

      // 1. Wind advection flow
      pArray[i3] += speeds[i3] + Math.sin(time * 0.5 + pArray[i3 + 1]) * 0.003
      pArray[i3 + 1] += speeds[i3 + 1] + Math.cos(time * 0.5 + pArray[i3]) * 0.002
      pArray[i3 + 2] += speeds[i3 + 2]

      // 2. Cursor repulsion physics (aerodynamic disturbance)
      if (!isMobile) {
        const dx = pArray[i3] - mouseX
        const dy = pArray[i3 + 1] - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 1.8 && dist > 0.01) {
          const force = (1.8 - dist) * 0.04
          pArray[i3] += (dx / dist) * force
          pArray[i3 + 1] += (dy / dist) * force
        }
      }

      // 3. Wraparound boundaries
      if (pArray[i3] > 8) pArray[i3] = -8
      if (pArray[i3] < -8) pArray[i3] = 8
      if (pArray[i3 + 1] > 6) pArray[i3 + 1] = -6
      if (pArray[i3 + 1] < -6) pArray[i3 + 1] = 6
      if (pArray[i3 + 2] > 4) pArray[i3 + 2] = -6
      if (pArray[i3 + 2] < -6) pArray[i3 + 2] = 4
    }

    posAttr.needsUpdate = true
  })

  return (
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
        size={0.12}
        vertexColors
        transparent
        opacity={0.75}
        map={particleTexture}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

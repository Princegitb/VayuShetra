import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Atmospheric Data Conduit connecting Earth to Vayu AI Robot
 * - Renders a sleek curved energy spline between Earth and Robot
 * - Animates luminous atmospheric data packets travelling from Earth -> Robot
 * - Visually establishes: SATELLITE DATA -> EARTH -> ATMOSPHERIC ANALYSIS -> VAYU AI
 */
export default function DataConduit({
  startPos = [1.8, 0.5, 0.4], // Earth's India atmospheric beacon
  endPos = [2.35, -0.65, 1.25], // Robot's sensor core
}) {
  const lineRef = useRef()
  const packetGroupRef = useRef()

  // 1. Create 3D Bezier curve arching between Earth and Robot
  const { curve, lineGeo } = useMemo(() => {
    const vStart = new THREE.Vector3(...startPos)
    const vEnd = new THREE.Vector3(...endPos)

    // Midpoint bowed upwards and forwards for a natural aerodynamic arc
    const midPoint = new THREE.Vector3(
      (vStart.x + vEnd.x) / 2 + 0.1,
      (vStart.y + vEnd.y) / 2 + 0.35,
      (vStart.z + vEnd.z) / 2 + 0.25
    )

    const c = new THREE.QuadraticBezierCurve3(vStart, midPoint, vEnd)
    const pts = c.getPoints(48)
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    return { curve: c, lineGeo: geo }
  }, [startPos, endPos])

  // 2. Data Packets (Glowing telemetry energy bits travelling along curve)
  const packetCount = 4
  const packets = useMemo(() => {
    return Array.from({ length: packetCount }, (_, i) => ({
      offset: i / packetCount,
      speed: 0.35,
      size: 0.022,
    }))
  }, [])

  // 3. Animation loop: move data packets smoothly from Earth -> Robot
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    if (!packetGroupRef.current) return

    packetGroupRef.current.children.forEach((mesh, i) => {
      const p = packets[i]
      const t = (time * p.speed + p.offset) % 1.0
      const point = curve.getPointAt(t)
      mesh.position.copy(point)

      // Fade in near Earth, stay bright in middle, pulse near Robot
      const scale = Math.sin(t * Math.PI) * 1.2
      mesh.scale.set(scale, scale, scale)
    })
  })

  return (
    <group>
      {/* Curved Optical Data Conduit Line */}
      <primitive
        ref={lineRef}
        object={new THREE.Line(lineGeo, new THREE.LineDashedMaterial({
          color: '#00f0ff',
          linewidth: 1.5,
          transparent: true,
          opacity: 0.45,
          dashSize: 0.08,
          gapSize: 0.04,
        }))}
      />

      {/* Travelling Glowing Telemetry Packets */}
      <group ref={packetGroupRef}>
        {packets.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

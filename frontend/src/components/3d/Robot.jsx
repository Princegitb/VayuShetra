import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Procedural Cybernetic Atmospheric Sentinel Drone / Robot
 * - Smooth damped head and eye cursor tracking
 * - Ocular sensors lead head movement with realistic saccade responsiveness
 * - Floating levitation physics & breathing oscillation
 * - Structured to optionally load an external GLTF model via modelUrl
 */
export default function Robot({ mousePos = { x: 0, y: 0 }, isMobile = false, modelUrl = null }) {
  const rootRef = useRef()
  const headRef = useRef()
  const leftEyeRef = useRef()
  const rightEyeRef = useRef()
  const visorRef = useRef()
  const thrusterRingRef = useRef()
  const thrusterRing2Ref = useRef()
  const antennaRef = useRef()

  // Materials with curated cybernetic palette
  const materials = useMemo(() => {
    return {
      bodyMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0a111a'),
        roughness: 0.25,
        metalness: 0.85,
      }),
      armorMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#121e2e'),
        roughness: 0.35,
        metalness: 0.65,
      }),
      jointMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#04070c'),
        roughness: 0.6,
        metalness: 0.95,
      }),
      glowCyan: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00f0ff'),
        emissive: new THREE.Color('#00f0ff'),
        emissiveIntensity: 2.8,
        roughness: 0.1,
      }),
      glowBlue: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0070f3'),
        emissive: new THREE.Color('#0070f3'),
        emissiveIntensity: 1.8,
        roughness: 0.2,
      }),
      visorMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#020b14'),
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.92,
      }),
      wireRingMat: new THREE.MeshBasicMaterial({
        color: new THREE.Color('#00f0ff'),
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      })
    }
  }, [])

  // Dynamic animation frame loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    const safeDelta = Math.min(delta, 0.1) // prevent huge leaps on tab refocus

    // 1. Floating & breathing levitation
    if (rootRef.current) {
      rootRef.current.position.y = Math.sin(time * 1.6) * 0.12
      rootRef.current.rotation.z = Math.sin(time * 0.8) * 0.03
    }

    // 2. Cursor tracking target calculation
    let targetX = mousePos.x
    let targetY = mousePos.y

    if (isMobile) {
      // Autonomous atmospheric scanning cycle on mobile/touch devices
      targetX = Math.sin(time * 0.7) * 0.55
      targetY = Math.cos(time * 0.5) * 0.25
    }

    // Clamp tracking range so robot stays facing forward
    const clampedTargetRotY = THREE.MathUtils.clamp(targetX * 0.85, -0.85, 0.85)
    const clampedTargetRotX = THREE.MathUtils.clamp(-targetY * 0.55, -0.5, 0.5)

    // 3. Damped head rotation (heavier mass, smooth inertia)
    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.damp(
        headRef.current.rotation.y,
        clampedTargetRotY,
        4.2,
        safeDelta
      )
      headRef.current.rotation.x = THREE.MathUtils.damp(
        headRef.current.rotation.x,
        clampedTargetRotX,
        4.2,
        safeDelta
      )
      // Slight head tilt towards mouse vector
      headRef.current.rotation.z = THREE.MathUtils.damp(
        headRef.current.rotation.z,
        -clampedTargetRotY * 0.18,
        3.5,
        safeDelta
      )
    }

    // 4. Ocular sensor tracking (eyes turn faster and more sharply than the head)
    const eyeTargetRotY = THREE.MathUtils.clamp(targetX * 1.15, -0.95, 0.95)
    const eyeTargetRotX = THREE.MathUtils.clamp(-targetY * 0.85, -0.7, 0.7)

    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.rotation.y = THREE.MathUtils.damp(
        leftEyeRef.current.rotation.y,
        eyeTargetRotY,
        7.5,
        safeDelta
      )
      leftEyeRef.current.rotation.x = THREE.MathUtils.damp(
        leftEyeRef.current.rotation.x,
        eyeTargetRotX,
        7.5,
        safeDelta
      )

      rightEyeRef.current.rotation.y = THREE.MathUtils.damp(
        rightEyeRef.current.rotation.y,
        eyeTargetRotY,
        7.5,
        safeDelta
      )
      rightEyeRef.current.rotation.x = THREE.MathUtils.damp(
        rightEyeRef.current.rotation.x,
        eyeTargetRotX,
        7.5,
        safeDelta
      )
    }

    // 5. Thruster levitation rings spin & pulse
    if (thrusterRingRef.current) {
      thrusterRingRef.current.rotation.z += safeDelta * 1.2
      thrusterRingRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 2) * 0.08
    }
    if (thrusterRing2Ref.current) {
      thrusterRing2Ref.current.rotation.z -= safeDelta * 1.8
      thrusterRing2Ref.current.rotation.y = Math.cos(time * 2) * 0.08
    }

    // 6. Antenna telemetry beacon pulse
    if (antennaRef.current) {
      const pulse = 1.8 + Math.sin(time * 6) * 0.8
      antennaRef.current.material.emissiveIntensity = pulse
    }
  })

  return (
    <group ref={rootRef} position={[0, 0, 0]} scale={[1.1, 1.1, 1.1]}>
      
      {/* --- UPPER TORSO & CHASSIS --- */}
      <group position={[0, -0.7, 0]}>
        {/* Main Chest Core */}
        <mesh material={materials.bodyMat} castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.1, 0.9]} />
        </mesh>

        {/* Chest Armor Shield Plates */}
        <mesh position={[0, 0.05, 0.48]} material={materials.armorMat}>
          <boxGeometry args={[1.3, 0.9, 0.12]} />
        </mesh>

        {/* Reactor Power Core Vent */}
        <mesh position={[0, 0.05, 0.54]} material={materials.glowCyan}>
          <cylinderGeometry args={[0.22, 0.22, 0.08, 32]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>
        <pointLight position={[0, 0.05, 0.7]} color="#00f0ff" intensity={1.8} distance={3} />

        {/* Cyber Shoulders */}
        <mesh position={[-0.95, 0.35, 0]} material={materials.armorMat}>
          <boxGeometry args={[0.55, 0.45, 0.75]} />
        </mesh>
        <mesh position={[0.95, 0.35, 0]} material={materials.armorMat}>
          <boxGeometry args={[0.55, 0.45, 0.75]} />
        </mesh>

        {/* Shoulder Status Beacons */}
        <mesh position={[-0.95, 0.58, 0]} material={materials.glowCyan}>
          <boxGeometry args={[0.25, 0.05, 0.45]} />
        </mesh>
        <mesh position={[0.95, 0.58, 0]} material={materials.glowCyan}>
          <boxGeometry args={[0.25, 0.05, 0.45]} />
        </mesh>

        {/* Neck Joint Assembly */}
        <mesh position={[0, 0.65, 0]} material={materials.jointMat}>
          <cylinderGeometry args={[0.25, 0.32, 0.3, 24]} />
        </mesh>
      </group>

      {/* --- SENTINEL HEAD ASSEMBLY (Follows Cursor) --- */}
      <group ref={headRef} position={[0, 0.4, 0]}>
        
        {/* Cranial Helmet / Base Head */}
        <mesh material={materials.bodyMat} castShadow>
          <boxGeometry args={[1.1, 0.9, 0.95]} />
        </mesh>

        {/* Side Ear Comms / Sensor Pods */}
        <mesh position={[-0.62, 0.05, 0]} material={materials.armorMat}>
          <cylinderGeometry args={[0.22, 0.22, 0.18, 24]} rotation={[0, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0.62, 0.05, 0]} material={materials.armorMat}>
          <cylinderGeometry args={[0.22, 0.22, 0.18, 24]} rotation={[0, 0, Math.PI / 2]} />
        </mesh>

        {/* Ear Glow Rings */}
        <mesh position={[-0.72, 0.05, 0]} material={materials.glowCyan}>
          <ringGeometry args={[0.08, 0.16, 24]} rotation={[0, -Math.PI / 2, 0]} />
        </mesh>
        <mesh position={[0.72, 0.05, 0]} material={materials.glowCyan}>
          <ringGeometry args={[0.08, 0.16, 24]} rotation={[0, Math.PI / 2, 0]} />
        </mesh>

        {/* Visor Recess / Face Plate */}
        <mesh ref={visorRef} position={[0, 0.02, 0.46]} material={materials.visorMat}>
          <boxGeometry args={[0.95, 0.52, 0.15]} />
        </mesh>

        {/* --- OCULAR OCULUS (EYES) --- */}
        {/* Left Eye Sensor Socket */}
        <group ref={leftEyeRef} position={[-0.26, 0.04, 0.52]}>
          <mesh material={materials.jointMat}>
            <cylinderGeometry args={[0.15, 0.15, 0.08, 24]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
          {/* Glowing Optical Core */}
          <mesh position={[0, 0, 0.05]} material={materials.glowCyan}>
            <sphereGeometry args={[0.1, 24, 24]} />
          </mesh>
          {/* Pupil Center Lens */}
          <mesh position={[0, 0, 0.12]} material={materials.glowBlue}>
            <circleGeometry args={[0.04, 20]} />
          </mesh>
        </group>

        {/* Right Eye Sensor Socket */}
        <group ref={rightEyeRef} position={[0.26, 0.04, 0.52]}>
          <mesh material={materials.jointMat}>
            <cylinderGeometry args={[0.15, 0.15, 0.08, 24]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
          {/* Glowing Optical Core */}
          <mesh position={[0, 0, 0.05]} material={materials.glowCyan}>
            <sphereGeometry args={[0.1, 24, 24]} />
          </mesh>
          {/* Pupil Center Lens */}
          <mesh position={[0, 0, 0.12]} material={materials.glowBlue}>
            <circleGeometry args={[0.04, 20]} />
          </mesh>
        </group>

        {/* Forehead Atmospheric Telemetry Strip */}
        <mesh position={[0, 0.35, 0.49]} material={materials.glowCyan}>
          <boxGeometry args={[0.42, 0.04, 0.04]} />
        </mesh>

        {/* Satellite Link Antenna */}
        <mesh position={[0.35, 0.65, -0.2]} material={materials.jointMat}>
          <cylinderGeometry args={[0.02, 0.03, 0.5, 12]} />
        </mesh>
        <mesh ref={antennaRef} position={[0.35, 0.92, -0.2]} material={materials.glowCyan}>
          <sphereGeometry args={[0.06, 16, 16]} />
        </mesh>
        
        {/* Head Spotlight that casts subtle beam forward */}
        <pointLight position={[0, 0.05, 0.9]} color="#00f0ff" intensity={1.5} distance={4} />
      </group>

      {/* --- LEVITATION THRUSTER SYSTEM (BASE) --- */}
      <group position={[0, -1.4, 0]}>
        {/* Core Thruster Exhaust Nozzle */}
        <mesh material={materials.jointMat}>
          <cylinderGeometry args={[0.35, 0.18, 0.45, 24]} />
        </mesh>
        <mesh position={[0, -0.2, 0]} material={materials.glowCyan}>
          <circleGeometry args={[0.2, 24]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>
        
        {/* Outer Gyro Ring 1 */}
        <mesh ref={thrusterRingRef} material={materials.wireRingMat}>
          <torusGeometry args={[0.75, 0.03, 16, 48]} />
        </mesh>

        {/* Outer Gyro Ring 2 */}
        <mesh ref={thrusterRing2Ref} material={materials.glowCyan} scale={[0.6, 0.6, 0.6]}>
          <torusGeometry args={[0.6, 0.02, 16, 36]} />
        </mesh>

        <pointLight position={[0, -0.4, 0]} color="#00f0ff" intensity={2.5} distance={3.5} />
      </group>

    </group>
  )
}

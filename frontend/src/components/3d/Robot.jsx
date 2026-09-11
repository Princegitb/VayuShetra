import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * High-Detail Cybernetic Atmospheric Sentinel Drone
 * - Sleek aerodynamic cranial helmet with multi-layer armor
 * - Expressive illuminated ocular sensors with damped saccade tracking
 * - Central Arc-Reactor Core with pulsating cyan energy conduits
 * - Articulated shoulder pauldrons & dynamic aerodynamic stabilizer winglets
 * - Dual contra-rotating magnetic levitation gyro rings
 */
export default function Robot({ mousePos = { x: 0, y: 0 }, isMobile = false }) {
  const rootRef = useRef()
  const headRef = useRef()
  const leftEyeRef = useRef()
  const rightEyeRef = useRef()
  const arcReactorRef = useRef()
  const leftWingRef = useRef()
  const rightWingRef = useRef()
  const gyroRing1Ref = useRef()
  const gyroRing2Ref = useRef()
  const beaconRef = useRef()

  // Curated cybernetic material palette
  const materials = useMemo(() => {
    return {
      darkChassis: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#080d14'),
        roughness: 0.18,
        metalness: 0.92,
      }),
      carbonArmor: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0e1724'),
        roughness: 0.28,
        metalness: 0.8,
      }),
      slateTrim: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1c2a3a'),
        roughness: 0.35,
        metalness: 0.65,
      }),
      hydraulicPiston: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#030508'),
        roughness: 0.45,
        metalness: 0.95,
      }),
      neonCyan: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00f0ff'),
        emissive: new THREE.Color('#00f0ff'),
        emissiveIntensity: 3.2,
        roughness: 0.1,
      }),
      neonBlue: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0070f3'),
        emissive: new THREE.Color('#0070f3'),
        emissiveIntensity: 2.2,
        roughness: 0.15,
      }),
      visorShield: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#01070e'),
        roughness: 0.08,
        metalness: 0.95,
        transparent: true,
        opacity: 0.94,
      }),
      wireTorus: new THREE.MeshBasicMaterial({
        color: new THREE.Color('#00f0ff'),
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      })
    }
  }, [])

  // Dynamic animation frame loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    const safeDelta = Math.min(delta, 0.1)

    // 1. Fluid levitation & breathing oscillation
    if (rootRef.current) {
      rootRef.current.position.y = Math.sin(time * 1.8) * 0.09
      rootRef.current.rotation.z = Math.sin(time * 0.9) * 0.025
    }

    // 2. Cursor tracking calculation
    let targetX = mousePos.x
    let targetY = mousePos.y

    if (isMobile) {
      targetX = Math.sin(time * 0.75) * 0.5
      targetY = Math.cos(time * 0.55) * 0.22
    }

    // Damped Head Rotation (Heavy mass, fluid inertia)
    const clampedHeadY = THREE.MathUtils.clamp(targetX * 0.75, -0.75, 0.75)
    const clampedHeadX = THREE.MathUtils.clamp(-targetY * 0.45, -0.42, 0.42)

    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, clampedHeadY, 4.2, safeDelta)
      headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, clampedHeadX, 4.2, safeDelta)
      headRef.current.rotation.z = THREE.MathUtils.damp(headRef.current.rotation.z, -clampedHeadY * 0.14, 3.8, safeDelta)
    }

    // 3. High-Precision Saccadic Ocular Tracking (Eyes lead the head with faster response)
    const eyeTargetY = THREE.MathUtils.clamp(targetX * 1.15, -0.9, 0.9)
    const eyeTargetX = THREE.MathUtils.clamp(-targetY * 0.8, -0.65, 0.65)

    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.rotation.y = THREE.MathUtils.damp(leftEyeRef.current.rotation.y, eyeTargetY, 8.0, safeDelta)
      leftEyeRef.current.rotation.x = THREE.MathUtils.damp(leftEyeRef.current.rotation.x, eyeTargetX, 8.0, safeDelta)

      rightEyeRef.current.rotation.y = THREE.MathUtils.damp(rightEyeRef.current.rotation.y, eyeTargetY, 8.0, safeDelta)
      rightEyeRef.current.rotation.x = THREE.MathUtils.damp(rightEyeRef.current.rotation.x, eyeTargetX, 8.0, safeDelta)
    }

    // 4. Dynamic Stabilizer Winglets (Flex gently with movement)
    if (leftWingRef.current && rightWingRef.current) {
      const wingFlare = THREE.MathUtils.clamp(-targetX * 0.25, -0.3, 0.3)
      leftWingRef.current.rotation.z = THREE.MathUtils.damp(leftWingRef.current.rotation.z, -0.15 + wingFlare, 3.5, safeDelta)
      rightWingRef.current.rotation.z = THREE.MathUtils.damp(rightWingRef.current.rotation.z, 0.15 + wingFlare, 3.5, safeDelta)
    }

    // 5. Arc-Reactor Core Pulse & Rotation
    if (arcReactorRef.current) {
      arcReactorRef.current.rotation.z += safeDelta * 2.2
      const pulse = 2.4 + Math.sin(time * 4) * 0.8
      materials.neonCyan.emissiveIntensity = pulse
    }

    // 6. Contra-rotating Gyro Levitation Rings
    if (gyroRing1Ref.current) {
      gyroRing1Ref.current.rotation.z += safeDelta * 1.6
      gyroRing1Ref.current.rotation.x = Math.PI / 2 + Math.sin(time * 2.2) * 0.07
    }
    if (gyroRing2Ref.current) {
      gyroRing2Ref.current.rotation.z -= safeDelta * 2.0
      gyroRing2Ref.current.rotation.y = Math.cos(time * 2.2) * 0.07
    }

    // 7. Cranial Beacon Pulse
    if (beaconRef.current) {
      beaconRef.current.material.emissiveIntensity = 2.0 + Math.sin(time * 7) * 1.0
    }
  })

  return (
    <group ref={rootRef} position={[0, 0, 0]} scale={[0.92, 0.92, 0.92]}>
      
      {/* ====================================================================
          1. SLEEK CYBERNETIC UPPER TORSO & ARMOR PLATES
         ==================================================================== */}
      <group position={[0, -0.65, 0]}>
        
        {/* Core Chest Monocoque */}
        <mesh material={materials.darkChassis} castShadow receiveShadow>
          <boxGeometry args={[1.35, 1.0, 0.85]} />
        </mesh>

        {/* Angled Upper Pectoral Armor Plates (Left & Right) */}
        <mesh position={[-0.34, 0.12, 0.46]} rotation={[0.08, -0.12, 0]} material={materials.carbonArmor}>
          <boxGeometry args={[0.56, 0.65, 0.1]} />
        </mesh>
        <mesh position={[0.34, 0.12, 0.46]} rotation={[0.08, 0.12, 0]} material={materials.carbonArmor}>
          <boxGeometry args={[0.56, 0.65, 0.1]} />
        </mesh>

        {/* Central Recessed Arc-Reactor Housing */}
        <group position={[0, 0.08, 0.48]}>
          {/* Reactor Outer Bezel */}
          <mesh material={materials.slateTrim}>
            <cylinderGeometry args={[0.24, 0.24, 0.08, 32]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
          {/* Glowing Inner Core */}
          <mesh material={materials.neonCyan}>
            <cylinderGeometry args={[0.16, 0.16, 0.1, 24]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
          {/* Rotating Spokes */}
          <group ref={arcReactorRef}>
            <mesh material={materials.darkChassis}>
              <boxGeometry args={[0.3, 0.04, 0.11]} />
            </mesh>
            <mesh material={materials.darkChassis}>
              <boxGeometry args={[0.04, 0.3, 0.11]} />
            </mesh>
          </group>
          {/* Reactor Radiant Light */}
          <pointLight position={[0, 0, 0.25]} color="#00f0ff" intensity={2.2} distance={3.5} />
        </group>

        {/* Cyan Energy Conduits / Seams across chest */}
        <mesh position={[-0.38, -0.28, 0.46]} material={materials.neonCyan}>
          <boxGeometry args={[0.42, 0.03, 0.02]} />
        </mesh>
        <mesh position={[0.38, -0.28, 0.46]} material={materials.neonCyan}>
          <boxGeometry args={[0.42, 0.03, 0.02]} />
        </mesh>

        {/* Aerodynamic Shoulder Pauldrons */}
        <mesh position={[-0.88, 0.32, 0]} rotation={[0, 0, 0.1]} material={materials.carbonArmor}>
          <boxGeometry args={[0.45, 0.38, 0.72]} />
        </mesh>
        <mesh position={[0.88, 0.32, 0]} rotation={[0, 0, -0.1]} material={materials.carbonArmor}>
          <boxGeometry args={[0.45, 0.38, 0.72]} />
        </mesh>

        {/* Shoulder Neon Strips */}
        <mesh position={[-0.92, 0.52, 0]} material={materials.neonCyan}>
          <boxGeometry args={[0.26, 0.035, 0.45]} />
        </mesh>
        <mesh position={[0.92, 0.52, 0]} material={materials.neonCyan}>
          <boxGeometry args={[0.26, 0.035, 0.45]} />
        </mesh>

        {/* Aerodynamic Stabilizer Winglets */}
        <group ref={leftWingRef} position={[-1.05, 0.2, -0.15]}>
          <mesh material={materials.darkChassis}>
            <boxGeometry args={[0.5, 0.08, 0.35]} />
          </mesh>
          <mesh position={[-0.25, 0, 0]} material={materials.neonCyan}>
            <boxGeometry args={[0.05, 0.07, 0.3]} />
          </mesh>
        </group>
        <group ref={rightWingRef} position={[1.05, 0.2, -0.15]}>
          <mesh material={materials.darkChassis}>
            <boxGeometry args={[0.5, 0.08, 0.35]} />
          </mesh>
          <mesh position={[0.25, 0, 0]} material={materials.neonCyan}>
            <boxGeometry args={[0.05, 0.07, 0.3]} />
          </mesh>
        </group>

        {/* Dual Hydraulic Neck Pistons */}
        <mesh position={[-0.15, 0.58, -0.05]} material={materials.hydraulicPiston}>
          <cylinderGeometry args={[0.06, 0.06, 0.28, 16]} />
        </mesh>
        <mesh position={[0.15, 0.58, -0.05]} material={materials.hydraulicPiston}>
          <cylinderGeometry args={[0.06, 0.06, 0.28, 16]} />
        </mesh>
        <mesh position={[0, 0.58, 0.05]} material={materials.slateTrim}>
          <cylinderGeometry args={[0.22, 0.28, 0.25, 24]} />
        </mesh>

      </group>

      {/* ====================================================================
          2. SLEEK AERODYNAMIC CRANIAL HELMET & OCULAR SENSORS
         ==================================================================== */}
      <group ref={headRef} position={[0, 0.38, 0]}>
        
        {/* Main Cranial Shell with Beveled Profile */}
        <mesh material={materials.darkChassis} castShadow>
          <boxGeometry args={[1.05, 0.85, 0.9]} />
        </mesh>

        {/* Top Cranial Armor Cap */}
        <mesh position={[0, 0.44, -0.05]} material={materials.carbonArmor}>
          <boxGeometry args={[0.85, 0.1, 0.78]} />
        </mesh>

        {/* Holographic Telemetry Antenna Crest */}
        <mesh position={[0, 0.54, 0.12]} material={materials.neonCyan}>
          <boxGeometry args={[0.08, 0.12, 0.4]} />
        </mesh>

        {/* Satellite Link Communications Antenna */}
        <mesh position={[0.34, 0.62, -0.18]} material={materials.hydraulicPiston}>
          <cylinderGeometry args={[0.018, 0.024, 0.45, 12]} />
        </mesh>
        <mesh ref={beaconRef} position={[0.34, 0.86, -0.18]} material={materials.neonCyan}>
          <sphereGeometry args={[0.05, 16, 16]} />
        </mesh>

        {/* Ear Comms Sensor Pods (Left & Right) */}
        <mesh position={[-0.58, 0.02, 0]} material={materials.slateTrim}>
          <cylinderGeometry args={[0.18, 0.18, 0.14, 24]} rotation={[0, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0.58, 0.02, 0]} material={materials.slateTrim}>
          <cylinderGeometry args={[0.18, 0.18, 0.14, 24]} rotation={[0, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[-0.66, 0.02, 0]} material={materials.neonCyan}>
          <ringGeometry args={[0.06, 0.12, 24]} rotation={[0, -Math.PI / 2, 0]} />
        </mesh>
        <mesh position={[0.66, 0.02, 0]} material={materials.neonCyan}>
          <ringGeometry args={[0.06, 0.12, 24]} rotation={[0, Math.PI / 2, 0]} />
        </mesh>

        {/* Sleek Dark Visor Shield */}
        <mesh position={[0, 0.02, 0.44]} material={materials.visorShield}>
          <boxGeometry args={[0.92, 0.48, 0.12]} />
        </mesh>

        {/* Brow Neon Accent Strip */}
        <mesh position={[0, 0.28, 0.48]} material={materials.neonCyan}>
          <boxGeometry args={[0.55, 0.035, 0.04]} />
        </mesh>

        {/* --- OCULAR OCULUS (EYES - Follow Cursor) --- */}
        {/* Left Optical Sensor */}
        <group ref={leftEyeRef} position={[-0.24, 0.04, 0.49]}>
          {/* Eye Socket Housing */}
          <mesh material={materials.hydraulicPiston}>
            <cylinderGeometry args={[0.14, 0.14, 0.06, 24]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
          {/* Outer Glowing Cyan Iris */}
          <mesh position={[0, 0, 0.03]} material={materials.neonCyan}>
            <sphereGeometry args={[0.095, 24, 24]} />
          </mesh>
          {/* Deep Electric Blue Pupil Core */}
          <mesh position={[0, 0, 0.11]} material={materials.neonBlue}>
            <circleGeometry args={[0.038, 20]} />
          </mesh>
        </group>

        {/* Right Optical Sensor */}
        <group ref={rightEyeRef} position={[0.24, 0.04, 0.49]}>
          {/* Eye Socket Housing */}
          <mesh material={materials.hydraulicPiston}>
            <cylinderGeometry args={[0.14, 0.14, 0.06, 24]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
          {/* Outer Glowing Cyan Iris */}
          <mesh position={[0, 0, 0.03]} material={materials.neonCyan}>
            <sphereGeometry args={[0.095, 24, 24]} />
          </mesh>
          {/* Deep Electric Blue Pupil Core */}
          <mesh position={[0, 0, 0.11]} material={materials.neonBlue}>
            <circleGeometry args={[0.038, 20]} />
          </mesh>
        </group>

        {/* Chin / Jaw Sensor Plate */}
        <mesh position={[0, -0.32, 0.42]} material={materials.slateTrim}>
          <boxGeometry args={[0.42, 0.12, 0.12]} />
        </mesh>

        {/* Forward Head Atmosphere Probe Light */}
        <pointLight position={[0, 0.05, 0.8]} color="#00f0ff" intensity={1.6} distance={4.5} />
      </group>

      {/* ====================================================================
          3. ANTI-GRAVITY MAGNETIC LEVITATION DRIVE (LOWER CHASSIS)
         ==================================================================== */}
      <group position={[0, -1.3, 0]}>
        
        {/* Thruster Emitter Nozzle */}
        <mesh material={materials.hydraulicPiston}>
          <cylinderGeometry args={[0.3, 0.15, 0.38, 24]} />
        </mesh>
        
        {/* Thruster Core Exhaust Disc */}
        <mesh position={[0, -0.19, 0]} material={materials.neonCyan}>
          <circleGeometry args={[0.18, 24]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>

        {/* Primary Holographic Gyro Ring */}
        <mesh ref={gyroRing1Ref} material={materials.wireTorus}>
          <torusGeometry args={[0.65, 0.024, 16, 48]} />
        </mesh>

        {/* Secondary Inner Neon Energy Ring */}
        <mesh ref={gyroRing2Ref} material={materials.neonCyan} scale={[0.55, 0.55, 0.55]}>
          <torusGeometry args={[0.52, 0.02, 16, 36]} />
        </mesh>

        {/* Downward Levitation Light Flare */}
        <pointLight position={[0, -0.35, 0]} color="#00f0ff" intensity={2.6} distance={3.5} />
      </group>

    </group>
  )
}

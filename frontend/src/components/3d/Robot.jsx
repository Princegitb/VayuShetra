import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useFBX, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'

/**
 * Cinematic 3D Love, Death & Robots Cybernetic Sentinel
 * - Authentic 3D rigged model with 4K/2K PBR materials (Diffuse, Normal, Roughness, Emission, AO)
 * - Skeletal head bone articulates with fluid inertia damping to track the mouse cursor
 * - Reactive antenna twitches and fluid levitation hovering
 * - Dynamic atmospheric ion-drive contra-rotating gyro rings beneath chassis
 */
export default function Robot({ mousePos = { x: 0, y: 0 }, isMobile = false }) {
  const rootRef = useRef()
  const gyro1Ref = useRef()
  const gyro2Ref = useRef()

  // 1. Load FBX 3D Rigged Model
  const fbx = useFBX('/models/robot/Robot.fbx')

  // 2. Load 2K Web-Optimized PBR Textures
  const textures = useTexture({
    map: '/models/robot/diffuse.jpg',
    normalMap: '/models/robot/Normal.jpg',
    roughnessMap: '/models/robot/Roughness.jpg',
    emissiveMap: '/models/robot/emission.jpg',
    aoMap: '/models/robot/AO.jpg',
  })

  // Configure texture color spaces & filtering
  useMemo(() => {
    if (textures.map) textures.map.colorSpace = THREE.SRGBColorSpace
    if (textures.emissiveMap) textures.emissiveMap.colorSpace = THREE.SRGBColorSpace
    Object.values(textures).forEach((tex) => {
      if (tex) {
        tex.wrapS = THREE.RepeatWrapping
        tex.wrapT = THREE.RepeatWrapping
        tex.generateMipmaps = true
      }
    })
  }, [textures])

  // 3. Clone Rigged Scene with SkeletonUtils for multi-instance safety
  const clonedFbx = useMemo(() => {
    const clone = SkeletonUtils.clone(fbx)
    // Scale and center the FBX around origin based on its geometry bounds
    clone.scale.set(0.0016, 0.0016, 0.0016)
    clone.position.set(0, -1.18, 0)
    // Orient 3/4 front-facing towards the user and camera with captivating angle
    clone.rotation.y = Math.PI + 0.55
    return clone
  }, [fbx])

  // 4. Create high-fidelity PBR material with emissive glow
  const pbrMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: textures.map,
      normalMap: textures.normalMap,
      normalScale: new THREE.Vector2(1.1, 1.1),
      roughnessMap: textures.roughnessMap,
      roughness: 0.65,
      metalness: 0.28,
      emissiveMap: textures.emissiveMap,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 3.2, // Brilliantly illuminates digital eyes, chest display & indicators
      aoMap: textures.aoMap,
      aoMapIntensity: 1.15,
    })
  }, [textures])

  // Apply material to all meshes
  useEffect(() => {
    clonedFbx.traverse((child) => {
      if (child.isMesh) {
        child.material = pbrMaterial
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [clonedFbx, pbrMaterial])

  // 5. Extract skeleton bone nodes for real-time procedural articulation
  const bones = useMemo(() => {
    return {
      head: clonedFbx.getObjectByName('Head'),
      spine: clonedFbx.getObjectByName('spina'),
      pelvis: clonedFbx.getObjectByName('Taz'),
      leftArm: clonedFbx.getObjectByName('ruka1L'),
      rightArm: clonedFbx.getObjectByName('ruka1R'),
      leftEar: clonedFbx.getObjectByName('uhoL'),
      rightEar: clonedFbx.getObjectByName('uhoR'),
    }
  }, [clonedFbx])

  // 6. Interactive Animation Loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    const safeDelta = Math.min(delta, 0.1)

    // A. Smooth anti-gravity levitation oscillation & interactive orientation
    let targetX = mousePos.x
    let targetY = mousePos.y

    if (isMobile) {
      targetX = Math.sin(time * 0.6) * 0.4
      targetY = Math.cos(time * 0.45) * 0.2
    }

    if (rootRef.current) {
      // Gentle vertical floating
      rootRef.current.position.y = Math.sin(time * 1.6) * 0.07
      
      // Dynamic yaw/pitch tracking user's cursor
      const targetYaw = targetX * 0.38
      const targetPitch = -targetY * 0.18
      const targetRoll = -targetX * 0.08

      rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, targetYaw, 2.6, safeDelta)
      rootRef.current.rotation.x = THREE.MathUtils.damp(rootRef.current.rotation.x, targetPitch, 2.6, safeDelta)
      rootRef.current.rotation.z = THREE.MathUtils.damp(rootRef.current.rotation.z, targetRoll + Math.sin(time * 0.8) * 0.02, 2.0, safeDelta)
    }

    // B. Antenna / Ear Micro-Twitches (Cute robotic character gestures)
    if (bones.leftEar) {
      const earTwitch = Math.sin(time * 3.2) * 0.06 + (Math.sin(time * 6.5) > 0.9 ? 0.12 : 0)
      bones.leftEar.rotation.z = THREE.MathUtils.damp(bones.leftEar.rotation.z, earTwitch, 4.0, safeDelta)
    }
    if (bones.rightEar) {
      const earTwitch = -Math.sin(time * 3.2) * 0.06 - (Math.sin(time * 6.5) > 0.9 ? 0.12 : 0)
      bones.rightEar.rotation.z = THREE.MathUtils.damp(bones.rightEar.rotation.z, earTwitch, 4.0, safeDelta)
    }

    // C. Arms subtle organic breathing sway
    if (bones.leftArm) {
      bones.leftArm.rotation.x = -2.74 + Math.sin(time * 1.5) * 0.04
    }
    if (bones.rightArm) {
      bones.rightArm.rotation.x = 2.74 - Math.sin(time * 1.5) * 0.04
    }

    // G. Contra-rotating atmospheric hover stabilizer rings
    if (gyro1Ref.current) gyro1Ref.current.rotation.z += safeDelta * 1.2
    if (gyro2Ref.current) gyro2Ref.current.rotation.z -= safeDelta * 1.6
  })

  return (
    <group ref={rootRef} dispose={null}>
      {/* 3D Rigged Robot Mesh */}
      <primitive object={clonedFbx} />

      {/* Atmospheric Ion-Levitation Energy Core hugging base pedestal */}
      <group position={[0, -1.18, 0]}>
        {/* Glowing Energy Plasma Disc */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 0.72, 32]} />
          <meshBasicMaterial
            color="#00f0ff"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Counter-Rotating Gyroscopic Stabilization Ring */}
        <mesh ref={gyro1Ref} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.74, 0.014, 16, 48]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.7} />
        </mesh>
        <mesh ref={gyro2Ref} position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.62, 0.012, 16, 40]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.45} />
        </mesh>

        {/* Dynamic Atmospheric Ground Flare */}
        <pointLight position={[0, 0.1, 0]} intensity={2.2} color="#00f0ff" distance={3.0} />
      </group>
    </group>
  )
}

// Preload assets for instant presentation
useFBX.preload('/models/robot/Robot.fbx')
useTexture.preload('/models/robot/diffuse.jpg')
useTexture.preload('/models/robot/Normal.jpg')
useTexture.preload('/models/robot/Roughness.jpg')
useTexture.preload('/models/robot/emission.jpg')
useTexture.preload('/models/robot/AO.jpg')

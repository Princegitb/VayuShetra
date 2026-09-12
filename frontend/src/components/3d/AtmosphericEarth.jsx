import React, { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Photorealistic 3D Atmospheric Earth
 * - 4K Satellite Albedo + High-relief Normal map for mountains
 * - Dynamic cloud sphere with independent rotational velocity
 * - Rayleigh scattering atmospheric rim glow (Fresnel shader)
 * - India geographic emphasis: pulsating radar beacon at Indo-Gangetic coordinate
 * - Sentinel-5P polar orbit trajectory with animated satellite beacon
 * - Interactive dragging & mouse steering
 */
export default function AtmosphericEarth({
  radius = 1.55,
  mousePos = { x: 0, y: 0 },
  isMobile = false,
  onIndiaWorldPos = null,
}) {
  const earthGroupRef = useRef()
  const surfaceRef = useRef()
  const cloudsRef = useRef()
  const atmosphereRef = useRef()

  // Drag-to-rotate state
  const isDragging = useRef(false)
  const previousMousePosition = useRef({ x: 0, y: 0 })
  const rotationVelocity = useRef({ x: 0, y: 0.003 })

  // 1. Load 4K Photorealistic Earth Textures
  const [albedoMap, normalMap, skyMap] = useTexture([
    '/models/earth/Albedo.jpg',
    '/models/earth/Normal.jpg',
    '/models/earth/Sky.jpg',
  ])

  useMemo(() => {
    if (albedoMap) {
      albedoMap.colorSpace = THREE.SRGBColorSpace
      albedoMap.wrapS = THREE.RepeatWrapping
      albedoMap.wrapT = THREE.ClampToEdgeWrapping
    }
    if (skyMap) {
      skyMap.colorSpace = THREE.SRGBColorSpace
      skyMap.wrapS = THREE.RepeatWrapping
      skyMap.wrapT = THREE.ClampToEdgeWrapping
    }
  }, [albedoMap, skyMap])

  // Helper: Convert Lat/Lon to Vector3 on sphere of given radius
  const latLonToVector3 = (lat, lon, r) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    )
  }

  // 2. India coordinate on unit sphere (Lat ~23°N, Lon ~78°E)
  const indiaLocalPos = useMemo(() => {
    return latLonToVector3(23.5, 78.5, radius * 1.006)
  }, [radius])

  // Precise India Border Polygon Outline Geometry (matches reference image neon cyan outline!)
  const indiaBorderGeo = useMemo(() => {
    const r = radius * 1.005
    const coords = [
      [35.5, 74.8], [36.2, 76.8], [35.0, 78.5], [33.0, 79.2], [31.5, 79.2],
      [30.2, 81.0], [27.8, 84.8], [26.8, 88.0], [27.8, 88.6], [27.3, 89.4],
      [27.5, 91.8], [28.4, 94.5], [28.0, 96.8], [26.5, 97.0], [25.0, 94.5],
      [23.5, 93.2], [22.0, 92.8], [22.8, 91.5], [22.2, 89.2], [21.5, 87.0],
      [20.0, 85.5], [18.2, 84.0], [16.5, 82.2], [14.0, 80.2], [12.0, 79.8],
      [10.0, 79.2], [8.4, 77.5], [8.8, 76.5], [10.5, 75.8], [12.5, 75.0],
      [14.5, 74.2], [15.8, 73.8], [17.5, 73.2], [19.0, 72.8], [20.5, 72.8],
      [21.2, 72.2], [21.0, 70.0], [21.8, 69.2], [22.8, 68.8], [23.8, 68.5],
      [24.5, 71.0], [26.0, 70.2], [27.5, 70.2], [28.8, 72.0], [30.2, 73.8],
      [31.8, 74.5], [33.2, 74.2], [34.5, 74.0], [35.5, 74.8]
    ]
    const pts = coords.map(([lat, lon]) => latLonToVector3(lat, lon, r))
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [radius])

  // PM2.5 Hotspot Location (Southeast Asia / Bay of Bengal transboundary zone)
  const pm25LocalPos = useMemo(() => {
    return latLonToVector3(16.0, 95.0, radius * 1.008)
  }, [radius])

  // Wind Flow Streamlines (Upper right over ocean/continent)
  const windStreamGeos = useMemo(() => {
    const r = radius * 1.018
    const curves = [
      new THREE.CatmullRomCurve3([
        latLonToVector3(38.0, 110.0, r),
        latLonToVector3(28.0, 102.0, r * 1.01),
        latLonToVector3(18.0, 92.0, r),
      ]),
      new THREE.CatmullRomCurve3([
        latLonToVector3(35.0, 115.0, r * 1.01),
        latLonToVector3(24.0, 108.0, r * 1.02),
        latLonToVector3(12.0, 96.0, r),
      ]),
      new THREE.CatmullRomCurve3([
        latLonToVector3(30.0, 120.0, r),
        latLonToVector3(19.0, 112.0, r * 1.015),
        latLonToVector3(8.0, 100.0, r),
      ]),
    ]
    return curves.map(c => new THREE.BufferGeometry().setFromPoints(c.getPoints(40)))
  }, [radius])

  // Fixed 3D Sentinel-5P Satellite Position (Top-left orbit above Earth)
  const satelliteOrbitPos = useMemo(() => {
    return new THREE.Vector3(-0.95 * radius, 0.88 * radius, 0.35 * radius)
  }, [radius])

  // 4. Subtle Atmospheric Rayleigh Rim Glow Shader
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float intensity = pow(0.65 - dot(vNormal, viewDir), 2.4);
          vec3 atmosphereColor = vec3(0.0, 0.94, 1.0); // Electric Cyan #00f0ff
          vec3 deepBlue = vec3(0.0, 0.44, 0.95);      // Deep Royal Blue #0070f3
          vec3 finalColor = mix(deepBlue, atmosphereColor, intensity * 1.4);
          gl_FragColor = vec4(finalColor, intensity * 0.85);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    })
  }, [])

  // 5. Interactive Animation Loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    const safeDelta = Math.min(delta, 0.1)

    // A. Planetary Rotation (Slow continuous rotation)
    if (surfaceRef.current) {
      if (!isDragging.current) {
        // Natural gentle idle rotation around Y axis
        surfaceRef.current.rotation.y += safeDelta * 0.045
      }
    }

    // B. Clouds independent velocity (clouds slip slightly faster over terrain)
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += safeDelta * 0.055
      cloudsRef.current.rotation.x = Math.sin(time * 0.1) * 0.015
    }

    // C. Camera / Mouse Parallax
    if (earthGroupRef.current) {
      const targetParallaxX = isMobile ? 0 : mousePos.x * 0.12
      const targetParallaxY = isMobile ? 0 : -mousePos.y * 0.08
      earthGroupRef.current.rotation.x = THREE.MathUtils.damp(earthGroupRef.current.rotation.x, targetParallaxY, 2.0, safeDelta)
      earthGroupRef.current.rotation.z = THREE.MathUtils.damp(earthGroupRef.current.rotation.z, -targetParallaxX * 0.5, 2.0, safeDelta)
    }
  })

  // Pointer drag controls for intuitive manual planet rotation
  const handlePointerDown = (e) => {
    isDragging.current = true
    previousMousePosition.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMove = (e) => {
    if (!isDragging.current || !surfaceRef.current) return
    const deltaX = e.clientX - previousMousePosition.current.x
    const deltaY = e.clientY - previousMousePosition.current.y
    surfaceRef.current.rotation.y += deltaX * 0.005
    surfaceRef.current.rotation.x += deltaY * 0.003
    previousMousePosition.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = () => {
    isDragging.current = false
  }

  return (
    <group
      ref={earthGroupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* 1. Earth Body (Surface + India focus) */}
      {/* Initial rotation.y = Math.PI - 0.2 rotates India (lon 78°E) directly to the front! */}
      <group ref={surfaceRef} rotation={[0.2, Math.PI - 0.2, 0]}>
        {/* Main Planetary Sphere */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial
            map={albedoMap}
            normalMap={normalMap}
            normalScale={new THREE.Vector2(1.2, 1.2)}
            roughness={0.72}
            metalness={0.18}
          />
        </mesh>

        {/* Authentic Neon Cyan India Border Outline (from user reference image!) */}
        <primitive object={new THREE.LineLoop(indiaBorderGeo, new THREE.LineBasicMaterial({
          color: '#00f0ff',
          linewidth: 2.2,
          transparent: true,
          opacity: 0.95,
        }))} />

        {/* India Atmospheric Basin Golden Target Pin */}
        <group position={indiaLocalPos}>
          <mesh rotation={[-0.4, 0, 0]}>
            <ringGeometry args={[0.02, 0.05, 24]} />
            <meshBasicMaterial color="#facc15" side={THREE.DoubleSide} transparent opacity={0.9} />
          </mesh>
          <mesh rotation={[-0.4, 0, 0]}>
            <ringGeometry args={[0.06, 0.078, 24]} />
            <meshBasicMaterial color="#fef08a" side={THREE.DoubleSide} transparent opacity={0.6} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.022, 16, 16]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          {/* Leader line pointing to HUD tag */}
          <line>
            <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0.12, 0.22, 0.08),
            ])} />
            <lineBasicMaterial color="#facc15" transparent opacity={0.8} />
          </line>
        </group>

        {/* Glowing Orange/Red PM2.5 Hotspot Cluster (Southeast Asia / Bay of Bengal) */}
        <group position={pm25LocalPos}>
          <mesh>
            <sphereGeometry args={[0.032, 16, 16]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
          </mesh>
          <mesh rotation={[-0.3, 0, 0]}>
            <ringGeometry args={[0.038, 0.075, 24]} />
            <meshBasicMaterial color="#f97316" side={THREE.DoubleSide} transparent opacity={0.55} />
          </mesh>
          <line>
            <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0.12, -0.14, 0.08),
            ])} />
            <lineBasicMaterial color="#ef4444" transparent opacity={0.8} />
          </line>
          <pointLight color="#f97316" intensity={1.6} distance={0.9} />
        </group>

        {/* Curved Cyan Wind Flow Streamlines (Upper Right) */}
        {windStreamGeos.map((geo, i) => (
          <primitive key={i} object={new THREE.Line(geo, new THREE.LineDashedMaterial({
            color: '#00f0ff',
            linewidth: 1.4,
            transparent: true,
            opacity: 0.85 - i * 0.2,
            dashSize: 0.05,
            gapSize: 0.025,
          }))} />
        ))}
      </group>

      {/* 3D Sentinel-5P Satellite (Top-Left Orbit with Solar Arrays) */}
      <group position={satelliteOrbitPos} rotation={[0.4, 0.6, -0.3]}>
        <mesh>
          <boxGeometry args={[0.09, 0.05, 0.06]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.2} emissive="#00f0ff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, -0.026, 0]}>
          <boxGeometry args={[0.06, 0.01, 0.04]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Blue Solar Panels Left & Right */}
        <mesh position={[-0.14, 0, 0]}>
          <boxGeometry args={[0.16, 0.05, 0.005]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} emissive="#0369a1" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0.14, 0, 0]}>
          <boxGeometry args={[0.16, 0.05, 0.005]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} emissive="#0369a1" emissiveIntensity={0.6} />
        </mesh>
        {/* Leader line towards Sentinel-5P Tag */}
        <line>
          <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.18, 0.22, 0.1),
          ])} />
          <lineBasicMaterial color="#00f0ff" transparent opacity={0.7} />
        </line>
        <pointLight color="#00f0ff" intensity={1.8} distance={1.2} />
      </group>

      {/* 2. Dynamic Moving Cloud Layer (Rotates independently) */}
      <mesh ref={cloudsRef} rotation={[0.2, Math.PI - 0.1, 0]}>
        <sphereGeometry args={[radius * 1.015, 64, 64]} />
        <meshStandardMaterial
          map={skyMap}
          transparent
          opacity={0.42}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          roughness={0.9}
        />
      </mesh>

      {/* 3. Atmospheric Rayleigh Rim Glow Shader (Atmospheric Halo) */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[radius * 1.15, 48, 48]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>
    </group>
  )
}

// Preload Earth textures for instant presentation
useTexture.preload('/models/earth/Albedo.jpg')
useTexture.preload('/models/earth/Normal.jpg')
useTexture.preload('/models/earth/Sky.jpg')

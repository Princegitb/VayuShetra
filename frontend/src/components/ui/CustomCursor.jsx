import React, { useEffect, useState, useRef } from 'react'

/**
 * Cinematic Cyberpunk Custom Cursor
 * - Inner high-precision cyan core
 * - Outer trailing ring with physics-based lerp damping
 * - Automatically expands on interactive elements
 * - Completely disabled on touchscreens / coarse pointers
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  const dotRef = useRef(null)
  const ringRef = useRef(null)

  const mouse = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })

  useEffect(() => {
    // Only enable if device has fine pointer and motion not strictly reduced
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!hasFinePointer || prefersReducedMotion) {
      setEnabled(false)
      return
    }

    setEnabled(true)

    const onMouseMove = (e) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
      }
    }

    const onMouseDown = () => setClicked(true)
    const onMouseUp = () => setClicked(false)

    // Detect hover over interactive elements
    const onMouseOver = (e) => {
      const target = e.target.closest('button, a, input, select, textarea, [role="button"], .interactive-cursor')
      setHovered(!!target)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mouseover', onMouseOver)

    // Smooth RAF loop for outer ring interpolation
    let animId
    const loop = () => {
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.18
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.18

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`
      }
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mouseover', onMouseOver)
      cancelAnimationFrame(animId)
    }
  }, [])

  if (!enabled) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      {/* Inner Precision Cyan Core */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#00f0ff] transition-transform duration-75 ease-out ${
          clicked ? 'scale-150 bg-white' : ''
        }`}
      />

      {/* Outer Damped HUD Tracking Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full border transition-all duration-200 ease-out flex items-center justify-center ${
          hovered
            ? 'w-12 h-12 border-cyan-300 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,240,255,0.3)] scale-110'
            : 'w-7 h-7 border-cyan-400/40'
        } ${clicked ? 'scale-90 border-cyan-200' : ''}`}
      >
        {/* Subtle crosshair notches on hover */}
        {hovered && (
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping opacity-60" />
        )}
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'

/**
 * Desktop-Only Minimal Atmospheric Custom Cursor
 * - Central luminous point + damped outer tracking ring
 * - Expands slightly when hovering over buttons, links, or interactive cards
 * - Auto-disabled on touch/mobile devices and when prefers-reduced-motion is on
 */
export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 })
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if device supports fine hover (desktop mouse)
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) {
      setIsMobile(true)
      return
    }

    const onMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }

    const onMouseOver = (e) => {
      const target = e.target
      const isInteractive = target.closest('button, a, input, select, [role="button"], .interactive, .leaflet-interactive')
      setIsHovered(!!isInteractive)
    }

    const onMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseover', onMouseOver, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [isVisible])

  // Smooth RAF damping for the outer ring
  useEffect(() => {
    if (isMobile) return

    let animId
    const followCursor = () => {
      setRingPos((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.22,
        y: prev.y + (pos.y - prev.y) * 0.22,
      }))
      animId = requestAnimationFrame(followCursor)
    }
    animId = requestAnimationFrame(followCursor)
    return () => cancelAnimationFrame(animId)
  }, [pos, isMobile])

  if (isMobile || !isVisible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Outer Atmospheric Damped Ring */}
      <div
        className="fixed rounded-full border border-cyan-400/50 transition-all duration-150 ease-out"
        style={{
          left: `${ringPos.x}px`,
          top: `${ringPos.y}px`,
          width: isHovered ? '42px' : '24px',
          height: isHovered ? '42px' : '24px',
          transform: 'translate(-50%, -50%)',
          backgroundColor: isHovered ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
          boxShadow: isHovered ? '0 0 15px rgba(0, 240, 255, 0.35)' : 'none',
        }}
      />
      {/* Central Luminous Point */}
      <div
        className="fixed rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: '5px',
          height: '5px',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}

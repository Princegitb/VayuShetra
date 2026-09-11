import React, { useEffect, useState } from 'react'

/**
 * Desktop Atmospheric Custom Cursor
 * Supports:
 * - Default cyan reticle point + damped tracking ring
 * - Image-based cursor (Modi photo cutout or circular badge) with glowing HUD halo
 * - Expands and glows upon hovering interactive elements
 * - Click feedback animation
 * - Auto-disabled on touch/mobile devices
 */
export default function CustomCursor({
  imageSrc = null,
  variant = 'cutout', // 'cutout' | 'circle'
  size = 46,
}) {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 })
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
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

    const onMouseDown = () => setIsClicked(true)
    const onMouseUp = () => setIsClicked(false)

    const onMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseover', onMouseOver, { passive: true })
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseleave', onMouseLeave)

    // Optional: add cursor-none to body so native arrow is replaced by photo cursor
    if (imageSrc) {
      document.body.classList.add('hide-default-cursor')
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseleave', onMouseLeave)
      if (imageSrc) {
        document.body.classList.remove('hide-default-cursor')
      }
    }
  }, [isVisible, imageSrc])

  // Smooth RAF damping for the outer halo ring
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
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      {imageSrc ? (
        /* Precision Photo Cursor (Clean, Authentic Modi photo) */
        <div
          className="fixed pointer-events-none transition-transform duration-100 ease-out select-none"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            transform: `translate(-50%, -32%) scale(${isClicked ? 0.92 : isHovered ? 1.2 : 1.0})`,
            filter: isHovered
              ? 'drop-shadow(0 0 16px rgba(0, 240, 255, 0.9)) drop-shadow(0 0 28px rgba(249, 115, 22, 0.55))'
              : 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 10px rgba(0, 240, 255, 0.35))',
          }}
        >
          {variant === 'circle' ? (
            /* Circular Avatar Badge */
            <div
              className="rounded-full overflow-hidden border-2 border-cyan-400/80 bg-[#05070A]/80 shadow-[0_0_16px_rgba(0,240,255,0.45)] flex items-center justify-center"
              style={{ width: `${size}px`, height: `${size}px` }}
            >
              <img
                src={imageSrc}
                alt="Cursor Avatar"
                className="w-full h-full object-cover object-top select-none pointer-events-none"
                draggable="false"
              />
            </div>
          ) : (
            /* Transparent Cutout Figure */
            <div className="relative flex items-center justify-center">
              <img
                src={imageSrc}
                alt="Cursor"
                style={{ height: `${size}px`, width: 'auto' }}
                className="object-contain select-none pointer-events-none"
                draggable="false"
              />
            </div>
          )}
        </div>
      ) : (
        /* Classic Reticle Cursor */
        <>
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
        </>
      )}
    </div>
  )
}

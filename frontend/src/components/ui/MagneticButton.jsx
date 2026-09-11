import React, { useRef, useState } from 'react'

/**
 * MagneticButton
 * Interactive button component that pulls toward the cursor on proximity
 */
export default function MagneticButton({
  children,
  onClick,
  className = '',
  strength = 0.35,
  textStrength = 0.2,
  ...props
}) {
  const btnRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    if (!btnRef.current) return
    const { left, top, width, height } = btnRef.current.getBoundingClientRect()
    const centerX = left + width / 2
    const centerY = top + height / 2

    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength

    setPosition({ x: deltaX, y: deltaY })
    setTextPosition({ x: deltaX * textStrength, y: deltaY * textStrength })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
    setTextPosition({ x: 0, y: 0 })
  }

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: position.x === 0 ? 'transform 0.4s cubic-bezier(0.2, 1, 0.3, 1)' : 'transform 0.1s ease-out'
      }}
      className={`interactive-cursor relative inline-flex items-center justify-center ${className}`}
      {...props}
    >
      <span
        style={{
          transform: `translate3d(${textPosition.x}px, ${textPosition.y}px, 0)`,
          transition: textPosition.x === 0 ? 'transform 0.4s cubic-bezier(0.2, 1, 0.3, 1)' : 'transform 0.1s ease-out'
        }}
        className="inline-flex items-center gap-2 w-full h-full"
      >
        {children}
      </span>
    </button>
  )
}

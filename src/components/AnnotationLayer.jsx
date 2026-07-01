import { useState } from 'react'

const SEV_ANN = { C: 'ann-C', H: 'ann-H', M: 'ann-M', L: 'ann-L' }

export default function AnnotationLayer({ image, alt, annotations = [], onImageClick, highlightId }) {
  // Numbered pins are always visible at each gap; hovering a pin reveals only
  // that gap's dotted outline, so the screenshot stays readable.
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <div className="ann-layer">
      <img
        className="ann-img"
        src={image}
        alt={alt || ''}
        style={{ cursor: onImageClick ? 'zoom-in' : 'default' }}
        onClick={onImageClick}
      />

      {annotations.map((a, i) => {
        const sevCls = a.specialPriority ? 'ann-M' : (SEV_ANN[a.priority] || 'ann-M')
        const active = hoveredId === a.id || (highlightId && a.id === highlightId)
        const pulse = highlightId && a.id === highlightId ? ' ann-box--pulse' : ''
        return (
          <div
            key={a.ref || i}
            className={`ann-box ${sevCls}${active ? ' ann-box--active' : ''}${pulse}`}
            style={{ left: `${a.x}%`, top: `${a.y}%`, width: `${a.w}%`, height: `${a.h}%` }}
          >
            <span
              className="ann-num"
              title={a.element || ''}
              onMouseEnter={() => setHoveredId(a.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {a.ref}
            </span>
          </div>
        )
      })}
    </div>
  )
}

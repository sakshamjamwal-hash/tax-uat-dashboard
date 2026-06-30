import { useState } from 'react'

const SEV_CLASS = { C: 'sev-C', H: 'sev-H', M: 'sev-M', L: 'sev-L' }
const SEV_LABEL = { C: 'Critical', H: 'High', M: 'Medium', L: 'Low' }
const SEV_ANN = { C: 'ann-C', H: 'ann-H', M: 'ann-M', L: 'ann-L' }

export default function AnnotationLayer({ image, alt, annotations = [], onImageClick, highlightId }) {
  // Screenshot stays clean by default; hovering the gap-count badge reveals the
  // gap locations as dotted outlines. A table row jump (highlightId) reveals just
  // that one box and pulses it.
  const [revealed, setRevealed] = useState(false)
  const count = annotations.length

  return (
    <div className={`ann-layer${revealed ? ' ann-revealed' : ''}`}>
      <img
        className="ann-img"
        src={image}
        alt={alt || ''}
        style={{ cursor: onImageClick ? 'zoom-in' : 'default' }}
        onClick={onImageClick}
      />

      {count > 0 && (
        <button
          type="button"
          className="gap-counter"
          title={`${count} gap${count > 1 ? 's' : ''} — hover to highlight`}
          onMouseEnter={() => setRevealed(true)}
          onMouseLeave={() => setRevealed(false)}
          onFocus={() => setRevealed(true)}
          onBlur={() => setRevealed(false)}
        >
          {count}
        </button>
      )}

      {annotations.map((a, i) => {
        const sevCls = a.specialPriority ? 'ann-M' : (SEV_ANN[a.priority] || 'ann-M')
        const shown = revealed || (highlightId && a.id === highlightId)
        const pulse = highlightId && a.id === highlightId ? ' ann-box--pulse' : ''
        return (
          <div
            key={a.ref || i}
            className={`ann-box ${sevCls}${shown ? ' ann-box--shown' : ''}${pulse}`}
            style={{ left: `${a.x}%`, top: `${a.y}%`, width: `${a.w}%`, height: `${a.h}%` }}
          >
            <span className="ann-num">{a.ref}</span>
          </div>
        )
      })}
    </div>
  )
}

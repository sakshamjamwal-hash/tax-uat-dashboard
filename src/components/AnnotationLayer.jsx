const SEV_CLASS = { C: 'sev-C', H: 'sev-H', M: 'sev-M', L: 'sev-L' }
const SEV_LABEL = { C: 'Critical', H: 'High', M: 'Medium', L: 'Low' }
const SEV_ANN = { C: 'ann-C', H: 'ann-H', M: 'ann-M', L: 'ann-L' }

export default function AnnotationLayer({ image, alt, annotations = [], onImageClick, highlightId }) {
  if (!image) {
    return (
      <div className="ann-layer ann-layer--empty">
        <div className="ann-empty">No screenshot captured</div>
      </div>
    )
  }
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
        const pulse = highlightId && a.id === highlightId ? ' ann-box--pulse' : ''
        return (
          <div
            key={a.ref || i}
            className={`ann-box ${sevCls}${pulse}`}
            style={{
              position: 'absolute',
              left: `${a.x}%`,
              top: `${a.y}%`,
              width: `${a.w}%`,
              height: `${a.h}%`,
            }}
          >
            <span className="ann-num">{a.ref}</span>
            <div className="ann-tip" onClick={e => e.stopPropagation()}>
              <div className="ann-tip-head">
                <span className="ann-tip-ref">{a.ref}</span>
                {a.specialPriority
                  ? <span className="sev sev-M">{a.specialPriority}</span>
                  : <span className={`sev ${SEV_CLASS[a.priority] || 'sev-M'}`}>{SEV_LABEL[a.priority] || a.priority}</span>}
              </div>
              <div className="ann-tip-title">{a.element}</div>
              <div className="ann-tip-build">{a.build}</div>
              {a.fix && <div className="ann-tip-fix"><strong>Fix:</strong> {a.fix}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

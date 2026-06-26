import { useEffect } from 'react'

export default function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!src) return null

  return (
    <div className="lb open" onClick={onClose}>
      <div className="lb-wrap" onClick={e => e.stopPropagation()}>
        <div className="lb-close">ESC / CLICK TO CLOSE</div>
        <img src={src} alt={alt || ''} onClick={onClose} />
      </div>
    </div>
  )
}

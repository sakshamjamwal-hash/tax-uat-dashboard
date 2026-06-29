import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { scrim, pop } from '../motion.js'

export default function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!src) return null

  return (
    <motion.div
      className="lb open"
      onClick={onClose}
      variants={scrim}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className="lb-wrap"
        onClick={e => e.stopPropagation()}
        variants={pop}
      >
        <div className="lb-close">ESC / CLICK TO CLOSE</div>
        <img src={src} alt={alt || ''} onClick={onClose} />
      </motion.div>
    </motion.div>
  )
}

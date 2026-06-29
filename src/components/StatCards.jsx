import Reveal from './Reveal.jsx'
import { EASE } from '../motion.js'

const STATS = [
  { label: 'TOTAL', pill: 'ALL', num: '172', cls: '', cap: '30-min recording vs Figma · +76 from deep scan' },
  { label: 'CRITICAL', pill: null, num: '11', cls: 'c', cap: 'blocker · ship-stopping' },
  { label: 'HIGH', pill: null, num: '68', cls: 'h', cap: 'user-facing regression' },
  { label: 'MEDIUM', pill: null, num: '73', cls: 'm', cap: 'noticeable, non-blocking' },
  { label: 'LOW', pill: null, num: '20', cls: 'l', cap: 'polish / verify' },
]

export default function StatCards() {
  return (
    <section className="stats">
      {STATS.map((s, i) => (
        <Reveal
          key={s.label}
          className="stat"
          y={16}
          delay={0.15 + i * 0.07}
          whileHover={{ y: -3, borderColor: 'var(--border-strong)', transition: { duration: 0.2, ease: EASE } }}
        >
          <div className="stat-lbl">
            <span className="mono">{s.label}</span>
            {s.pill && <span className="pill">{s.pill}</span>}
          </div>
          <div className={`stat-num ${s.cls}`}>{s.num}</div>
          <div className="stat-cap">{s.cap}</div>
        </Reveal>
      ))}
    </section>
  )
}

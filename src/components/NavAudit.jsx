import SectionHeader from './SectionHeader.jsx'
import SceneCard from './SceneCard.jsx'
import FindingsTable from './FindingsTable.jsx'

const SEV_MAP = { C: 'sev-C', H: 'sev-H', M: 'sev-M', L: 'sev-L', OK: '' }
const SEV_LABEL = { C: 'Critical', H: 'High', M: 'Medium', L: 'Low' }

function NavStateGrid({ rows }) {
  return (
    <>
      {/* Header row */}
      <div className="ns-grid">
        <div className="ns-cell head">State</div>
        <div className="ns-cell head">Figma spec</div>
        <div className="ns-cell head">Live build</div>
        <div className="ns-cell head">Gap</div>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="ns-grid">
          <div className="ns-cell state" style={{ whiteSpace: 'pre-line' }}>{row.state}</div>
          <div className="ns-cell">
            <FigmaSpecCell row={row} />
          </div>
          <div className="ns-cell">
            <LiveSpecCell row={row} />
          </div>
          <div className="ns-cell">
            {row.gap === 'OK'
              ? <span className="sev-ok">Match ✓</span>
              : row.specialGap
                ? <span className="sev sev-M">{row.specialGap}</span>
                : <span className={`sev ${SEV_MAP[row.gap] || 'sev-M'}`}>{SEV_LABEL[row.gap] || row.gap}</span>
            }
            <div style={{ fontSize: '11px', color: 'var(--fg-dim)', marginTop: '6px' }}>{row.gapNote}</div>
          </div>
        </div>
      ))}
    </>
  )
}

function FigmaSpecCell({ row }) {
  const el = row.figmaEl
  const desc = row.figmaDesc

  if (el === 'unstart') return (
    <>
      <div className="swatch"><div className="dot-unstart" /><span style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>Section label</span></div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>{desc}</div>
    </>
  )
  if (el === 'active') return (
    <>
      <div className="swatch"><div className="dot-active" /><span style={{ fontSize: '11px', color: '#089958', fontWeight: 500 }}>Section label</span></div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>{desc}</div>
    </>
  )
  if (el === 'done') return (
    <>
      <div className="swatch"><div className="dot-done">✓</div><span style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>Section label</span></div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>{desc}</div>
    </>
  )
  if (el === 'deferred-figma') return (
    <>
      <div className="swatch">
        <div className="dot-unstart" style={{ borderColor: '#FF7734', background: 'transparent' }} />
        <span style={{ fontSize: '11px', color: '#FF7734', fontWeight: 500 }}>Section label</span>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)', marginTop: '6px' }}>{desc}</div>
    </>
  )
  if (el === 'locked') return (
    <>
      <div className="swatch">
        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '9px' }}>🔒</div>
        <span style={{ fontSize: '11px', color: '#666' }}>Section label</span>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)', marginTop: '6px' }}>{desc}</div>
    </>
  )
  if (el === 'error-none') return (
    <>
      <div style={{ fontSize: '11px', color: '#a0a0a0', padding: '4px 0' }}>Sub-item label</div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>{desc}</div>
    </>
  )
  if (el === 'child-unstart-figma') return (
    <>
      <div style={{ fontSize: '11px', color: '#a0a0a0', padding: '4px 0' }}>Sub-item label</div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>{desc}</div>
    </>
  )
  if (el === 'child-active-figma') return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '4px 0' }}>
        <div className="pill-active">Sub-item label</div>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)', marginTop: '6px' }}>{desc}</div>
    </>
  )
  if (el === 'child-done') return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}>
        <div className="dot-unstart" style={{ borderColor: '#089958', width: '12px', height: '12px', position: 'relative' }}>
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#089958', fontSize: '7px', fontWeight: 700 }}>✓</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>Sub-item label</span>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)', marginTop: '4px' }}>{desc}</div>
    </>
  )
  return <div style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>{desc}</div>
}

function LiveSpecCell({ row }) {
  const el = row.liveEl
  const desc = row.liveDesc

  if (el === 'unstart') return (
    <>
      <div className="swatch"><div className="dot-unstart" /><span style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>Section label</span></div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>{desc}</div>
    </>
  )
  if (el === 'active-sm') return (
    <>
      <div className="swatch">
        <div className="dot-active" style={{ width: '13px', height: '13px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#089958', display: 'block' }} />
        </div>
        <span style={{ fontSize: '11px', color: '#089958' }}>Section label</span>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>{desc}</div>
    </>
  )
  if (el === 'done-outline') return (
    <>
      <div className="swatch">
        <div className="dot-unstart" style={{ borderColor: '#089958', position: 'relative' }}>
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#089958', fontSize: '8px', fontWeight: 700 }}>✓</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>Section label</span>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>{desc}</div>
    </>
  )
  if (el === 'deferred-live') return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="swatch"><div className="dot-unstart" /><span style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>Section label</span></div>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)', marginTop: '6px' }}>{desc}</div>
    </>
  )
  if (el === 'locked-live') return (
    <>
      <div className="swatch">
        <div className="dot-unstart" style={{ opacity: 0.5 }} />
        <span style={{ fontSize: '11px', color: '#555' }}>Section label</span>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)', marginTop: '6px' }}>{desc}</div>
    </>
  )
  if (el === 'error-dot') return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e05a5a', flexShrink: 0, boxShadow: '0 0 0 2px rgba(224,90,90,.25)' }} />
        <span style={{ fontSize: '11px', color: '#a0a0a0' }}>LTCG Re-Investment</span>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)', marginTop: '4px' }}>{desc}</div>
    </>
  )
  if (el === 'child-unstart-live') return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cecece', flexShrink: 0 }} />
        <span style={{ fontSize: '11px', color: '#a0a0a0' }}>Sub-item label</span>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>{desc}</div>
    </>
  )
  if (el === 'child-active-live') return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#089958', flexShrink: 0 }} />
        <div className="pill-active">Sub-item label</div>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)', marginTop: '6px' }}>{desc}</div>
    </>
  )
  if (el === 'child-done') return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}>
        <div className="dot-unstart" style={{ borderColor: '#089958', width: '12px', height: '12px', position: 'relative' }}>
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#089958', fontSize: '7px', fontWeight: 700 }}>✓</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>Sub-item label</span>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--fg-dim)', marginTop: '4px' }}>{desc}</div>
    </>
  )
  return <div style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>{desc}</div>
}

export default function NavAudit({ tab, editState, onEdit, onDelete, onLightbox, isAdmin }) {
  return (
    <div>
      <SectionHeader idx={tab.sectionHeader.idx} title={tab.sectionHeader.title} />

      {tab.scenes.map((scene, si) => (
        <div key={scene.id}>
          {scene.sectionHeader && (
            <SectionHeader idx={scene.sectionHeader.idx} title={scene.sectionHeader.title} />
          )}
          <SceneCard
            scene={scene}
            tabId="nav"
            editState={editState}
            onEdit={onEdit}
            onDelete={onDelete}
            onLightbox={onLightbox}
            isAdmin={isAdmin}
          />
        </div>
      ))}

      {/* Nav state breakdown grid */}
      <NavStateGrid rows={tab.navStateGrid} />

      {/* User-reported gaps table */}
      {tab.blocks.map(block => (
        <div key={block.id}>
          <div className="block">
            <div className="bh">
              <h3>{block.header}</h3>
              <span className="cnt">{block.count}</span>
            </div>
            <FindingsTable
              block={block}
              tableKey={`nav:${block.id}`}
              editState={editState}
              onEdit={onEdit}
              onDelete={onDelete}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

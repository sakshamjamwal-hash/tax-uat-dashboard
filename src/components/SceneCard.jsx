const SEV_MAP = { C: 'sev-C', H: 'sev-H', M: 'sev-M', L: 'sev-L' }
const SEV_LABEL = { C: 'Critical', H: 'High', M: 'Medium', L: 'Low' }

function PriorityBadge({ code, special }) {
  if (special) return <span className="sev sev-M">{special}</span>
  if (!code || code === '—') return <span style={{ color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)', fontSize: '9px' }}>—</span>
  if (code === 'OK') return <span className="sev-ok">Match ✓</span>
  const cls = SEV_MAP[code] || 'sev-M'
  return <span className={`sev ${cls}`}>{SEV_LABEL[code] || code}</span>
}

export default function SceneCard({ scene, tabId, editState, onEdit, onDelete, onLightbox, isAdmin }) {
  const hasTable = scene.rows && scene.rows.length > 0 && scene.columns

  return (
    <section className="scene">
      <div className="sm">
        <div className="lbl">
          <span className="name">{scene.name}</span>
          <span className="desc">{scene.desc}</span>
        </div>
        <span className="stag">{scene.tag}</span>
      </div>

      {scene.reaudit && (
        <div className="invalid-banner">
          ⚠ Gap analysis based on wrong Figma frame — findings below need re-audit against corrected screenshot
        </div>
      )}

      <div className="compare">
        {/* Figma pane */}
        <div className="pane">
          <div className="ph">
            <div className="pw">
              <span className="dot" />
              <span className="t">Design</span>
              <span className="src">Figma</span>
            </div>
            <span className="pv">{scene.figma.node}</span>
          </div>
          <div className="browser">
            <div className="bbar">
              <span className="traf"><i /><i /><i /></span>
              <span className="url">{scene.figma.url}</span>
            </div>
            <div className={`screen${scene.tall ? ' tall' : ''}`}>
              {scene.figma.img ? (
                <div className="ann-wrap" style={{ height: '100%' }}>
                  <img
                    src={scene.figma.img}
                    alt={scene.figma.alt}
                    loading="lazy"
                    onClick={() => onLightbox && onLightbox(scene.figma.img, scene.figma.alt)}
                  />
                  {(scene.figmaAnns || []).map((ann, i) => (
                    <div
                      key={i}
                      className={`ann ${ann.type}`}
                      style={{ ...ann.style }}
                    >
                      <span className={`ann-tag ${ann.type}${ann.labelPos === 'bottom' ? ' bottom' : ''}`}>
                        {ann.label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-spec-placeholder">
                  <div className="inner">
                    <div className="icon">🔍</div>
                    <div className="label">No Figma spec found</div>
                    <div className="desc">Sub-item error indicator does not exist in the Figma nav component definition.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live pane */}
        <div className="pane">
          <div className="ph">
            <div className="pw">
              <span className="dot" />
              <span className="t">Build</span>
              <span className="src">Web</span>
            </div>
            <span className="pv">{scene.live.node}</span>
          </div>
          <div className="browser">
            <div className="bbar">
              <span className="traf"><i /><i /><i /></span>
              <span className="url">{scene.live.url}</span>
            </div>
            <div className={`screen${scene.tall ? ' tall' : ''}`}>
              <div className="ann-wrap" style={{ height: '100%' }}>
                <img
                  src={scene.live.img}
                  alt={scene.live.alt}
                  loading="lazy"
                  onClick={() => onLightbox && onLightbox(scene.live.img, scene.live.alt)}
                />
                {(scene.liveAnns || []).map((ann, i) => (
                  <div
                    key={i}
                    className={`ann ${ann.type}`}
                    style={{ ...ann.style }}
                  >
                    <span
                      className={`ann-tag ${ann.type}`}
                      style={ann.labelPos === 'bottom' ? { top: 'auto', bottom: '-18px' } : {}}
                    >
                      {ann.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasTable && (
        <FindingsTableInScene
          scene={scene}
          tabId={tabId}
          editState={editState}
          onEdit={onEdit}
          onDelete={onDelete}
          isAdmin={isAdmin}
        />
      )}
    </section>
  )
}

// Inline table for scenes
function FindingsTableInScene({ scene, tabId, editState, onEdit, onDelete, isAdmin }) {
  const tableKey = `scene:${scene.id}`
  const cols = scene.columns
  const SEV_CODE_MAP = { C: 'Critical', H: 'High', M: 'Medium', L: 'Low' }
  const SEV_RMAP = { Critical: 'sev-C', High: 'sev-H', Medium: 'sev-M', Low: 'sev-L' }

  return (
    <div className="findings">
      <table>
        <thead>
          <tr>
            {cols.map(c => <th key={c}>{c}</th>)}
            <th className="col-fix">Fix</th>
            {isAdmin && <th className="col-act" />}
          </tr>
        </thead>
        <tbody>
          {scene.rows.map(row => {
            const key = `${tableKey}:${row.id}`
            return (
              <tr key={row.id}>
                {row.cells.map((cell, ci) => {
                  const cellKey = `${key}:${ci}`
                  const val = editState[cellKey] !== undefined ? editState[cellKey] : cell
                  // Priority cell (last col)
                  if (ci === row.cells.length - 1) {
                    const sevVal = editState[`${key}:sev`] !== undefined ? editState[`${key}:sev`] : row.cells[ci]
                    if (!isAdmin) {
                      if (row.specialPriority) return <td key={ci}><span className="sev sev-M">{row.specialPriority}</span></td>
                      if (!sevVal || sevVal === '—') return <td key={ci}><span style={{ color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)', fontSize: '9px' }}>—</span></td>
                      const displayVal = SEV_CODE_MAP[sevVal] || sevVal || 'Medium'
                      const cls = SEV_RMAP[displayVal] || ''
                      return <td key={ci}><span className={`sev ${cls}`}>{displayVal}</span></td>
                    }
                    return (
                      <td key={ci}>
                        <PrioritySelect
                          value={sevVal}
                          special={row.specialPriority}
                          onChange={v => onEdit(`${key}:sev`, v)}
                        />
                      </td>
                    )
                  }
                  if (!isAdmin) {
                    return (
                      <td key={ci} className={ci === 1 ? 'el' : ci === 3 ? 'note' : ''}>
                        {val}
                      </td>
                    )
                  }
                  return (
                    <td
                      key={ci}
                      className={ci === 1 ? 'el' : ci === 3 ? 'note' : ''}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => onEdit(cellKey, e.currentTarget.textContent)}
                    >
                      {val}
                    </td>
                  )
                })}
                {isAdmin ? (
                  <td
                    className="fix-cell col-fix"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => onEdit(`${key}:fix`, e.currentTarget.textContent)}
                  >
                    {editState[`${key}:fix`] !== undefined ? editState[`${key}:fix`] : (row.fix || '')}
                  </td>
                ) : (
                  <td className="fix-cell col-fix">
                    {editState[`${key}:fix`] !== undefined ? editState[`${key}:fix`] : (row.fix || '')}
                  </td>
                )}
                {isAdmin && (
                  <td className="row-act">
                    <button className="del-row" title="Delete" onClick={() => onDelete(key)}>×</button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
        {isAdmin && (
          <tfoot>
            <tr>
              <td colSpan={cols.length + 2} className="add-row-cell">
                <button className="add-row-btn">+ Add gap</button>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

function PrioritySelect({ value, special, onChange }) {
  const SEV_RMAP = { Critical: 'sev-C', High: 'sev-H', Medium: 'sev-M', Low: 'sev-L' }
  const SEV_CODE_MAP = { C: 'Critical', H: 'High', M: 'Medium', L: 'Low' }

  if (special) return <span className="sev sev-M">{special}</span>

  const displayVal = SEV_CODE_MAP[value] || value || 'Medium'
  const cls = SEV_RMAP[displayVal] || ''

  if (!value || value === '—') {
    return <span style={{ color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)', fontSize: '9px' }}>—</span>
  }

  return (
    <select
      className={`sev-select ${cls}`}
      value={displayVal}
      onChange={e => onChange(e.target.value)}
    >
      {['Critical', 'High', 'Medium', 'Low', '—'].map(v => (
        <option key={v} value={v}>{v}</option>
      ))}
    </select>
  )
}

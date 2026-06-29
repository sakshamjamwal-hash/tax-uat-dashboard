export default function EditBar({ dirty, status, error, onSave, onCancel }) {
  const visible = dirty || status === 'saving' || status === 'saved' || status === 'error'

  let statusText = 'Unsaved changes'
  let statusColor = 'var(--fg-dim)'
  if (status === 'saving') { statusText = 'Saving to portal…'; statusColor = 'var(--fg-muted)' }
  else if (status === 'saved') { statusText = 'Saved to portal ✓'; statusColor = 'var(--success)' }
  else if (status === 'error') { statusText = error || 'Save failed'; statusColor = 'var(--danger)' }

  return (
    <div className={`edit-bar${visible ? ' visible' : ''}`}>
      <span className="edit-status" style={{ color: statusColor }}>{statusText}</span>
      <div className="edit-bar-btns">
        <button className="cancel-btn" onClick={onCancel}>Cancel changes</button>
        <button className="save-btn" onClick={onSave} disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : 'Save to portal'}
        </button>
      </div>
    </div>
  )
}

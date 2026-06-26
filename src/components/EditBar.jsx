export default function EditBar({ dirty, onSave, onCancel }) {
  return (
    <div className={`edit-bar${dirty ? ' visible' : ''}`}>
      <span className="edit-status">Unsaved changes</span>
      <div className="edit-bar-btns">
        <button className="cancel-btn" onClick={onCancel}>Cancel changes</button>
        <button className="save-btn" onClick={onSave}>Save Changes</button>
      </div>
    </div>
  )
}

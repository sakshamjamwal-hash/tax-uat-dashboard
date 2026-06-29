import SectionHeader from './SectionHeader.jsx'
import FindingsTable from './FindingsTable.jsx'
import NavCompare from './NavCompare.jsx'

export default function NavAudit({ tab, editState, deletedRows, addedRows, onEdit, onDelete, onAddRow, onLightbox, isAdmin }) {
  const block = tab.blocks[0]
  return (
    <div>
      <SectionHeader idx={tab.sectionHeader.idx} title={tab.sectionHeader.title} />

      <NavCompare compare={tab.compare} rows={block.rows} onLightbox={onLightbox} />

      <div className="block">
        <div className="bh">
          <h3>{block.header}</h3>
          <span className="cnt">{block.count}</span>
        </div>
        <FindingsTable
          block={block}
          tableKey="nav:gaps"
          editState={editState}
          deletedRows={deletedRows}
          addedRows={addedRows}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddRow={onAddRow}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}

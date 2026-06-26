import SectionHeader from './SectionHeader.jsx'
import SceneCard from './SceneCard.jsx'
import FindingsTable from './FindingsTable.jsx'

export default function SceneTab({ tab, editState, onEdit, onDelete, onLightbox, isAdmin }) {
  return (
    <div>
      <SectionHeader idx={tab.sectionHeader.idx} title={tab.sectionHeader.title} />

      {tab.scenes.map(scene => (
        <SceneCard
          key={scene.id}
          scene={scene}
          tabId={tab.id}
          editState={editState}
          onEdit={onEdit}
          onDelete={onDelete}
          onLightbox={onLightbox}
          isAdmin={isAdmin}
        />
      ))}

      {tab.blocks.map(block => (
        <div key={block.id} className="block">
          <div className="bh">
            <h3>{block.header}</h3>
            <span className="cnt">{block.count}</span>
          </div>
          <FindingsTable
            block={block}
            tableKey={`${tab.id}:${block.id}`}
            editState={editState}
            onEdit={onEdit}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
        </div>
      ))}
    </div>
  )
}

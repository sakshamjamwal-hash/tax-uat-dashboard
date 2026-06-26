import SectionHeader from './SectionHeader.jsx'
import FindingsTable from './FindingsTable.jsx'

export default function Overview({ tab, editState, onEdit, onDelete, isAdmin }) {
  return (
    <div>
      {/* Systematic gaps */}
      <SectionHeader idx={tab.sectionHeader.idx} title={tab.sectionHeader.title} />
      <div className="block">
        <div className="bh">
          <h3>{tab.blocks[0].header}</h3>
          <span className="cnt">{tab.blocks[0].count}</span>
        </div>
        <FindingsTable
          block={tab.blocks[0]}
          tableKey={`overview:systematic`}
          editState={editState}
          onEdit={onEdit}
          onDelete={onDelete}
          isAdmin={isAdmin}
        />
      </div>

      {/* Critical gaps */}
      <SectionHeader idx={tab.blocks[1].sectionHeader.idx} title={tab.blocks[1].sectionHeader.title} />
      <div className="block">
        <div className="bh">
          <h3>{tab.blocks[1].header}</h3>
          <span className="cnt">{tab.blocks[1].count}</span>
        </div>
        <FindingsTable
          block={tab.blocks[1]}
          tableKey={`overview:critical`}
          editState={editState}
          onEdit={onEdit}
          onDelete={onDelete}
          isAdmin={isAdmin}
        />
      </div>

      {/* Root cause analysis */}
      <div className="block" style={{ marginTop: '48px' }}>
        <div className="bh">
          <h3>Why these were missed — root cause breakdown</h3>
          <span className="cnt">6 categories</span>
        </div>
        <div className="callout-grid" style={{ padding: '24px 28px' }}>
          {tab.rootCause.map((item, i) => (
            <div key={i} className="callout-item">
              <div className="ci-tag">{item.tag}</div>
              <div className="ci-title">{item.title}</div>
              <div className="ci-body">{item.body}</div>
              <div className="ci-bugs">{item.bugs}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Missing sections note */}
      <div
        className="missing"
        style={{ margin: '0 48px 48px', borderRadius: 'var(--r-2xl)' }}
        dangerouslySetInnerHTML={{ __html: tab.missingNote }}
      />
    </div>
  )
}

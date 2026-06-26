import { useState, useCallback, useRef } from 'react'
import { TABS } from './data/gaps.js'

import TopStrip from './components/TopStrip.jsx'
import Hero from './components/Hero.jsx'
import StatCards from './components/StatCards.jsx'
import TabNav from './components/TabNav.jsx'
import Overview from './components/Overview.jsx'
import NavAudit from './components/NavAudit.jsx'
import SceneTab from './components/SceneTab.jsx'
import EditBar from './components/EditBar.jsx'
import UndoToast from './components/UndoToast.jsx'
import Lightbox from './components/Lightbox.jsx'
import PasswordModal from './components/PasswordModal.jsx'

function loadEdits() {
  try { return JSON.parse(localStorage.getItem('uat-edits') || '{}') }
  catch { return {} }
}

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    try { return sessionStorage.getItem('uat-tab') || 'overview' }
    catch { return 'overview' }
  })

  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('uat-admin') === '1')
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const [edits, setEdits] = useState(loadEdits)
  const [deletedRows, setDeletedRows] = useState({})
  const [dirty, setDirty] = useState(false)

  // Undo toast state
  const [undoVisible, setUndoVisible] = useState(false)
  const [undoMessage, setUndoMessage] = useState('')
  const undoFnRef = useRef(null)

  // Lightbox state
  const [lightbox, setLightbox] = useState(null)

  function handleAdminToggle() {
    if (isAdmin) {
      localStorage.removeItem('uat-admin')
      setIsAdmin(false)
    } else {
      setShowPasswordModal(true)
    }
  }

  function handlePasswordSubmit(pw) {
    if (pw === 'pabothegreat') {
      localStorage.setItem('uat-admin', '1')
      setIsAdmin(true)
      setShowPasswordModal(false)
      return true
    }
    return false
  }

  function handleTabChange(id) {
    setActiveTab(id)
    try { sessionStorage.setItem('uat-tab', id) } catch {}
  }

  function showUndo(message, fn) {
    undoFnRef.current = fn
    setUndoMessage(message)
    setUndoVisible(false)
    // force remount to reset animation
    requestAnimationFrame(() => setUndoVisible(true))
  }

  const handleEdit = useCallback((key, value) => {
    setEdits(prev => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem('uat-edits', JSON.stringify(next)) } catch {}
      return next
    })
    setDirty(true)
    showUndo('Edit undone', () => {
      setEdits(prev => {
        const next = { ...prev }
        delete next[key]
        try { localStorage.setItem('uat-edits', JSON.stringify(next)) } catch {}
        return next
      })
    })
  }, [])

  const handleDelete = useCallback((rowKey) => {
    setDeletedRows(prev => ({ ...prev, [rowKey]: true }))
    setDirty(true)
    showUndo('Row deleted', () => {
      setDeletedRows(prev => {
        const next = { ...prev }
        delete next[rowKey]
        return next
      })
    })
  }, [])

  function handleSave() {
    const data = JSON.stringify({ edits, deletedRows }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'uat-edits.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setDirty(false)
  }

  function handleCancel() {
    if (!dirty || confirm('Discard all changes?')) {
      setEdits(loadEdits())
      setDeletedRows({})
      setDirty(false)
    }
  }

  function handleUndo() {
    if (undoFnRef.current) {
      undoFnRef.current()
      undoFnRef.current = null
    }
    setUndoVisible(false)
  }

  // Merge edits + deletions into combined state for children
  const editState = { ...edits }

  const tabData = TABS.find(t => t.id === activeTab)

  function renderTab() {
    if (!tabData) return null
    switch (tabData.id) {
      case 'overview':
        return <Overview tab={tabData} editState={editState} onEdit={handleEdit} onDelete={handleDelete} isAdmin={isAdmin} />
      case 'nav':
        return <NavAudit tab={tabData} editState={editState} onEdit={handleEdit} onDelete={handleDelete} onLightbox={(src, alt) => setLightbox({ src, alt })} isAdmin={isAdmin} />
      default:
        return <SceneTab tab={tabData} editState={editState} onEdit={handleEdit} onDelete={handleDelete} onLightbox={(src, alt) => setLightbox({ src, alt })} isAdmin={isAdmin} />
    }
  }

  return (
    <>
      <TopStrip isAdmin={isAdmin} onAdminToggle={handleAdminToggle} />
      <main>
        <Hero />
        <StatCards />
        <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="tab-pane">
          {renderTab()}
        </div>
        <footer className="footer">
          <div className="fl">
            Tax Filing UAT · INDmoney Web · Figma <code>za8e35wfWeVkUTqZ8TyJHz</code> · 2026-06-19
          </div>
          <div className="fr">
            <span className="mono">8 SECTIONS · 172 GAPS · 11C · 68H · 73M · 20L</span>
          </div>
        </footer>
      </main>

      {isAdmin && <EditBar dirty={dirty} onSave={handleSave} onCancel={handleCancel} />}
      {isAdmin && (
        <UndoToast
          message={undoMessage}
          visible={undoVisible}
          onUndo={handleUndo}
          onDismiss={() => setUndoVisible(false)}
        />
      )}
      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
      {showPasswordModal && (
        <PasswordModal
          onSubmit={handlePasswordSubmit}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </>
  )
}

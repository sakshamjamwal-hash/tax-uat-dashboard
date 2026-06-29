import { useState, useCallback, useRef, useEffect } from 'react'
import { TABS } from './data/gaps.js'
import Reveal from './components/Reveal.jsx'

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

const LOCAL_KEY = 'uat-state'

function loadLocal() {
  try {
    const s = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')
    return { edits: s.edits || {}, deletedRows: s.deletedRows || {}, addedRows: s.addedRows || {} }
  } catch {
    return { edits: {}, deletedRows: {}, addedRows: {} }
  }
}

function saveLocal(state) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(state)) } catch {}
}

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    try { return sessionStorage.getItem('uat-tab') || 'overview' }
    catch { return 'overview' }
  })

  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('uat-admin') === '1')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const adminPwRef = useRef(null)
  const pendingSaveRef = useRef(false)

  const initial = loadLocal()
  const [edits, setEdits] = useState(initial.edits)
  const [deletedRows, setDeletedRows] = useState(initial.deletedRows)
  const [addedRows, setAddedRows] = useState(initial.addedRows)
  const [dirty, setDirty] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved | error
  const [saveError, setSaveError] = useState('')

  // Undo toast state
  const [undoVisible, setUndoVisible] = useState(false)
  const [undoMessage, setUndoMessage] = useState('')
  const undoFnRef = useRef(null)

  // Lightbox state
  const [lightbox, setLightbox] = useState(null)

  // ── Load the shared store on mount (source of truth for everyone) ──
  useEffect(() => {
    let cancelled = false
    fetch('/api/edits')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (cancelled || !data) return
        // Don't clobber unsaved local admin edits mid-session
        if (dirty) return
        const next = {
          edits: data.edits || {},
          deletedRows: data.deletedRows || {},
          addedRows: data.addedRows || {},
        }
        setEdits(next.edits)
        setDeletedRows(next.deletedRows)
        setAddedRows(next.addedRows)
        saveLocal(next)
      })
      .catch(() => { /* local dev / offline: keep localStorage copy */ })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep a local draft cache in sync
  function persistLocal(nextEdits, nextDeleted, nextAdded) {
    saveLocal({
      edits: nextEdits ?? edits,
      deletedRows: nextDeleted ?? deletedRows,
      addedRows: nextAdded ?? addedRows,
    })
  }

  function handleAdminToggle() {
    if (isAdmin) {
      localStorage.removeItem('uat-admin')
      adminPwRef.current = null
      setIsAdmin(false)
    } else {
      setShowPasswordModal(true)
    }
  }

  function handlePasswordSubmit(pw) {
    if (pw === 'pabothegreat') {
      localStorage.setItem('uat-admin', '1')
      adminPwRef.current = pw
      setIsAdmin(true)
      setShowPasswordModal(false)
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false
        // run the deferred save now that we have the password
        setTimeout(() => doSave(pw), 0)
      }
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
    requestAnimationFrame(() => setUndoVisible(true))
  }

  const handleEdit = useCallback((key, value) => {
    setEdits(prev => {
      const next = { ...prev, [key]: value }
      persistLocal(next)
      return next
    })
    setDirty(true)
    setSaveStatus('idle')
    showUndo('Edit undone', () => {
      setEdits(prev => {
        const next = { ...prev }
        delete next[key]
        persistLocal(next)
        return next
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edits, deletedRows, addedRows])

  const handleDelete = useCallback((rowKey, isNew) => {
    if (isNew) {
      // rowKey here is `${tableKey}:${rowId}` — strip to find which table/row
      setAddedRows(prev => {
        const next = {}
        for (const [tk, rows] of Object.entries(prev)) {
          next[tk] = rows.filter(r => `${tk}:${r.id}` !== rowKey)
        }
        persistLocal(undefined, undefined, next)
        return next
      })
      setDirty(true)
      setSaveStatus('idle')
      return
    }
    setDeletedRows(prev => {
      const next = { ...prev, [rowKey]: true }
      persistLocal(undefined, next)
      return next
    })
    setDirty(true)
    setSaveStatus('idle')
    showUndo('Row deleted', () => {
      setDeletedRows(prev => {
        const next = { ...prev }
        delete next[rowKey]
        persistLocal(undefined, next)
        return next
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edits, deletedRows, addedRows])

  const handleAddRow = useCallback((tableKey, colCount) => {
    const id = `new-${Date.now()}-${Math.round(performance.now())}`
    setAddedRows(prev => {
      const rows = prev[tableKey] || []
      const next = { ...prev, [tableKey]: [...rows, { id, cells: Array(colCount).fill(''), fix: '' }] }
      persistLocal(undefined, undefined, next)
      return next
    })
    setDirty(true)
    setSaveStatus('idle')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edits, deletedRows, addedRows])

  async function doSave(pwOverride) {
    const password = pwOverride || adminPwRef.current
    if (!password) {
      // No password in memory (e.g. after a reload) — ask for it, then save
      pendingSaveRef.current = true
      setShowPasswordModal(true)
      return
    }
    setSaveStatus('saving')
    setSaveError('')
    try {
      const res = await fetch('/api/edits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, edits, deletedRows, addedRows }),
      })
      if (res.status === 401) throw new Error('Wrong password — re-enter admin')
      if (!res.ok) throw new Error('Save failed (' + res.status + ')')
      setDirty(false)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch (e) {
      setSaveStatus('error')
      setSaveError(e.message || 'Save failed')
    }
  }

  function handleSave() { doSave() }

  function handleCancel() {
    if (!dirty || confirm('Discard unsaved changes?')) {
      // Re-pull the shared store
      fetch('/api/edits')
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
          const next = {
            edits: (data && data.edits) || {},
            deletedRows: (data && data.deletedRows) || {},
            addedRows: (data && data.addedRows) || {},
          }
          setEdits(next.edits)
          setDeletedRows(next.deletedRows)
          setAddedRows(next.addedRows)
          saveLocal(next)
          setDirty(false)
          setSaveStatus('idle')
        })
        .catch(() => {
          setDirty(false)
          setSaveStatus('idle')
        })
    }
  }

  function handleUndo() {
    if (undoFnRef.current) {
      undoFnRef.current()
      undoFnRef.current = null
    }
    setUndoVisible(false)
  }

  const editState = edits

  const tabData = TABS.find(t => t.id === activeTab)

  function renderTab() {
    if (!tabData) return null
    const common = {
      tab: tabData,
      editState,
      deletedRows,
      addedRows,
      onEdit: handleEdit,
      onDelete: handleDelete,
      onAddRow: handleAddRow,
      isAdmin,
    }
    switch (tabData.id) {
      case 'overview':
        return <Overview {...common} />
      case 'nav':
        return <NavAudit {...common} onLightbox={(src, alt) => setLightbox({ src, alt })} />
      default:
        return <SceneTab {...common} onLightbox={(src, alt) => setLightbox({ src, alt })} />
    }
  }

  return (
    <>
      <TopStrip isAdmin={isAdmin} onAdminToggle={handleAdminToggle} />
      <main>
        <Hero />
        <StatCards />
        <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
        <Reveal key={activeTab} className="tab-pane" y={8} duration={0.32}>
          {renderTab()}
        </Reveal>
        <footer className="footer">
          <div className="fl">
            Tax Filing UAT · INDmoney Web · Figma <code>za8e35wfWeVkUTqZ8TyJHz</code> · 2026-06-19
          </div>
          <div className="fr">
            <span className="mono">8 SECTIONS · 172 GAPS · 11C · 68H · 73M · 20L</span>
          </div>
        </footer>
      </main>

      {isAdmin && (
        <EditBar
          dirty={dirty}
          status={saveStatus}
          error={saveError}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
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
          onClose={() => { pendingSaveRef.current = false; setShowPasswordModal(false) }}
        />
      )}
    </>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { useGeoAndConsent } from '../../lib/consent/useConsent'
import { useOnClickOutside } from '../../hooks/use-on-click-outside'
import { INTERNAL_LINKS } from '../../constants/internal-links'
import { needsPriorConsent } from '../../lib/consent/regions'

const styles = {
  banner: 'banner',
  card: 'card',
  content: 'content',
  text: 'text',
  link: 'link',
  actions: 'actions',
  btn: 'btn',
  btnPrimary: 'btnPrimary',
  backdrop: 'backdrop',
  modal: 'modal',
  modalInner: 'modalInner',
  modalHeader: 'modalHeader',
  closeIcon: 'closeIcon',
  toggleRow: 'toggleRow',
  switch: 'switch',
  on: 'on',
  knob: 'knob',
} as const;

const POLICY_URL = INTERNAL_LINKS.PRIVACY_POLICY.url

const COOKIE_COPY = `We use cookies to run our store (essential), understand traffic (analytics), and improve marketing.`

export default function CookieBanner() {
  const { country, consent, saveConsent } = useGeoAndConsent()
  // Initialize to false to match server render, update after hydration in useEffect
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const focusTrapRef = useRef<HTMLDivElement | null>(null)
  const modalShellRef = useRef<HTMLDivElement | null>(null)

  // Check localStorage after hydration
  useEffect(() => {
    try {
      const hasConsent = window.localStorage.getItem('consent:v1')
      setOpen(!hasConsent)
    } catch {
      setOpen(true)
    }
  }, [])

  const model = useMemo(() => (needsPriorConsent(country) ? 'PRIOR' : 'NOTICE'), [country])

  // Keep state in sync if another tab updates consent
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'consent:v1') {
        setOpen(!e.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Allow external reopen via footer link
  useEffect(() => {
    function onManage() {
      setModalOpen(true)
      setOpen(true)
    }
    window.addEventListener('consent:manage', onManage as EventListener)
    return () => window.removeEventListener('consent:manage', onManage as EventListener)
  }, [])

  // Focus trap inside modal
  useEffect(() => {
    if (!modalOpen) return
    const root = focusTrapRef.current
    if (!root) return
    const focusable = root.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setModalOpen(false)
      if (e.key === 'Tab') {
        if (document.activeElement === last && !e.shiftKey) { e.preventDefault(); first?.focus() }
        if (document.activeElement === first && e.shiftKey) { e.preventDefault(); last?.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modalOpen])

  // Close modal on outside click
  useOnClickOutside(modalShellRef, setModalOpen)

  function acceptAll() {
    setOpen(false)
    setModalOpen(false)
    saveConsent({ analytics: true, marketing: true })
  }

  function rejectAll() {
    setOpen(false)
    setModalOpen(false)
    saveConsent({ analytics: false, marketing: false })
  }

  function openSettings() {
    setAnalytics(!!consent?.analytics)
    setMarketing(!!consent?.marketing)
    setModalOpen(true)
  }

  function saveSettings() {
    saveConsent({ analytics, marketing })
    setOpen(false)
    setModalOpen(false)
  }

  if (!open || !needsPriorConsent(country)) return null

  return (
    <>
      <div className={styles.banner} role="region" aria-label="Cookie consent">
        <div className={`${styles.card} ${styles.content}`}>
          <div className={styles.text}>
            {COOKIE_COPY} <a className={styles.link} href="#" onClick={(e) => { e.preventDefault(); openSettings(); }}>Cookie Settings</a>
          </div>
          <div className={styles.actions}>
            <button className={styles.btn} onClick={rejectAll}>Reject non-essential cookies</button>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={acceptAll}>Accept all</button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setModalOpen(false)} />
          <div className={styles.modal} role="dialog" aria-modal="true" ref={modalShellRef}>
            <div className={styles.modalInner} ref={focusTrapRef}>
              <div className={styles.modalHeader}>
                <h3>Cookie Settings</h3>
                <button className={styles.closeIcon} onClick={() => setModalOpen(false)} aria-label="Close">✕</button>
              </div>
              <p style={{ marginTop: 0, marginBottom: 10, fontSize: 13 }}>
                Learn more in our <a className={styles.link} href={POLICY_URL} target="_blank" rel="noreferrer">Privacy Policy</a>.
              </p>
              <div className={styles.toggleRow}>
                <div>Analytics</div>
                <div className={`${styles.switch} ${analytics ? styles.on : ''}`} onClick={() => setAnalytics(!analytics)} aria-checked={analytics} role="switch" tabIndex={0}>
                  <div className={styles.knob} />
                </div>
              </div>
              <div className={styles.toggleRow}>
                <div>Marketing</div>
                <div className={`${styles.switch} ${marketing ? styles.on : ''}`} onClick={() => setMarketing(!marketing)} aria-checked={marketing} role="switch" tabIndex={0}>
                  <div className={styles.knob} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button className={styles.btn} onClick={() => setModalOpen(false)}>Cancel</button>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveSettings}>Save Preferences</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}


import { useCallback, useEffect, useMemo, useState } from 'react'
import { needsPriorConsent } from './regions'

export type Consent = {
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: 1;
  regionModel: 'PRIOR' | 'NOTICE';
  country?: string;
}

const STORAGE_KEY = 'consent:v2'

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : undefined
}

function getStoredConsent(): Consent | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as Consent
    if (parsed && parsed.version === 1) return parsed
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to read stored consent', error)
    }
  }
  return undefined
}

export function useGeoAndConsent() {
  const [country, setCountry] = useState<string | undefined>(undefined)
  const [consent, setConsent] = useState<Consent | undefined>(undefined)

  useEffect(() => {
    const cc = readCookie('country') || undefined
    setCountry(cc)
    const stored = getStoredConsent()

    // Determine region model
    const isNoticeRegion = !needsPriorConsent(cc)

    if (stored) {
      setConsent(stored)
      // Ensure Consent Mode mirrors storage on load
      if (typeof window !== 'undefined' && (window as any).gtag) {
        const analyticsStorage = stored.analytics ? 'granted' : 'denied'
        const adValue = stored.marketing ? 'granted' : 'denied'
          ; (window as any).gtag('consent', 'update', {
            analytics_storage: analyticsStorage,
            ad_storage: adValue,
            ad_user_data: adValue,
            ad_personalization: adValue,
          })
      }
    } else if (isNoticeRegion) {
      // For NOTICE regions (like US), auto-consent to analytics and marketing
      const autoConsent: Consent = {
        analytics: true,
        marketing: true,
        timestamp: Date.now(),
        version: 1,
        regionModel: 'NOTICE',
        country: cc,
      }
      setConsent(autoConsent)
      // Store it for future visits
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(autoConsent))
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Failed to persist auto consent', error)
        }
      }
      // Update Consent Mode
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ; (window as any).gtag('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        })
      }
    }
  }, [])

  const regionModel = useMemo<'PRIOR' | 'NOTICE'>(() => {
    return needsPriorConsent(country) ? 'PRIOR' : 'NOTICE'
  }, [country])

  const saveConsent = useCallback((next: Pick<Consent, 'analytics' | 'marketing'>) => {
    const record: Consent = {
      analytics: !!next.analytics,
      marketing: !!next.marketing,
      timestamp: Date.now(),
      version: 1,
      regionModel,
      country,
    }
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to persist consent', error)
      }
    }
    setConsent(record)

    // Google Consent Mode v2 update
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        const analyticsStorage = record.analytics ? 'granted' : 'denied'
        const adValue = record.marketing ? 'granted' : 'denied'
          ; (window as any).gtag('consent', 'update', {
            analytics_storage: analyticsStorage,
            ad_storage: adValue,
            ad_user_data: adValue,
            ad_personalization: adValue,
          })
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Consent mode update failed', error)
      }
    }

    // Broadcast update
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('consent:updated', { detail: record }))
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Consent dispatch failed', error)
      }
    }
  }, [country, regionModel])

  return { country, consent, saveConsent, regionModel }
}


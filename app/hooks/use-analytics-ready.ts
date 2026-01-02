/**
 * This hook is no longer needed as Hydrogen's Analytics.Provider
 * handles consent and readiness checks automatically.
 * The publish() function from useAnalytics() will only send events
 * when consent has been granted via the Customer Privacy API.
 *
 * Keeping this file for backward compatibility but always returns true.
 */
export function useAnalyticsReady() {
    return true;
}

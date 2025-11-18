export const PRIOR_CONSENT_COUNTRIES = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
  'IS','LI','NO',
  'GB', // United Kingdom
]);

export function needsPriorConsent(cc?: string): boolean {
  if (!cc) return false;
  const ccUpper = cc.toUpperCase();
  return PRIOR_CONSENT_COUNTRIES.has(ccUpper);
}



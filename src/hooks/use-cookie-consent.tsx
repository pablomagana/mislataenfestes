import { useState, useEffect } from 'react';

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const DEFAULT_CONSENT: CookieConsent = {
  necessary: true, // Always true, necessary cookies
  analytics: false,
  marketing: false,
};

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent);
        setConsent(parsed);
        setShowBanner(false);
      } catch {
        // If parsing fails, show banner
        setShowBanner(true);
      }
    } else {
      // No consent saved, show banner
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const fullConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setConsent(fullConsent);
    localStorage.setItem('cookie-consent', JSON.stringify(fullConsent));
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    setConsent(DEFAULT_CONSENT);
    localStorage.setItem('cookie-consent', JSON.stringify(DEFAULT_CONSENT));
    setShowBanner(false);
  };

  const setCustomConsent = (customConsent: CookieConsent) => {
    const finalConsent = { ...customConsent, necessary: true }; // Always keep necessary as true
    setConsent(finalConsent);
    localStorage.setItem('cookie-consent', JSON.stringify(finalConsent));
    setShowBanner(false);
  };

  const resetConsent = () => {
    setConsent(null);
    localStorage.removeItem('cookie-consent');
    setShowBanner(true);
  };

  return {
    consent,
    showBanner,
    acceptAll,
    acceptNecessary,
    setCustomConsent,
    resetConsent,
  };
};
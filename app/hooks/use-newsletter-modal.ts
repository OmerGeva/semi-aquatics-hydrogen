import { useState, useEffect } from 'react';

const STORAGE_KEY = 'newsletter_popup:v1';
const DAYS_TO_HIDE = 2;

interface NewsletterModalState {
  dismissed?: number; // timestamp when user closed modal
  subscribed?: boolean; // true if user successfully subscribed
}

export const useNewsletterModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const storedData = localStorage.getItem(STORAGE_KEY);

    if (!storedData) {
      // No data stored, show modal after a short delay
      const timer = setTimeout(() => {
        // setIsOpen(true);
      }, 2000); // 2 second delay for better UX

      return () => clearTimeout(timer);
    }

    try {
      const data = JSON.parse(storedData) as NewsletterModalState;

      // If user has subscribed, never show again
      if (data.subscribed) {
        return;
      }

      // If user dismissed, check if 2 days have passed
      if (data.dismissed) {
        const now = Date.now();
        const daysPassed = (now - data.dismissed) / (1000 * 60 * 60 * 24);

        if (daysPassed >= DAYS_TO_HIDE) {
          // 2 days have passed, show modal again
          const timer = setTimeout(() => {
            // setIsOpen(true);
          }, 2000);

          return () => clearTimeout(timer);
        }
      }
    } catch (error) {
      console.error('Error parsing newsletter modal data:', error);
      // If there's an error parsing, show the modal
      const timer = setTimeout(() => {
        // setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);

    // Save dismissal timestamp to localStorage
    const data: NewsletterModalState = {
      dismissed: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const handleSuccess = () => {
    setIsOpen(false);

    // Mark as subscribed so we never show again
    const data: NewsletterModalState = {
      subscribed: true
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  return {
    isOpen,
    handleClose,
    handleSuccess
  };
};

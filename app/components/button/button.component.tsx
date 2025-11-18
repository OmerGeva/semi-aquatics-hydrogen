import { useState, useEffect } from 'react';
import styles from './Button.module.scss';

type ButtonState = 'idle' | 'clicked' | 'adding' | 'added';

interface ButtonProps {
  soldOut: boolean;
  isSelected: boolean;
  children: React.ReactNode;
  selected: any;
  mobile: boolean;
  onClick: (selected: any) => Promise<void>;
  color?: 'white' | 'black';
  additionalText?: React.ReactNode;
  isLoading?: boolean;
  isSuccess?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  soldOut,
  isSelected,
  onClick,
  selected,
  mobile,
  color = 'black',
  additionalText,
  isLoading = false,
  isSuccess = false,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [state, setState] = useState<'idle' | 'clicked' | 'adding' | 'added'>('idle');

  // Handle state transitions
  useEffect(() => {
    if (isLoading && state === 'idle') {
      // Start loading sequence
      setState('clicked');
      const loadingTimer = setTimeout(() => setState('adding'), 100);

      // If we get success before the loading state completes, skip to success
      const successTimer = setTimeout(() => {
        if (isSuccess) {
          setState('added');
          const resetTimer = setTimeout(() => setState('idle'), 2000);
          return () => clearTimeout(resetTimer);
        }
      }, 600); // Slightly longer than the loading delay to ensure smooth transition

      return () => {
        clearTimeout(loadingTimer);
        clearTimeout(successTimer);
      };
    } else if (isSuccess && (state === 'adding' || state === 'clicked')) {
      // If we get success while in loading states
      setState('added');
      const timer = setTimeout(() => setState('idle'), 2000);
      return () => clearTimeout(timer);
    } else if (!isLoading && !isSuccess) {
      // Reset to idle if neither loading nor success
      setState('idle');
    }
  }, [isLoading, isSuccess]);

  const buttonContent = {
    idle: children,
    clicked: children,
    adding: 'Adding...',
    added: 'Added to bag',
  };

  const containerClass = `${mobile ? styles.mobileButtonContainer : styles.buttonContainer} ${
    soldOut || !isSelected ? (mobile ? styles.mobileSoldOutButton : styles.soldOut) : ''
  } ${styles[color]} ${additionalText ? styles.flex : ''} ${styles[state]}`;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (soldOut || !isSelected || isAnimating) return;
    setIsAnimating(true);
    try {
      await onClick(selected);
    } finally {
      setIsAnimating(false);
    }
  };

  return (
    <div
      className={containerClass}
      onClick={(event) => {
        void handleClick(event);
      }}
      aria-disabled={soldOut || !isSelected || isAnimating}
    >
      <div className={styles.buttonContent}>
        <span className={styles.buttonText} data-state={state}>
          {buttonContent[state]}
        </span>
      </div>
      {additionalText && (
        <span className={styles.additionalText}>
          {additionalText}
        </span>
      )}
    </div>
  );
};

export default Button;

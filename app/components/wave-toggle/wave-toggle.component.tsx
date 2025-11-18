import React from 'react';
import { useWaveSounds } from '../../contexts/wave-sounds-context';
import styles from './WaveToggle.module.scss';

interface WaveToggleProps {
  className?: string;
}

const WaveToggle: React.FC<WaveToggleProps> = ({ className }) => {
  const { isPlaying, toggleWaveSounds } = useWaveSounds();

  return (
    <button
      className={`${styles.waveToggle} ${isPlaying ? styles.active : ''} ${className || ''}`}
      onClick={toggleWaveSounds}
      aria-label={isPlaying ? 'Stop wave sounds' : 'Play wave sounds'}
    >
      <div className={styles.waveIcon}>
        <div className={`${styles.wave} ${styles.wave1}`}></div>
        <div className={`${styles.wave} ${styles.wave2}`}></div>
        <div className={`${styles.wave} ${styles.wave3}`}></div>
      </div>
      <span className={styles.label}>{isPlaying ? 'waves' : 'waves'}</span>
    </button>
  );
};

export default WaveToggle;
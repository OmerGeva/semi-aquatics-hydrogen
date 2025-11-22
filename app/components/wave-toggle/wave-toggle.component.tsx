import React from 'react';
import { useWaveSounds } from '../../contexts/wave-sounds-context';

const styles = {
  waveToggle: 'waveToggle',
  active: 'active',
  waveIcon: 'waveIcon',
  wave: 'wave',
  wave1: 'wave1',
  wave2: 'wave2',
  wave3: 'wave3',
  label: 'label',
} as const;

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

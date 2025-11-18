import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface WaveSoundsContextType {
  isPlaying: boolean;
  toggleWaveSounds: () => void;
}

const WaveSoundsContext = createContext<WaveSoundsContextType | undefined>(undefined);

export const useWaveSounds = () => {
  const context = useContext(WaveSoundsContext);
  if (context === undefined) {
    throw new Error('useWaveSounds must be used within a WaveSoundsProvider');
  }
  return context;
};

export const WaveSoundsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element with a wave sound URL
    // Replace this with your own wave sound file URL or path
    // For example: '/wave-sounds.mp3' if you place the file in the public folder
    const audio = new Audio('/wave-sounds.mp3'); // You'll need to add this file to your public folder
    audio.loop = true;
    audio.volume = 0.3; // Set a comfortable volume
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleWaveSounds = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error('Error playing wave sounds:', error);
        });
    } else {
      setIsPlaying(true);
    }
  };

  return (
    <WaveSoundsContext.Provider value={{ isPlaying, toggleWaveSounds }}>
      {children}
    </WaveSoundsContext.Provider>
  );
};

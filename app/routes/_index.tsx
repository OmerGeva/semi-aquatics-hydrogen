import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router';
import styles from '~/styles/Home.module.scss';
import {useIsMobile} from '~/hooks/use-is-mobile';

export default function IndexRoute() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      document.title = 'Semi Aquatics';
    }
  }, []);

  const videoSrc = useMemo(() => {
    if (!mounted) return '';
    return isMobile ? '/video-mobile.mp4' : '/video-home.mp4';
  }, [mounted, isMobile]);

  const handleClick = () => {
    void navigate('/shop');
  };

  return (
    <div className={styles.homeContainer} onClick={handleClick}>
      <div className={styles.videoContainer}>
        {mounted && (
          <video
            autoPlay
            muted
            playsInline
            loop
            className={styles.mainVideo}
            key={isMobile ? 'mobile' : 'desktop'}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
      </div>
    </div>
  );
}

import styles from './Sidebar.module.scss';

// Packages
import { GrClose } from 'react-icons/gr';
import { FaInstagram } from 'react-icons/fa';
import { Dispatch, SetStateAction } from 'react';
import { Link } from 'react-router';
import { useRef } from 'react';

// Hooks
import { useOnClickOutside } from '../../hooks/use-on-click-outside';
import EmailForm from '../email-form/email-form.component';
import WaveToggle from '../wave-toggle/wave-toggle.component';
import { HELP_EMAIL_LINK, INSTAGRAM_LINK } from '../../constants/external-links';
import { links } from './constants';
import { INTERNAL_LINKS } from '../../constants/internal-links';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const ref = useRef<HTMLDivElement>(null);

  const closeSidebar = () => setSidebarOpen(false);
  useOnClickOutside(ref, closeSidebar);

  return (
    <div
      className={`${styles.sidebarContainer} ${!sidebarOpen ? styles.sidebarContainerClosed : ''}`}
      data-lenis-prevent
      ref={ref}
      style={{
        // Ensure sidebar is hidden during SSR/initial render before CSS classes apply
        transform: !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
      }}
    >
      <button className={styles.closeMenuToggle} onClick={closeSidebar}>
        <GrClose />
      </button>
      <div className={styles.sidebarWrapper}>
        <div className={styles.innerContainer}>
          {links.map(({ href, label }) => (
            <Link to={href} key={href}>
              <p onClick={closeSidebar} className={styles.dropLink}>
                {label}
                {/* {isNew && <span className={styles.newDrop}>new!</span>} */}
              </p>
            </Link>
          ))}
          <span className={styles.flexGrow}></span>
          <div className={styles.bottomNavbar}>
            <div className={styles.emailFormContainer}>
              <EmailForm isSidebar />
            </div>
            <div className={styles.flexer}>
              <a target="_blank" href={INSTAGRAM_LINK} rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href={HELP_EMAIL_LINK} className={styles.footerEmail}>
                info@semiaquatics.com
              </a>
            </div>
            <Link to={INTERNAL_LINKS.PRIVACY_POLICY.url}>
              <p>{INTERNAL_LINKS.PRIVACY_POLICY.text}</p>
            </Link>
            <p className="footer-item">© {new Date().getFullYear()} Semi Aquatics</p>
            <div className={styles.waveToggleContainer}>
              <WaveToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

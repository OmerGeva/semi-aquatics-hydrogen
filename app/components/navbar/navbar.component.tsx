import { Link } from 'react-router';
import { useLocation } from 'react-router';
import {useCart} from '@shopify/hydrogen-react';
import styles from './Navbar.module.scss';
import { VscMenu } from 'react-icons/vsc';
import { useIsMobile } from '../../hooks/use-is-mobile';
import { IoBagSharp } from 'react-icons/io5';
import React, { useState } from 'react';
import NewsletterModal from '../newsletter-modal/newsletter-modal.component';
import WaveToggle from '../wave-toggle/wave-toggle.component';
import { useNewsletterModal } from '../../hooks/use-newsletter-modal';
import {useCartDrawer} from '../../contexts/cart-drawer-context';

interface NavbarProps {
  title?: string;
  setNavbarOpen?: (open: boolean) => void;
  navbarOpen?: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ title, setNavbarOpen, navbarOpen, setSidebarOpen }) => {
    const location = useLocation();
    const {openCart} = useCartDrawer();
    const {totalQuantity} = useCart();
    const cartItemCount = totalQuantity ?? 0;
    const isMobile = useIsMobile();
    const { isOpen: isNewsletterModalOpen, handleClose, handleSuccess } = useNewsletterModal();
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    return (
    <>
      {/* {isMobile && (
        <div className={`${styles.announcementBanner} ${location.pathname === '/' ? styles.homepageBanner : ''}`}>
            <div className={styles.scrollingText} onClick={() => setIsManualModalOpen(true)}>
              THE FALL COLLECTION: "NEXT FORM" IS AVAILABLE NOW. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        </div>
      )} */}
      <div className={styles.navbarContainer}>
        {isMobile ? (
          <div className={styles.navLink} onClick={() => setSidebarOpen(true)}>
            Menu
          </div>
        ) : (
          <div className={styles.navLinksPill}>
          <Link to="/shop" className={`${styles.navLink} ${isActive('/shop') ? styles.active : ''}`}>
            Shop
          </Link>
          <Link to="/story" className={`${styles.navLink} ${isActive('/story') ? styles.active : ''}`}>
            Story
          </Link>
          <Link to="/artists" className={`${styles.navLink} ${isActive('/artists') ? styles.active : ''}`}>
            Artists
          </Link>
        </div>
        )}

        <Link to="/" className={styles.logoLink}>
          <img
            src={'/top-nav-logo.png'}
            alt="Top Logo"
            className={styles.topLogo}
          />
        </Link>

        <div className={styles.rightContainer}>
          {isMobile ? null : (
            <>
              <WaveToggle className={styles.waveToggleDesktop} />
              <div className={styles.signUpNewsletter} onClick={() => setIsManualModalOpen(true)}>
                <div className={styles.scrollingText}>
                    THE FALL COLLECTION: "NEXT FORM" IS AVAILABLE NOW. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;THE FALL COLLECTION: "NEXT FORM" IS AVAILABLE NOW. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </div>
              </div>
            </>
          )}
        <div className={styles.bagContainer} onClick={openCart}>
          {isMobile ? (
              <div className={styles.mobileCartWrapper}>
                <IoBagSharp />
                {cartItemCount > 0 && <span className={styles.mobileBadge}>{cartItemCount}</span>}
              </div>
          ) : (
          <>Bag<span className={styles.cartCount}>{cartItemCount}</span></>
          )}
        </div>
        </div>
      </div>
      <NewsletterModal
        isOpen={isNewsletterModalOpen || isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          handleClose();
        }}
        onSuccess={handleSuccess}
      />
    </>
  );
}

export default Navbar;

import React, { useState } from 'react';
import { Link } from 'react-router';
import { FiPlus, FiMinus } from 'react-icons/fi';

import EmailForm from '../email-form/email-form.component';
import NewsletterModal from '../newsletter-modal/newsletter-modal.component';

import { INTERNAL_LINKS } from '../../constants/internal-links';
import { INSTAGRAM_LINK } from '../../constants/external-links';
import { useIsMobile } from '../../hooks/use-is-mobile';
import { useNewsletterModal } from '../../hooks/use-newsletter-modal';

const styles = {
  footerContainer: 'footerContainer',
  footerTable: 'footerTable',
  footerColumn: 'footerColumn',
  columnHeader: 'columnHeader',
  columnContent: 'columnContent',
  logo: 'logo',
  linksList: 'linksList',
  divider: 'divider',
  emailLink: 'emailLink',
  bottomSection: 'bottomSection',
  countrySelector: 'countrySelector',
  copyright: 'copyright',
  shopPowered: 'shopPowered',
  newsletterRegisterButton: 'newsletterRegisterButton',
  mobileSection: 'mobileSection',
  mobileSectionHeader: 'mobileSectionHeader',
  mobileSectionContent: 'mobileSectionContent',
  expanded: 'expanded',
  mobileSectionContentAlways: 'mobileSectionContentAlways',
  brandTitle: 'brandTitle',
  mobileLogo: 'mobileLogo',
  mobileLinksList: 'mobileLinksList',
  mobileBottomSection: 'mobileBottomSection',
  mobileBottomContent: 'mobileBottomContent',
} as const;

const Footer: React.FC = () => {
  const isMobile = useIsMobile();
  const { handleSuccess } = useNewsletterModal();
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    socials: false,
    service: false,
    legal: false
  });
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
  const openNewsletterModal = () => setIsNewsletterModalOpen(true);
  const closeNewsletterModal = () => setIsNewsletterModalOpen(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newState = {
        ...prev,
        [section]: !prev[section]
      };
      return newState;
    });
  };

  if (isMobile) {
    return (
      <footer className={styles.footerContainer}>

        {/* Newsletter Section */}
        <div className={styles.mobileSection}>
          <div className={styles.mobileSectionHeader}>
            <h3>Newsletter</h3>
            <div className={styles.newsletterRegisterButton} onClick={openNewsletterModal}>
              Sign Up
            </div>
          </div>
          <div className={styles.mobileSectionContentAlways}>
            <p>Sign up for our newsletter to receive updates on new releases, restocks and more.</p>
          </div>
        </div>

        {/* Customer Service Section */}
        <div className={styles.mobileSection}>
          <div className={styles.mobileSectionHeader}>
            <h3>Customer Service</h3>
          </div>
          <div className={styles.mobileSectionContentAlways}>
            <p>For questions about orders, you can email <span className={styles.emailLink}>info@semiaquatics.com</span>.</p>
          </div>
        </div>

        {/* Socials Section - Collapsible */}
        <div className={styles.mobileSection}>
          <div 
            className={styles.mobileSectionHeader}
            onClick={() => toggleSection('socials')}
          >
            <h3>Socials</h3>
            <FiPlus style={{ 
              transform: expandedSections.socials ? 'rotate(45deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }} />
          </div>
          <div className={`${styles.mobileSectionContent} ${expandedSections.socials ? styles.expanded : ''}`}>
            <ul className={styles.mobileLinksList}>
              <li><a href={INSTAGRAM_LINK}>Instagram</a></li>
            </ul>
          </div>
        </div>

        {/* Service Section - Collapsible */}
        <div className={styles.mobileSection}>
          <div 
            className={styles.mobileSectionHeader}
            onClick={() => toggleSection('service')}
          >
            <h3>Service</h3>
            <FiPlus style={{ 
              transform: expandedSections.service ? 'rotate(45deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }} />
          </div>
          <div className={`${styles.mobileSectionContent} ${expandedSections.service ? styles.expanded : ''}`}>
            <ul className={styles.mobileLinksList}>
              <li><Link to={INTERNAL_LINKS.FAQ.url}>FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Legal Section - Collapsible */}
        <div className={styles.mobileSection}>
          <div 
            className={styles.mobileSectionHeader}
            onClick={() => toggleSection('legal')}
          >
            <h3>Legal</h3>
            <FiPlus style={{ 
              transform: expandedSections.legal ? 'rotate(45deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }} />
          </div>
          <div className={`${styles.mobileSectionContent} ${expandedSections.legal ? styles.expanded : ''}`}>
            <ul className={styles.mobileLinksList}>
              <li><Link to={INTERNAL_LINKS.TERMS.url}>Terms & Conditions</Link></li>
              <li><Link to={INTERNAL_LINKS.PRIVACY_POLICY.url}>Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.mobileBottomSection}>
          <div className={styles.mobileBottomContent}>
            <div className={styles.countrySelector}>USA / USD $</div>
            <div className={styles.copyright}>© {new Date().getFullYear()} Semi Aquatics All rights reserved</div>
          </div>
        </div>
        <NewsletterModal
          isOpen={isNewsletterModalOpen}
          onClose={closeNewsletterModal}
          onSuccess={handleSuccess}
        />
      </footer>
    );
  }

  // Desktop layout (unchanged)
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerTable}>
        
        <div className={styles.footerColumn}>
          <div className={styles.columnHeader}>Semi Aquatics</div>
          <div className={styles.columnContent}>
            <img
              src="https://cdn.shopify.com/s/files/1/0276/3305/7867/files/big3_1410x.png?v=1575617303"
              alt="Main Logo"
              className={styles.logo}
            />
          </div>
        </div>

        <div className={styles.footerColumn}>
          <div className={styles.columnHeader}>Newsletter</div>
          <div className={styles.columnContent}>
            <p>Sign up for our newsletter to receive updates on new releases, restocks and more.</p>
            <EmailForm />
          </div>
        </div>

        <div className={styles.footerColumn}>
          <div className={styles.columnHeader}>Customer Service</div>
          <div className={styles.columnContent}>
            <p>For questions about orders, you can email <span className={styles.emailLink}>info@semiaquatics.com</span>.</p>
          </div>
        </div>

        <div className={styles.footerColumn}>
          <div className={styles.columnHeader}>Links</div>
          <div className={styles.columnContent}>
            <ul className={styles.linksList}>
              <li><a href={INSTAGRAM_LINK}>Instagram</a></li>
              <li className={styles.divider}></li>
              <li><Link to={INTERNAL_LINKS.TERMS.url}>Terms & Conditions</Link></li>
              <li><Link to={INTERNAL_LINKS.FAQ.url}>FAQ</Link></li>
              <li className={styles.divider}></li>
              <li><Link to={INTERNAL_LINKS.PRIVACY_POLICY.url}>Privacy Policy</Link></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); if (typeof window !== 'undefined') { window.dispatchEvent(new Event('consent:manage')) } }}>Manage Cookies</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.countrySelector}>USA / USD $</div>
        <div className={styles.copyright}>© {new Date().getFullYear()} Semi Aquatics All rights reserved</div>
        <div className={styles.shopPowered}></div>
      </div>
    </footer>
  );
};

export default Footer;

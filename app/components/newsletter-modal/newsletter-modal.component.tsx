import React from 'react';
import EmailForm from '../email-form/email-form.component';
import styles from './NewsletterModal.module.scss';
import { IoClose } from 'react-icons/io5';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const NewsletterModal: React.FC<NewsletterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <IoClose size={24} />
        </button>
        <h3 className={styles.modalTitle}>Become Part of the Tide</h3>
        <p className={styles.modalSubtitle}>early access, inside drops, and 15% off your first order.</p>
        <div className={styles.formOverrides}>
          <EmailForm
            isSidebar={false}
            placeholder="Enter your email"
            inputContainerClassName={styles.formOverrides} // This div already exists
            inputClassName={styles.modalInput}
            buttonClassName={styles.modalSubmitButton}
            messageContainerClassName={styles.modalMessageContainer}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default NewsletterModal;

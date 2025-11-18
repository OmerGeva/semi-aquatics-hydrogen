import { TABS } from "../../tab-content/constants";
import styles from "./DescriptionTabs.module.scss";
import { FaChevronUp } from 'react-icons/fa';

interface DescriptionTabsProps {
  activeTab: number;
  setActiveTab: (tabIndex: number) => void;
  children: React.ReactNode;
}

const DescriptionTabs: React.FC<DescriptionTabsProps> = ({
  activeTab,
  setActiveTab,
  children
}) => {
  return (
    <div className={styles.accordionContainer}>
      {TABS.map((tab, index) => {
        const isOpen = activeTab === tab.id;

        return (
          <div key={tab.id} className={styles.accordionItem}>
            <div
              className={styles.accordionHeader}
              onClick={() => setActiveTab(isOpen ? -1 : tab.id)} // Close if already open
              aria-expanded={isOpen}
              aria-controls={`section-${tab.id}`}
            >
              <span>{tab.label}</span>
              <FaChevronUp className={isOpen ? styles.open : ''} />
            </div>
            {isOpen && (
              <div id={`section-${tab.id}`} className={styles.accordionContent}>
                {children}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DescriptionTabs;

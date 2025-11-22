import { TABS } from "../../tab-content/constants";

const styles = {
  tabs: 'tabs',
  tab: 'tab',
  selected: 'selected',
  tabText: 'tabText',
  medium: 'medium',
  regular: 'regular',
  indicator: 'indicator',
} as const;

interface DescriptionTabsProps {
  activeTab: number;
  setActiveTab: (tabIndex: number) => void;
}

const DescriptionTabs: React.FC<DescriptionTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div
      className={styles.tabs}
      role="tablist"
      aria-label="Product Descriptions"
      style={{ "--active-tab": activeTab } as React.CSSProperties}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.selected : ""}`}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          id={`product-details-tab-${tab.id}`}
          aria-controls={`product-details-tabpanel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          onClick={() => setActiveTab(tab.id)}
        >
          <p className={`${styles.tabText} ${activeTab === tab.id ? styles.medium : styles.regular}`}>
            {tab.label}
          </p>
        </button>
      ))}
      <span className={styles.indicator} />
    </div>
  );
};

export default DescriptionTabs;

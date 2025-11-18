import styles from "./TabContent.module.scss";
import SizingChart from "../../sizing-chart/sizing-chart.component";
import ArtistPreview from "../artist-preview/artist-preview.component";
import { ProductT } from "../../../types";

interface TabContentProps {
  tabNumber: number;
  description: string;
  product: ProductT;
}

const TabContent: React.FC<TabContentProps> = ({ tabNumber, description, product }) => {
  const tabContents = {
    0: (
      <div className={styles.tabContent}>
        <div dangerouslySetInnerHTML={{ __html: description }} />
      </div>
    ),
    1: (
      <div className={styles.tabContent}>
        <SizingChart clothingType={product.node.productType as 'Organic Cotton Hoodies' | 'T-Shirts' | 'Organic Cotton Crews'} />
      </div>
    ),
    2: (
      <div className={styles.tabContent}>
        <h3>What’s the Return Policy?</h3>
        <p>We accept exchanges or store credit within 30 days of purchase. Items must be unworn, in original condition, with tags attached</p>
        <h3>How Long Does Shipping Take?</h3>
        <p>Orders typically ship within 1–2 business days. Transit time varies by destination.</p>
      </div>
    ),
    3: (
      <div className={styles.tabContent}>
        <ArtistPreview artworkId={product.node.id.split('/').splice(-1)[0]} />
      </div>
    ),
  };

  if (!(tabNumber in tabContents)) return null;

  // @ts-ignore
  return tabContents[tabNumber];
};

export default TabContent;

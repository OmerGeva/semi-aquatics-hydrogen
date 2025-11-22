import { Link } from 'react-router';
import { UpcomingDropPreviewProps } from '../../interfaces/page_interface';

const styles = {
  upcomingDropPreviewContainer: 'upcomingDropPreviewContainer',
  productsPreviewContainer: 'productsPreviewContainer',
  productPreviewImage: 'productPreviewImage',
  titleAndTimer: 'titleAndTimer',
} as const;

const UpcomingDropPreview: React.FC<UpcomingDropPreviewProps> = ({ timeLeftObj, products, dropTitle }) => (
  <div className={styles.upcomingDropPreviewContainer}>
    <div className={styles.productsPreviewContainer}>
      {/* {products.map((product: any) => (
        <Link href={`drop/${product.node.id}`}>
          <div key={product.node.id} className={styles.productPreviewImage}>
            <img src={product.node.images.edges[0].node.transformedSrc} alt={product.node.images.edges[0].node.transformedSrc} />
          </div>
        </Link>
      ))} */}

    </div>
    <div className={styles.titleAndTimer}>
      <h1>{dropTitle}</h1>
    </div>
  </div>
);

export default UpcomingDropPreview;

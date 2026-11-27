const styles = {
  compareAtPrice: 'compareAtPrice',
} as const;

interface CompareAtPriceProps {
  price?: string;
  compareAtPrice?: string | null;
}

// Struck-through old price, shown only when the compare-at price is above the price.
const CompareAtPrice: React.FC<CompareAtPriceProps> = ({ price, compareAtPrice }) => {
  if (!compareAtPrice || !(Number(compareAtPrice) > Number(price))) return null;

  return <s className={styles.compareAtPrice}>${compareAtPrice}0</s>;
};

export default CompareAtPrice;

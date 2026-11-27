// Black Friday 2026 announcement bar. To remove after the sale: delete this
// folder, its <SaleBanner /> line in layout.component.tsx and the
// "Sale banner" block in tailwind.css.
export const SALE_BANNER_TEXT = 'Black Friday. Up to 60% off everything. Ends Monday 11:59 pm ET.';

const styles = {
  saleBanner: 'saleBanner',
  saleBannerSpacer: 'saleBannerSpacer',
} as const;

const SaleBanner: React.FC = () => (
  <>
    <div className={styles.saleBanner}>
      <p>{SALE_BANNER_TEXT}</p>
    </div>
    <div className={styles.saleBannerSpacer} aria-hidden="true" />
  </>
);

export default SaleBanner;

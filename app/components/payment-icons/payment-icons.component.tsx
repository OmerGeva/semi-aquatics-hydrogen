import React from 'react';
import { useIsMobile } from '../../hooks/use-is-mobile';

const styles = {
  paymentIcons: 'paymentIcons',
  icon: 'icon',
} as const;

const PaymentIcons = () => {
  const isMobile = useIsMobile();

  return (
    <div className={styles.paymentIcons}>
      <img src={'/svgs/payment-icons/Visa.png'} alt="Visa" className={styles.icon} />
      <img src={'/svgs/payment-icons/Mastercard.png'} alt="MasterCard" className={styles.icon} />
      <img src={'/svgs/payment-icons/PayPal.png'} alt="PayPal" className={styles.icon} />
      <img src={'/svgs/payment-icons/ApplePay.png'} alt="ApplePay" className={styles.icon} />
      <img src={'/svgs/payment-icons/GooglePay.png'} alt="GooglePay" className={styles.icon} />
      <img src={'/svgs/payment-icons/Amex.png'} alt="Amex" className={styles.icon} />
      <img src={'/svgs/payment-icons/ShopPay.png'} alt="ShopifyPay" className={styles.icon} />
      {!isMobile && (
        <img src={'/svgs/payment-icons/Discover.png'} alt="Discover" className={styles.icon} />
      )}
    </div>
  );
};

export default PaymentIcons;

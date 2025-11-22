const styles = {
  privacyPolicyContainer: 'privacyPolicyContainer',
} as const;

const PrivacyPolicyPage: React.FC = () => (
  <div className={styles.privacyPolicyContainer}>
    <h1>Privacy Policy</h1>
    <p>Last Updated: September 23rd, 2025.</p>

    <p>
      At Semi Aquatics, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and manage your information when you visit our website or interact with our services. By using our website, you agree to the terms of this Privacy Policy.
    </p>

    <h2>1. General Information</h2>
    <p>
      Semi Aquatics is operated by Semi Aquatics, Massachusetts Sole proprietorship LLC. The business is registered in Lexington, MA, USA. Semi Aquatics is an e-commerce platform designed to offer high-quality, sleek, and minimal wardrobe staples in limited quantities. Our collections prioritize sustainability by reducing fashion-related waste.
    </p>

    <h2>2. Information We Collect</h2>
    <h3>Shopify-Handled Data:</h3>
    <p>
      Shopify processes all transactional data, including name, email, shipping address, and payment details. Semi Aquatics does not store this data directly. For more information, refer to <a href="https://www.shopify.com/legal/privacy" target="_blank" rel="noopener noreferrer">Shopify's Privacy Policy</a>.
    </p>
    <h3>Cart Identification:</h3>
    <p>
      A unique cart ID is stored in a browser cookie to manage and identify your shopping cart.
    </p>
    <h3>Subscription Data:</h3>
    <p>
      When users subscribe to updates, their email addresses and/or phone numbers are stored and managed via Klaviyo. For more information, refer to <a href="https://www.klaviyo.com/legal/privacy" target="_blank" rel="noopener noreferrer">Klaviyo Privacy Policy</a>.
    </p>
    <h3>Analytics and Marketing Data:</h3>
    <ul>
      <li>
        Google Analytics: Tracks website activity and performance. Learn more in their <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
      </li>
      <li>
        Facebook Pixel: Tracks website activity for advertising and retargeting purposes. Learn more in their <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
      </li>
      <li>
        ATTN.TV Script: Collects data for targeted advertising and tracking. Refer to <a href="https://www.attn.tv/privacy" target="_blank" rel="noopener noreferrer">ATTN.TV's Privacy Policy</a>.
      </li>
    </ul>

    <h2>3. How We Use Your Information</h2>
    <ul>
      <li>Order Fulfillment: Shopify processes orders, including payment and shipping details.</li>
      <li>Shopping Cart Management: A unique cart ID stored in cookies helps manage and identify your shopping cart.</li>
      <li>Email Email Marketing: SMS Marketing: Subscription data is used for sending updates and promotional material via Klaviyo.</li>
      <li>Website Analytics and Performance: Google Analytics tracks user interactions to improve the website experience and performance.</li>
      <li>Advertising and Targeting: Facebook Pixel and ATTN.TV script collect data for advertising and retargeting purposes.</li>
    </ul>

    <h2>4. Data Storage and Retention</h2>
    <h3>Data Storage Locations:</h3>
    <p>User data is stored and processed by third-party services:</p>
    <ul>
      <li>Shopify: Manages transactional data, stored on Shopify’s secure servers. For more details, see their <a href="https://www.shopify.com/legal/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
      <li>Klaviyo: Stores email/SMS subscription data on their secure servers as outlined in their <a href="https://www.klaviyo.com/legal/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
      <li>Google Analytics: Processes website activity data on Google's servers. For more information, see their <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
      <li>Facebook: Processes advertising and tracking data through Facebook Pixel on their servers. For more information, see their <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
      <li>ATTN.TV: Manages advertising and targeting data as specified in their <a href="https://www.attn.tv/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
    </ul>
    <h3>Data Retention:</h3>
    <ul>
      <li>Transaction Data: Retained by Shopify for as long as necessary to fulfill orders and comply with legal obligations (e.g., tax reporting).</li>
      <li>Shopping Cart Data: The unique cart ID stored in cookies until the user clears their cookies.</li>
      <li>Email Subscription Data: Retained by Klaviyo until the user unsubscribes or requests deletion.</li>
      <li>Analytics and Advertising Data: Retention periods are determined by Google Analytics, Facebook, and ATTN.TV. For details, consult their privacy policies.</li>
    </ul>

    <h2>5. Your Rights</h2>
    <ul>
      <li>
        Opt-Out of Marketing Emails: You can unsubscribe from marketing emails at any time by clicking the "unsubscribe" link in any email or contacting us directly.
      </li>
      <li>
        Access, Correction, or Deletion: For transactional data managed by Shopify, you can request access, correction, or deletion of your personal data by contacting us at <a href="mailto:info@semiaquatics.com">info@semiaquatics.com</a>. We will facilitate your request with Shopify, subject to legal obligations.
      </li>
      <li>
        Cookies Management: You can manage and delete cookies through your browser settings. To change your preferences for this site now, <a href="#" onClick={(e) => { e.preventDefault(); if (typeof window !== 'undefined') { window.dispatchEvent(new Event('consent:manage')) } }}>open Cookie Settings</a>.
      </li>
    </ul>

    <h2>6. Policy Updates</h2>
    <p>
      We may update this Privacy Policy from time to time to reflect changes in our practices, services, or legal obligations. Any changes will be posted on this page, and the "Last Updated" date at the top of this Privacy Policy will be revised accordingly.
    </p>
    <p>
      We encourage you to review this page periodically to stay informed about how we protect your data.
    </p>

    <p>
      For any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:info@semiaquatics.com">info@semiaquatics.com</a>.
    </p>
  </div>
);

export default PrivacyPolicyPage;

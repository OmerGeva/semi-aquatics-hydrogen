import EmailForm from '../email-form/email-form.component';
import styles from './StoryPage.module.scss';
// Note: Video file should be placed in `public/` and referenced by path.

const StoryPage: React.FC = () => (
  <div className={styles.storyPageContainer}>
    <div className={styles.storyContent}>
      <div className={styles.imageColumn}>
        <div className={styles.imageWrapper}>
          <video
            src="/GODPLEASEWORKGOD.MOV"
            muted
            autoPlay
            loop
            playsInline
          />
        </div>
      </div>

      <div className={styles.textColumn}>
        <h1 className={styles.aboutTitle}>About</h1>

        <div className={styles.textContainer}>
          <p>Semi Aquatics is a sustainable design collective crafting future proof apparel, pieces built to last a lifetime and made to help you embrace your individuality. We are many minds with one purpose: artists, scientists, technologists, and makers flowing together under one current to reimagine what clothing can do for both people and planet.</p>

          <p>To spark personal <strong>evolution</strong> and accelerate an Earth-positive future by <strong>evolving</strong> every drop beyond the last, refining materials, processes, and artistry so each garment leaves you, and the world, better than before.</p>

          <p>Every release is a living experiment: smarter fabrics, cleaner construction, bolder design. We challenge ourselves and the industry, to keep moving forward, to keep <strong>evolving</strong>.</p>

          <p>Together, we're rewriting the tide: one original design, one conscious choice, one ripple at a time.</p>

          <div className={styles.emailSignup}>
            <p>Sign up to be notified about future collections</p>
            <EmailForm isSidebar={false} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default StoryPage;

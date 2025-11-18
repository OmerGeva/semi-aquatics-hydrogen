import styles from './FaqPage.module.scss'

// Components
import FaqQuestion from '../faq-question/faq-question.component'

type FaqItem = { question: string; answer: string };

interface FaqSection {
  title: string;
  items: FaqItem[];
}

interface FaqPageProps {
  questions?: FaqItem[];
  sections?: FaqSection[];
}

const FaqPage: React.FC<FaqPageProps> = ({ questions = [], sections = [] }) => {
  const renderList = (list: FaqItem[]) => (
    <div className={styles.list}>
      {list.map((q, i) => (
        <FaqQuestion question={q.question} answer={q.answer} key={i} />
      ))}
    </div>
  );

  return (
    <div className={styles.faqPageContainer}>
      <h1>Frequently Asked Questions</h1>

      {sections.length > 0
        ? sections.map((section, idx) => (
            <section className={styles.section} key={idx}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              {renderList(section.items)}
            </section>
          ))
        : renderList(questions)}
    </div>
  );
};

export default FaqPage;

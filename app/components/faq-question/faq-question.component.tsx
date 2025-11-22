import { useState } from 'react';

// Icons
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';

const styles = {
  questionContainer: 'questionContainer',
  open: 'open',
  questionAndIcon: 'questionAndIcon',
  question: 'question',
  icon: 'icon',
  answer: 'answer',
} as const;

interface FaqQuestionProps {
    question: string;
    answer: string;
}

const FaqQuestion: React.FC <FaqQuestionProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
    <div className={`${styles.questionContainer} ${isOpen ? styles.open : '' }`}>
        <div className={styles.questionAndIcon} onClick={() => setIsOpen(!isOpen)}>
            <h2 className={styles.question}>{question}</h2>
            <div className={styles.icon} aria-hidden>
               { isOpen ? <AiOutlineMinus /> : <AiOutlinePlus /> }
            </div>
        </div>
        <p className={styles.answer}>{answer}</p>
    </div>
    )
}

export default FaqQuestion;

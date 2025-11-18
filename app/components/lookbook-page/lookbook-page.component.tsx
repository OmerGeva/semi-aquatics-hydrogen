import styles from './LookbookPage.module.scss'

interface LookbookPageProps {
}

const LookbookPage:React.FC <LookbookPageProps> = () => {
    return (
        <div className={styles.lookbookPageContainer}>
            <h1 className={styles.title}>
                this is the Lookbook
            </h1>
        </div>
        );
};

export default LookbookPage;
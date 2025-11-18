import React from "react";
import styles from "./LoadingState.module.scss";

const LoadingState: React.FC = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingGrid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.loadingBox}></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState;

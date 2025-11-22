import React from "react";

const styles = {
  loadingContainer: 'loadingContainer',
  loadingGrid: 'loadingGrid',
  loadingBox: 'loadingBox',
} as const;

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

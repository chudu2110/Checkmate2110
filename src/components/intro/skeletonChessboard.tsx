'use client';

import styles from '@/styles/intro/chessboard.module.css';

export default function SkeletonChessboard() {
  return (
    <div className={styles.canvasContainer}>
      <div className={styles.skeletonWrapper}>
        <div className={styles.spinner} />
      </div>
    </div>
  );
}
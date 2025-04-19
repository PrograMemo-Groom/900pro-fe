import React from 'react';
import styles from '@/pages/my-test/components/ProblemView.module.scss';
import { problemContent } from '@/pages/my-test/data/problemContent';

const ProblemView: React.FC = () => {
  return (
    <div className={styles['problem-content']}>
      <pre>{problemContent}</pre>
    </div>
  );
};

export default ProblemView;

import React from 'react';
import styles from '@/pages/my-test/components/TabSelector.module.scss';

export type TabType = 'problem' | 'teamCode';

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${activeTab === 'problem' ? styles.active : ''}`}
        onClick={() => onTabChange('problem')}
      >
        문제 보기
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'teamCode' ? styles.active : ''}`}
        onClick={() => onTabChange('teamCode')}
      >
        팀원 코드
      </button>
    </div>
  );
};

export default TabSelector;

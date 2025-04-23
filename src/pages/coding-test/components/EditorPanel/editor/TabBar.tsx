import React from 'react';
import { Tab, CodeLanguage } from '@/pages/coding-test/types/types';
import TabItem from './TabItem';
import { languageDisplayNames } from '@/pages/coding-test/constants/constants';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  selectedLanguage: CodeLanguage;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string, e: React.MouseEvent) => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  selectedLanguage,
  onTabClick,
  onTabClose
}) => {
  return (
    <div className="editor-header">
      {/* 탭바 */}
      <div className="editor-tabs">
        {tabs.map(tab => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={activeTabId === tab.id}
            onTabClick={onTabClick}
            onTabClose={onTabClose}
          />
        ))}
      </div>
      <div className="language-selector-container">
        <div className="language-display">
          {languageDisplayNames[selectedLanguage]}
        </div>
      </div>
    </div>
  );
};

export default TabBar;

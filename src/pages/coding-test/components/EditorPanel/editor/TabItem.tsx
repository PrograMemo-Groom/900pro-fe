import React from 'react';
import { Tab } from '@/pages/coding-test/types/types';

// SVG 아이콘 임포트
import pythonIcon from '@/assets/python.svg';
import javascriptIcon from '@/assets/javascript.svg';
import javaIcon from '@/assets/java.svg';
import cppIcon from '@/assets/cpp.svg';
import cIcon from '@/assets/c.svg';

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string, e: React.MouseEvent) => void;
}

const TabItem: React.FC<TabItemProps> = ({
  tab,
  isActive,
  onTabClick,
  onTabClose
}) => {
  // 파일 타입에 따른 아이콘 렌더링
  const renderIcon = () => {
    return (
      <span className="file-icon">
        {tab.language === 'python' ? <img src={pythonIcon} alt="Python" width="16" height="16" /> :
         (tab.language === 'javascript' && tab.name.endsWith('.js')) ? <img src={javascriptIcon} alt="JavaScript" width="16" height="16" /> :
         tab.language === 'java' ? <img src={javaIcon} alt="Java" width="16" height="16" /> :
         tab.language === 'cpp' ? <img src={cppIcon} alt="C++" width="16" height="16" /> :
         tab.language === 'c' ? <img src={cIcon} alt="C" width="16" height="16" /> :
         tab.language === 'txt' ? '📄' :
         '📄' /* 그 외 모든 경우 (txt 포함) */
        }
      </span>
    );
  };

  return (
    <div
      className={`editor-tab ${isActive ? 'active' : ''}`}
      onClick={() => onTabClick(tab.id)}
    >
      <div className="file">
        {renderIcon()}
        <span className="tab-name">{tab.name}</span>
      </div>
      <button
        className="close-tab"
        onClick={(e) => onTabClose(tab.id, e)}
      >
        ✕
      </button>
    </div>
  );
};

export default TabItem;

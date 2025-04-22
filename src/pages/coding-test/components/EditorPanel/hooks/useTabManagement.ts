import { useState, useEffect } from 'react';
import { Tab, CodeLanguage } from '@/pages/coding-test/types/types';

interface UseTabManagementProps {
  defaultLanguage: CodeLanguage;
  onLanguageChange: (language: CodeLanguage) => void;
}

interface UseTabManagementReturn {
  tabs: Tab[];
  activeTabId: string;
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  setActiveTabId: React.Dispatch<React.SetStateAction<string>>;
  handleTabClick: (tabId: string) => void;
  closeTab: (id: string, e: React.MouseEvent) => void;
  addTab: (id: string, name: string, language: CodeLanguage) => void;
}

export const useTabManagement = ({
  defaultLanguage,
  onLanguageChange
}: UseTabManagementProps): UseTabManagementReturn => {
  // 탭 관리 상태 - 초기 상태 로직은 유지 (localStorage 로딩 실패 시 사용)
  const [tabs, setTabs] = useState<Tab[]>(() => {
    let initialTabName = 'main';
    if (defaultLanguage === 'python') initialTabName += '.py';
    else if (defaultLanguage === 'javascript') initialTabName += '.js';
    else if (defaultLanguage === 'java') initialTabName += '.java';
    else if (defaultLanguage === 'cpp') initialTabName += '.cpp';
    else if (defaultLanguage === 'c') initialTabName += '.c';
    else if (defaultLanguage === 'txt') initialTabName += '.txt';
    else initialTabName += '.txt';

    return [{ id: 'initialTab', name: initialTabName, language: defaultLanguage }];
  });

  const [activeTabId, setActiveTabId] = useState<string>('initialTab');

  // localStorage에서 탭 상태 로딩
  useEffect(() => {
    const savedTabs = localStorage.getItem('editorTabs');
    const savedActiveTabId = localStorage.getItem('activeEditorTabId');

    if (savedTabs) {
      try {
        const parsedTabs = JSON.parse(savedTabs) as Tab[];
        if (Array.isArray(parsedTabs) && parsedTabs.length > 0) {
          // 저장된 탭이 유효한지 간단히 확인
          if (parsedTabs.every(tab => tab.id && tab.name && tab.language)) {
            setTabs(parsedTabs);

            // 활성 탭 ID 복원, 저장된 ID가 현재 탭 목록에 없으면 첫 번째 탭
            if (savedActiveTabId && parsedTabs.some(tab => tab.id === savedActiveTabId)) {
              setActiveTabId(savedActiveTabId);
            } else {
              setActiveTabId(parsedTabs[0].id);
            }
          }
        }
      } catch (error) {
        console.error("저장된 탭 상태를 불러오는 중 오류 발생:", error);
      }
    }
  }, []);

  // localStorage에 탭 상태 저장
  useEffect(() => {
    localStorage.setItem('editorTabs', JSON.stringify(tabs));
    localStorage.setItem('activeEditorTabId', activeTabId);
  }, [tabs, activeTabId]);

  // 탭 클릭 핸들러
  const handleTabClick = (tabId: string) => {
    const clickedTab = tabs.find(tab => tab.id === tabId);
    if (clickedTab) {
      setActiveTabId(tabId);
      if (defaultLanguage !== clickedTab.language) {
        onLanguageChange(clickedTab.language);
      }
    }
  };

  // 탭 닫기 함수
  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const closingTabIndex = tabs.findIndex(tab => tab.id === id);
    const filteredTabs = tabs.filter(tab => tab.id !== id);

    if (filteredTabs.length === 0) {
      // 모든 탭이 닫힌 경우: 새 기본 'txt' 탭 추가
      const defaultLang = 'txt';
      const newTab: Tab = { id: 'newtab', name: 'untitled.txt', language: defaultLang };
      setTabs([newTab]);
      setActiveTabId('newtab');
      if (defaultLanguage !== defaultLang) {
        onLanguageChange(defaultLang);
      }
    } else if (activeTabId === id) {
      // 활성화된 탭이 닫힌 경우: 이전 탭 또는 첫번째 탭 활성화
      const newActiveIndex = Math.max(0, closingTabIndex - 1);
      const newActiveTab = filteredTabs[newActiveIndex];
      setActiveTabId(newActiveTab.id);
      // 새로 활성화된 탭의 언어로 변경
      if (defaultLanguage !== newActiveTab.language) {
        onLanguageChange(newActiveTab.language);
      }
      setTabs(filteredTabs);
    } else {
      // 비활성 탭이 닫힌 경우: 활성 탭 유지, 탭 목록만 업데이트
      setTabs(filteredTabs);
    }
  };

  // 새 탭 추가 함수
  const addTab = (id: string, name: string, language: CodeLanguage) => {
    const existingTab = tabs.find(tab => tab.id === id);

    if (existingTab) {
      // 이미 열려있는 탭이면 해당 탭을 활성화
      setActiveTabId(id);
      if (defaultLanguage !== existingTab.language) {
        onLanguageChange(existingTab.language);
      }
    } else {
      // 새 탭 추가
      const newTab: Tab = { id, name, language };
      setTabs([...tabs, newTab]);
      setActiveTabId(id);
      if (defaultLanguage !== language) {
        onLanguageChange(language);
      }
    }
  };

  return {
    tabs,
    activeTabId,
    setTabs,
    setActiveTabId,
    handleTabClick,
    closeTab,
    addTab
  };
};

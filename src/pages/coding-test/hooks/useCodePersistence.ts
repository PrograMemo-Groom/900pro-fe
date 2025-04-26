import { useState, useEffect } from 'react';
import { CodeLanguage } from '@/pages/coding-test/types/types';
import { defaultCode } from '@/pages/coding-test/constants/constants';

export const useCodePersistence = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>('python');
  const [codeContent, setCodeContent] = useState<Record<CodeLanguage, string>>({
    python: defaultCode.python,
    javascript: defaultCode.javascript,
    java: defaultCode.java,
    cpp: defaultCode.cpp,
    c: defaultCode.c,
    txt: defaultCode.txt
  });

  // localStorage에서 저장된 코드와 언어 불러오기
  useEffect(() => {
    const savedCode = localStorage.getItem('codingTestCode');
    if (savedCode) {
      try {
        const parsedCode = JSON.parse(savedCode) as Record<CodeLanguage, string>;
        // 저장된 데이터에 없는 언어가 있을 경우 기본 코드로 채워넣기 (txt 포함)
        const initialCode = { ...defaultCode, ...parsedCode };
        setCodeContent(initialCode);
      } catch (error) {
        console.error('저장된 코드를 불러오는 중 오류가 발생했습니다:', error);
        // 파싱 실패 시 기본값으로 리셋
        setCodeContent(defaultCode);
      }
    }

    const savedLanguage = localStorage.getItem('codingTestLanguage');
    if (savedLanguage && Object.keys(defaultCode).includes(savedLanguage)) {
        setSelectedLanguage(savedLanguage as CodeLanguage);
    }
  }, []);

  // 코드 변경 처리
  const handleCodeChange = (value: string) => {
    const updatedCode = {
      ...codeContent,
      [selectedLanguage]: value
    };
    setCodeContent(updatedCode);
    localStorage.setItem('codingTestCode', JSON.stringify(updatedCode));
  };

  // 언어 변경 처리
  const handleLanguageChange = (newLanguage: CodeLanguage) => {
    if (selectedLanguage !== newLanguage) {
      // 언어 변경 전 현재 코드 저장
      localStorage.setItem('codingTestCode', JSON.stringify(codeContent));
      setSelectedLanguage(newLanguage);
      localStorage.setItem('codingTestLanguage', newLanguage);
    }
  };

  // 현재 선택된 언어의 코드 반환
  const getCurrentCode = () => codeContent[selectedLanguage] || defaultCode[selectedLanguage];

  return {
    selectedLanguage,
    codeContent,
    handleCodeChange,
    handleLanguageChange,
    getCurrentCode
  };
}; 

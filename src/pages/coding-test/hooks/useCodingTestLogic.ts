import { useState, useEffect } from 'react';
import { CodeLanguage } from '@/pages/coding-test/types/types';
import { defaultCode } from '@/pages/coding-test/constants/constants';

export const useCodingTestLogic = () => {
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  // TODO: 실제 타이머 로직 구현 필요
  const [remainingTime, setRemainingTime] = useState<string>('1:48:54');
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>('python');
  const [codeContent, setCodeContent] = useState<Record<CodeLanguage, string>>({
    python: defaultCode.python,
    javascript: defaultCode.javascript,
    java: defaultCode.java,
    cpp: defaultCode.cpp,
    c: defaultCode.c,
    txt: defaultCode.txt
  });

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

  const handleCodeChange = (value: string) => {
    const updatedCode = {
      ...codeContent,
      [selectedLanguage]: value
    };
    setCodeContent(updatedCode);
    localStorage.setItem('codingTestCode', JSON.stringify(updatedCode));
  };

  const handleLanguageChange = (newLanguage: CodeLanguage) => {
    if (selectedLanguage !== newLanguage) {
      // 언어 변경 전 현재 코드 저장
      localStorage.setItem('codingTestCode', JSON.stringify(codeContent));
      setSelectedLanguage(newLanguage);
      localStorage.setItem('codingTestLanguage', newLanguage);
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput('실행하는 중...');

    // 실행 가능한 언어 목록 정의
    const executableLanguages: CodeLanguage[] = ['python', 'javascript', 'java', 'cpp', 'c'];

    // 지원하는 언어가 아니면 실행 불가 처리
    if (!executableLanguages.includes(selectedLanguage)) {
      setOutput(`// ${selectedLanguage}은/는 실행할 수 없습니다.`);
      setIsRunning(false);
      return;
    }

    // 실제 구현에서는 백엔드로 코드를 보내 실행하고 결과를 받아오겠지만,
    // 여기서는 시뮬레이션만 합니다.
    setTimeout(() => {
      const resultHeader = `--- ${selectedLanguage} 실행 결과 ---`;
      // codeContent[selectedLanguage]가 존재하는지 확인 후 접근
      const currentCode = codeContent[selectedLanguage] || '';
      const resultContent = currentCode.includes('\n')
        ? currentCode.substring(currentCode.indexOf('\n') + 1)
        : '// 코드가 없습니다.';
      const resultFooter = '--------------------------';
      setOutput(`${resultHeader}\n${resultContent.trim() || '실행 완료.'}\n${resultFooter}`);
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    // TODO: 실제 제출 로직 구현 필요
    alert('코드가 제출되었습니다!');
  };

  const currentCode = codeContent[selectedLanguage] || defaultCode[selectedLanguage];

  return {
    output,
    isRunning,
    remainingTime,
    selectedLanguage,
    codeContent,
    handleCodeChange,
    handleLanguageChange,
    handleRunCode,
    handleSubmit,
    currentCode
  };
};

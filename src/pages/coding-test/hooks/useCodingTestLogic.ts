import { useState, useEffect } from 'react';
import { CodeLanguage } from '@/pages/coding-test/types/types';
import { defaultCode } from '@/pages/coding-test/constants/constants';
import { executeCode, submitCode } from '@/api/codingTestApi';

export const useCodingTestLogic = () => {
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  // TODO: 실제 타이머 로직 구현 필요
  const [remainingTime, _setRemainingTime] = useState<string>('1:48:54');
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

    // 각 언어별로 적절한 처리 후 백엔드 API 호출
    const processCode = async () => {
      try {
        let codeToRun = codeContent[selectedLanguage];

        // 언어별 특수 처리 (필요시)
        switch (selectedLanguage) {
          case 'javascript':
            // JS 코드에 console.log가 없는 경우 기본 출력 추가 (예시)
            if (!codeToRun.includes('console.log')) {
              codeToRun = `// 결과가 출력되지 않는 경우를 대비해 기본 실행 결과를 출력합니다
try {
  const result = (() => {
    ${codeToRun}
  })();
  if (result !== undefined) console.log(result);
} catch (e) {
  console.error(e);
}`;
            }
            break;
          case 'java':
            // Java 코드에 클래스 및 main 메소드가 없는 경우 추가 (예시)
            if (!codeToRun.includes('public class') && !codeToRun.includes('public static void main')) {
              codeToRun = `
public class Main {
  public static void main(String[] args) {
    ${codeToRun}
  }
}`;
            }
            break;
          case 'cpp':
            // C++ 코드에 기본 include 및 main 함수가 없는 경우 추가 (예시)
            if (!codeToRun.includes('#include') || !codeToRun.includes('int main')) {
              if (!codeToRun.includes('#include')) {
                codeToRun = `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\n${codeToRun}`;
              }
              if (!codeToRun.includes('int main')) {
                codeToRun = `${codeToRun}\n\nint main() {\n  // 기본 실행 코드\n  return 0;\n}`;
              }
            }
            break;
          case 'c':
            // C 코드에 기본 include 및 main 함수가 없는 경우 추가 (예시)
            if (!codeToRun.includes('#include') || !codeToRun.includes('int main')) {
              if (!codeToRun.includes('#include')) {
                codeToRun = `#include <stdio.h>\n#include <stdlib.h>\n\n${codeToRun}`;
              }
              if (!codeToRun.includes('int main')) {
                codeToRun = `${codeToRun}\n\nint main() {\n  // 기본 실행 코드\n  return 0;\n}`;
              }
            }
            break;
          default:
            // Python 등 다른 언어는 특별한 처리 없이 그대로 실행
            break;
        }

        // codingTestApi의 executeCode 함수 사용
        const response = await executeCode(selectedLanguage, codeToRun);

        const resultHeader = `--- ${selectedLanguage} 실행 결과 ---`;
        let resultContent = '';

        if (response.success) {
          if (response.data.status === 'success') {
            resultContent = response.data.stdout || '실행 완료 (출력 없음)';
          } else {
            // 오류 상태일 경우
            resultContent = response.data.error ?
              `오류: ${response.data.error.message}\n${response.data.error.detail}` :
              '실행 중 오류가 발생했습니다.';
          }
        } else {
          resultContent = '서버 응답 오류';
        }

        const resultFooter = '--------------------------';
        setOutput(`${resultHeader}\n${resultContent}\n${resultFooter}`);
      } catch (error) {
        console.error('코드 실행 중 오류가 발생했습니다:', error);
        setOutput(`--- 오류 발생 ---\n${error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}\n--------------------------`);
      } finally {
        setIsRunning(false);
      }
    };

    processCode();
  };

  const handleSubmit = () => {
    const submitData = {
      codeRequestDto: {
        testId: 1073741824, // 실제 구현 시 이 값들은 props 또는 context에서 가져와야 합니다
        problemId: 1073741824,
        userId: 1073741824
      },
      submitCode: currentCode,
      submitAt: new Date().toISOString()
    };

    setIsRunning(true);

    submitCode(submitData)
      .then(response => {
        if (response.success) {
          alert('코드가 성공적으로 제출되었습니다!');
        } else {
          alert(`제출 실패: ${response.message}`);
        }
      })
      .catch(error => {
        console.error('제출 중 오류 발생:', error);
        alert('코드 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
      })
      .finally(() => {
        setIsRunning(false);
      });
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

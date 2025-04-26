import { useState } from 'react';
import { CodeLanguage } from '@/pages/coding-test/types/types';
import { executeCode } from '@/api/codingTestApi';

export const useCodeExecution = () => {
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const processAndRunCode = async (selectedLanguage: CodeLanguage, codeContent: string) => {
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

    try {
      let codeToRun = codeContent;

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

  return {
    output,
    isRunning,
    processAndRunCode
  };
}; 

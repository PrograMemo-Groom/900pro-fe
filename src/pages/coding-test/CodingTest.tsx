import React, { useState, useEffect } from 'react';
import CodeEditor, { CodeLanguage, EditorTheme } from '@/pages/coding-test/components/CodeEditor';
import '@/pages/coding-test/CodingTest.scss';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

const availableLanguages: CodeLanguage[] = ['python', 'javascript', 'java', 'cpp', 'c'];

const languageDisplayNames: Record<CodeLanguage, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  java: 'Java',
  cpp: 'C++',
  c: 'C'
};

const defaultCode: Record<CodeLanguage, string> = {
  python: '# 파이썬 코드를 작성하세요\nprint("Hello World!")\n',
  javascript: '// 자바스크립트 코드를 작성하세요\nconsole.log("Hello World!");\n',
  java: '// 자바 코드를 작성하세요\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World!");\n  }\n}\n',
  cpp: '// C++ 코드를 작성하세요\n#include <iostream>\n\nint main() {\n  std::cout << "Hello World!" << std::endl;\n  return 0;\n}\n',
  c: '// C 코드를 작성하세요\n#include <stdio.h>\n\nint main() {\n  printf("Hello World!\\n");\n  return 0;\n}\n'
};

const CodingTestPage: React.FC = () => {
  const [theme, setTheme] = useState<EditorTheme>('dark');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<string>('1:48:54');
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>('python');
  const [codeContent, setCodeContent] = useState<Record<CodeLanguage, string>>({
    python: defaultCode.python,
    javascript: defaultCode.javascript,
    java: defaultCode.java,
    cpp: defaultCode.cpp,
    c: defaultCode.c
  });

  useEffect(() => {
    const savedCode = localStorage.getItem('codingTestCode');
    if (savedCode) {
      try {
        const parsedCode = JSON.parse(savedCode) as Record<CodeLanguage, string>;
        setCodeContent(parsedCode);
      } catch (error) {
        console.error('저장된 코드를 불러오는 중 오류가 발생했습니다:', error);
      }
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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as CodeLanguage;
    if (selectedLanguage !== newLanguage) {
      localStorage.setItem('codingTestCode', JSON.stringify(codeContent));
      setSelectedLanguage(newLanguage);
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput('실행하는 중...');
    // 실제 구현에서는 백엔드로 코드를 보내 실행하고 결과를 받아오겠지만,
    // 여기서는 시뮬레이션만 합니다.
    setTimeout(() => {
      const resultHeader = `--- ${selectedLanguage} 실행 결과 ---`;
      const resultContent = codeContent[selectedLanguage].split('\n')[1] || '실행 완료.';
      const resultFooter = '--------------------------';
      setOutput(`${resultHeader}\n${resultContent}\n${resultFooter}`);
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    alert('코드가 제출되었습니다!');
  };

  const currentCode = codeContent[selectedLanguage];

  return (
    <div className="coding-test-container dark-mode">
      <div className="header">
        <div className="header-timer">남은 시간 {remainingTime}</div>
        <div className="header-title">9BACKPRO</div>
        <div className="header-actions">
          <button
            className="run-button header-button"
            onClick={handleRunCode}
            disabled={isRunning}
          >
            {isRunning ? '실행중...' : '실행하기'}
          </button>
          <button className="submit-button header-button" onClick={handleSubmit}>제출하기</button>
        </div>
      </div>

      <div className="main-content">
        <PanelGroup
          direction="horizontal"
          autoSaveId="coding-test-layout"
          onLayout={(sizes) => {
            localStorage.setItem('panel-sizes', JSON.stringify(sizes));
          }}
        >
          <Panel defaultSize={40} minSize={20}>
            <div className="problem-panel">
              <div className="problem-header">
                <div className="problem-tabs">
                  <button className="problem-tab active">#1012</button>
                  <button className="problem-tab">#1253</button>
                  <button className="problem-tab">#108</button>
                </div>
                <h2 className="problem-title">#1012 유기농 배추</h2>
              </div>

              <div className="problem-details">
                <h3>입력</h3>
                <p>입력의 첫 줄에는 테스트 케이스의 개수 T가 주어진다. 그 다음 줄부터 각각의 테스트 케이스에 대해 첫째 줄에는 배추를 심은 배추밭의 가로길이 M(1 ≤ M ≤ 50)과 세로길이 N(1 ≤ N ≤ 50), 그리고 배추가 심어져 있는 위치의 개수 K(1 ≤ K ≤ 2500)이 주어진다. 그 다음 K줄에는 배추의 위치 X(0 ≤ X ≤ M-1), Y(0 ≤ Y ≤ N-1)가 주어진다. 두 배추의 위치가 같은 경우는 없다. 입력의 첫 줄에는 테스트 케이스의 개수 T가 주어진다. 그 다음 줄부터 각각의 테스트 케이스에 대해 첫째 줄에는 배추를 심은 배추밭의 가로길이 M(1 ≤ M ≤ 50)과 세로길이 N(1 ≤ N ≤ 50), 그리고 배추가 심어져 있는 위치의 개수 K(1 ≤ K ≤ 2500)이 주어진다. 그 다음 K줄에는 배추의 위치 X(0 ≤ X ≤ M-1), Y(0 ≤ Y ≤ N-1)가 주어진다. 두 배추의 위치가 같은 경우는 없다. 입력의 첫 줄에는 테스트 케이스의 개수 T가 주어진다. 그 다음 줄부터 각각의 테스트 케이스에 대해 첫째 줄에는 배추를 심은 배추밭의 가로길이 M(1 ≤ M ≤ 50)과 세로길이 N(1 ≤ N ≤ 50), 그리고 배추가 심어져 있는 위치의 개수 K(1 ≤ K ≤ 2500)이 주어진다. 그 다음 K줄에는 배추의 위치 X(0 ≤ X ≤ M-1), Y(0 ≤ Y ≤ N-1)가 주어진다. 두 배추의 위치가 같은 경우는 없다. 입력의 첫 줄에는 테스트 케이스의 개수 T가 주어진다. 그 다음 줄부터 각각의 테스트 케이스에 대해 첫째 줄에는 배추를 심은 배추밭의 가로길이 M(1 ≤ M ≤ 50)과 세로길이 N(1 ≤ N ≤ 50), 그리고 배추가 심어져 있는 위치의 개수 K(1 ≤ K ≤ 2500)이 주어진다. 그 다음 K줄에는 배추의 위치 X(0 ≤ X ≤ M-1), Y(0 ≤ Y ≤ N-1)가 주어진다. 두 배추의 위치가 같은 경우는 없다.</p>

                <h3>출력</h3>
                <p>각 테스트 케이스에 대해 필요한 최소의 배추흰지렁이 마리 수를 출력한다.</p>

                <h3>예제입력</h3>
                <pre>
{`1
5 3 6
0 2
1 2
2 2
3 2
4 2
4 0
`}
                </pre>

                <h3>예시 출력</h3>
                <pre>2</pre>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="resize-handle" id="resize-handle" />

          <Panel defaultSize={60} minSize={30}>
            <div className="editor-panel">
              <div className="main-editor-area">
                <div className="editor-header">
                  <div className="editor-tabs">
                    <div className="editor-tab active">
                      {`${languageDisplayNames[selectedLanguage]}`}
                    </div>
                  </div>
                  <div className="language-selector-container">
                    <select className="language-selector" value={selectedLanguage} onChange={handleLanguageChange}>
                      {availableLanguages.map(lang => (
                        <option key={lang} value={lang}>
                          {languageDisplayNames[lang]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <PanelGroup direction="vertical" autoSaveId="editor-output-layout">
                  <Panel defaultSize={70} minSize={30}>
                    <div className="editor-container">
                      <CodeEditor
                        value={currentCode}
                        onChange={handleCodeChange}
                        language={selectedLanguage}
                        theme={theme}
                        readOnly={isRunning}
                      />
                    </div>
                  </Panel>

                  <PanelResizeHandle className="resize-handle-vertical" />

                  <Panel defaultSize={30} minSize={10}>
                    <div className="output-panel">
                      <pre>{output || "// 실행 결과가 여기에 표시됩니다."}</pre>
                    </div>
                  </Panel>
                </PanelGroup>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default CodingTestPage;

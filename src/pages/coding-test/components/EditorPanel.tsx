import React from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
// import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { availableLanguages, languageDisplayNames } from '@/pages/coding-test/constants/constants';

export type CodeLanguage = 'python' | 'javascript' | 'java' | 'cpp' | 'c';
export type EditorTheme = 'light' | 'dark';

interface EditorPanelProps {
  selectedLanguage: CodeLanguage;
  onLanguageSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  currentCode: string;
  handleCodeChange: (value: string) => void;
  theme: EditorTheme;
  isRunning: boolean;
  output: string;
}

// const whiteTextExtension = EditorView.theme({
//   '.cm-content': {
//     color: '#ffffff'
//   }
// });

const getLanguageExtension = (lang: CodeLanguage) => {
  switch (lang) {
    case 'python':
      return python();
    case 'javascript':
      return javascript();
    case 'java':
      return java();
    case 'cpp':
      return cpp();
    case 'c':
      return cpp();
    default:
      return python();
  }
};

const getTheme = (themeType: EditorTheme) => {
  return themeType === 'dark' ? vscodeDark : undefined;
};

const EditorPanel: React.FC<EditorPanelProps> = ({
  selectedLanguage,
  onLanguageSelectChange,
  currentCode,
  handleCodeChange,
  theme,
  isRunning,
  output
}) => {
  const langExtension = getLanguageExtension(selectedLanguage);
  const extensions: Extension[] = [];
  if (langExtension) {
    extensions.push(langExtension);
  }

  return (
    <div className="editor-panel">
      <div className="main-editor-area">
        <div className="editor-header">
          <div className="editor-tabs">
            <div className="editor-tab active">
              {`${languageDisplayNames[selectedLanguage]}`}
            </div>
          </div>
          <div className="language-selector-container">
            <select className="language-selector" value={selectedLanguage} onChange={onLanguageSelectChange}>
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
            <div className="editor-container code-editor-wrapper">
              <div className="code-editor-container">
                <CodeMirror
                  value={currentCode}
                  height="100%"
                  onChange={handleCodeChange}
                  extensions={extensions}
                  theme={getTheme(theme)}
                  readOnly={isRunning}
                />
              </div>
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
  );
};

export default EditorPanel;

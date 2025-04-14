import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import '@/pages/my-test/components/CodeEditor.scss';

export type CodeLanguage = 'python' | 'javascript' | 'java' | 'cpp' | 'c' | 'text';
export type EditorTheme = 'light' | 'dark';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: CodeLanguage;
  theme?: EditorTheme;
  readOnly?: boolean;
}

const whiteTextExtension = EditorView.theme({
  '.cm-content': {
    color: '#ffffff'
  }
});

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'python',
  theme = 'dark',
  readOnly = false,
}) => {
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
      case 'text':
        return null;
      default:
        return python();
    }
  };

  const getTheme = (themeType: EditorTheme) => {
    return themeType === 'dark' ? vscodeDark : undefined;
  };

  const langExtension = getLanguageExtension(language);

  const extensions: Extension[] = [];
  if (langExtension) {
    extensions.push(langExtension);
  }

  if (language === 'text') {
    extensions.push(whiteTextExtension);
  }

  return (
    <div className="code-editor-wrapper">
      <div className="code-editor-container">
        <CodeMirror
          value={value}
          height="100%"
          onChange={onChange}
          extensions={extensions}
          theme={getTheme(theme)}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};

export default CodeEditor;

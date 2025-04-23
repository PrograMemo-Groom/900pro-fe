import React, { forwardRef } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { Extension } from '@codemirror/state';
import { EditorTheme, CodeLanguage } from '@/pages/coding-test/types/types';
import { getLanguageExtension } from '../utils/languageUtils';
import { getTheme } from '../utils/themeUtils';
import { whiteTextExtension } from '../utils/languageUtils';

interface CodeEditorProps {
  code: string;
  language: CodeLanguage;
  theme: EditorTheme;
  isReadOnly?: boolean;
  onChange: (value: string) => void;
  onClick?: (e: React.MouseEvent) => void;
}

const CodeEditor = forwardRef<ReactCodeMirrorRef, CodeEditorProps>((
  { code, language, theme, isReadOnly = false, onChange, onClick },
  ref
) => {
  // 언어 확장자 설정
  const langExtension = getLanguageExtension(language);
  const extensions: Extension[] = [];

  // txt 언어일 경우 whiteTextExtension 적용, 아닐 경우 기존 로직
  if (language === 'txt') {
    extensions.push(whiteTextExtension);
  } else if (langExtension) {
    extensions.push(langExtension);
  }

  return (
    <div className="editor-container" onClick={onClick}>
      <CodeMirror
        ref={ref}
        value={code}
        height="100%"
        onChange={onChange}
        extensions={extensions}
        theme={getTheme(theme)}
        readOnly={isReadOnly}
      />
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;

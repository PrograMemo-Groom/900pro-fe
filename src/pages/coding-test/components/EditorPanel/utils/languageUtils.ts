import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { EditorView } from '@codemirror/view';
import { CodeLanguage } from '@/pages/coding-test/types/types';

// 텍스트 콘텐츠 스타일 확장
export const whiteTextExtension = EditorView.theme({
  '.cm-content': {
    color: '#ccc'
  }
});

// 언어별 확장 설정 가져오기
export const getLanguageExtension = (lang: CodeLanguage) => {
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
    case 'txt':
    default:
      return undefined;
  }
};

// 파일 확장자로 언어 유형 가져오기
export const getLanguageByExtension = (extension?: string): CodeLanguage => {
  if (!extension) return 'txt';

  switch (extension) {
    case 'py':
      return 'python';
    case 'js':
      return 'javascript';
    case 'java':
      return 'java';
    case 'cpp':
      return 'cpp';
    case 'c':
      return 'c';
    default:
      return 'txt';
  }
};

import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { EditorTheme } from '@/pages/coding-test/types/types';

// 에디터 테마 가져오기
export const getTheme = (themeType: EditorTheme) => {
  return themeType === 'dark' ? vscodeDark : undefined;
};

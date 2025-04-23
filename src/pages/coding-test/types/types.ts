export type CodeLanguage = 'python' | 'javascript' | 'java' | 'cpp' | 'c' | 'txt';
export type EditorTheme = 'light' | 'dark';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  extension?: string;
  children?: FileItem[];
  isOpen?: boolean;
}

export interface Tab {
  id: string;
  name: string;
  language: CodeLanguage;
}

export interface EditorPanelProps {
  selectedLanguage: CodeLanguage;
  onTabLanguageChange: (lang: CodeLanguage) => void;
  currentCode: string;
  handleCodeChange: (value: string) => void;
  theme: EditorTheme;
  isRunning: boolean;
  output: string;
} 

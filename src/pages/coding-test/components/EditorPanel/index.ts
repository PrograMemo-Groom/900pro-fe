// 필요한 컴포넌트들 내보내기
export { default as CodeEditor } from './editor/CodeEditor';
export { default as OutputPanel } from './editor/OutputPanel';
export { default as TabBar } from './editor/TabBar';
export { default as TabItem } from './editor/TabItem';
export { default as Sidebar } from './sidebar/Sidebar';
export { default as FileTreeItem } from './sidebar/FileTreeItem';
export { useTabManagement } from './hooks/useTabManagement';
export { useFileExplorer } from './hooks/useFileExplorer';
export { getLanguageExtension, getLanguageByExtension, whiteTextExtension } from './utils/languageUtils';
export { getTheme } from './utils/themeUtils';

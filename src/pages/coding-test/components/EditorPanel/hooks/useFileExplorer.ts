import { useState } from 'react';
import { FileItem, CodeLanguage } from '@/pages/coding-test/types/types';
import { sampleFileStructure } from '@/pages/coding-test/data/fileStructure';
import { getLanguageByExtension } from '../utils/languageUtils';

interface UseFileExplorerProps {
  onFileSelect: (id: string, name: string, language: CodeLanguage) => void;
}

interface UseFileExplorerReturn {
  fileStructure: FileItem[];
  toggleFolder: (id: string) => void;
  handleFileClick: (file: FileItem) => void;
}

export const useFileExplorer = ({ onFileSelect }: UseFileExplorerProps): UseFileExplorerReturn => {
  const [fileStructure, setFileStructure] = useState<FileItem[]>(sampleFileStructure);

  // 파일 구조 토글 함수
  const toggleFolder = (id: string) => {
    const toggleFolderItem = (items: FileItem[]): FileItem[] => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, isOpen: !item.isOpen };
        }
        if (item.children) {
          return {
            ...item,
            children: toggleFolderItem(item.children)
          };
        }
        return item;
      });
    };
    setFileStructure(toggleFolderItem(fileStructure));
  };

  // 파일 클릭 함수
  const handleFileClick = (file: FileItem) => {
    const fileExtension = file.extension || '';
    const fileLanguage = getLanguageByExtension(fileExtension);

    // 파일 선택 핸들러 호출
    onFileSelect(file.id, file.name, fileLanguage);
  };

  return {
    fileStructure,
    toggleFolder,
    handleFileClick
  };
};

import { useState } from 'react';
import { FileItem, CodeLanguage } from '@/pages/coding-test/types/types';
import { sampleFileStructure } from '@/pages/coding-test/data/fileStructure';
import { getLanguageByExtension } from '../utils/languageUtils';

interface UseFileExplorerProps {
  onFileSelect: (id: string, name: string, language: CodeLanguage) => void;
  onDeleteItem?: (id: string) => void;
}

interface UseFileExplorerReturn {
  fileStructure: FileItem[];
  lastInteractedItemId: string | null;
  toggleFolder: (id: string) => void;
  handleFileClick: (file: FileItem) => void;
  createFile: (parentId?: string | null, name?: string) => void;
  createFolder: (parentId?: string | null, name?: string) => void;
  renameItem: (id: string, newName: string) => void;
  deleteItem: (id: string) => void;
}

// 간단한 UUID 생성 함수
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// ID로 파일/폴더 아이템 찾기 (재귀)
const findItemById = (items: FileItem[], id: string): FileItem | null => {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

// 파일 구조 정렬 함수 - 폴더 우선, 알파벳 순 정렬
const sortFileStructure = (items: FileItem[]): FileItem[] => {
  const folders = items.filter(item => item.type === 'folder');
  const files = items.filter(item => item.type === 'file');

  const sortedFolders = folders
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(folder => {
      if (folder.children && folder.children.length > 0) {
        return {
          ...folder,
          children: sortFileStructure(folder.children)
        };
      }
      return folder;
    });

  const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));

  return [...sortedFolders, ...sortedFiles];
};

// 동일한 이름의 파일/폴더가 존재하는지 확인하는 함수
const isDuplicateName = (items: FileItem[], name: string, type: 'file' | 'folder'): boolean => {
  for (const item of items) {
    // 파일 비교 시 확장자 제외한 이름 사용 (폴더는 그냥 이름 사용)
    const itemName = type === 'file' && item.extension
      ? item.name.substring(0, item.name.lastIndexOf('.'))
      : item.name;
    const targetName = type === 'file' && name.includes('.')
      ? name.substring(0, name.lastIndexOf('.'))
      : name;

    if (item.type === type && itemName.toLowerCase() === targetName.toLowerCase()) {
      return true;
    }
  }
  return false;
};

const useFileExplorer = ({ onFileSelect, onDeleteItem }: UseFileExplorerProps): UseFileExplorerReturn => {
  const [fileStructure, setFileStructure] = useState<FileItem[]>(sortFileStructure(sampleFileStructure));
  const [lastInteractedItemId, setLastInteractedItemId] = useState<string | null>(null);

  // 폴더 토글 함수
  const toggleFolder = (id: string) => {
    setLastInteractedItemId(id);
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
    setFileStructure(prevStructure => sortFileStructure(toggleFolderItem(prevStructure)));
  };

  // 파일 클릭 처리 함수
  const handleFileClick = (file: FileItem) => {
    setLastInteractedItemId(file.id);
    const fileExtension = file.extension || '';
    const fileLanguage = getLanguageByExtension(fileExtension);
    onFileSelect(file.id, file.name, fileLanguage);
  };

  // 파일 또는 폴더 생성 함수 (공통 로직)
  const createItem = (type: 'file' | 'folder', parentId?: string | null, name?: string) => {
    const newId = generateUUID();
    const baseName = type === 'file' ? 'NewFile.txt' : 'NewFolder';
    let itemName = name || baseName;

    let fileExtension = 'txt';
    if (type === 'file') {
      if (!itemName.includes('.')) {
        itemName += '.txt';
        fileExtension = 'txt';
      } else {
        const parts = itemName.split('.');
        fileExtension = parts[parts.length - 1].toLowerCase();
      }
    }

    const newItem: FileItem = {
      id: newId,
      name: itemName,
      type: type,
      ...(type === 'file' && { extension: fileExtension, content: '' }),
      ...(type === 'folder' && { children: [], isOpen: true }),
    };

    const addItemToStructure = (items: FileItem[], targetParentId: string | null): FileItem[] => {
      // 최상위 레벨에 추가
      if (targetParentId === null) {
        if (isDuplicateName(items, itemName, type)) {
          alert(`같은 이름의 ${type === 'file' ? '파일' : '폴더'}가 이미 존재합니다.`);
          return items;
        }
        return sortFileStructure([...items, newItem]);
      }

      // 특정 폴더 내에 추가
      return items.map(item => {
        if (item.id === targetParentId && item.type === 'folder') {
          if (isDuplicateName(item.children || [], itemName, type)) {
            alert(`같은 이름의 ${type === 'file' ? '파일' : '폴더'}가 이미 존재합니다.`);
            return item;
          }
          // 부모 폴더가 닫혀있으면 열어줌 (이미 newItem 생성시 isOpen: true로 설정함)
          const updatedChildren = sortFileStructure([...(item.children || []), newItem]);
          return { ...item, children: updatedChildren, isOpen: true };
        }
        // 하위 폴더 탐색
        if (item.children) {
          return {
            ...item,
            children: addItemToStructure(item.children, targetParentId)
          };
        }
        return item;
      });
    };

    // 생성 위치 결정 로직
    let targetParentId: string | null = null;
    if (parentId !== undefined) {
      // parentId가 null(루트) 또는 특정 폴더 ID로 명시된 경우
      targetParentId = parentId;
    } else if (lastInteractedItemId) {
      // parentId가 명시되지 않은 경우, 마지막 상호작용 아이템 기준
      const lastItem = findItemById(fileStructure, lastInteractedItemId);
      if (lastItem?.type === 'folder') {
        targetParentId = lastItem.id; // 폴더 내부에 생성
      } else if (lastItem?.type === 'file') {
        // 파일의 부모 찾기 (루트 제외)
        const findParent = (items: FileItem[], childId: string): string | null => {
          for (const item of items) {
            if (item.children?.some(child => child.id === childId)) {
              return item.id;
            }
            if (item.children) {
              const parentId = findParent(item.children, childId);
              if (parentId) return parentId;
            }
          }
          return null;
        };
        targetParentId = findParent(fileStructure, lastItem.id);
      } else {
        targetParentId = null;
      }
    } else {
      targetParentId = null;
    }

    setFileStructure(prevStructure => addItemToStructure(prevStructure, targetParentId));
    setLastInteractedItemId(newId); // 새로 생성된 아이템을 마지막 상호작용 아이템으로 설정
  };

  // 파일 생성
  const createFile = (parentId?: string | null, name?: string) => {
    createItem('file', parentId, name);
  };

  // 폴더 생성
  const createFolder = (parentId?: string | null, name?: string) => {
    createItem('folder', parentId, name);
  };

  // 아이템 이름 변경 함수
  const renameItem = (id: string, newName: string) => {
    // 재귀적으로 아이템을 찾아 이름 변경
    const renameRecursively = (items: FileItem[], targetId: string, newName: string): FileItem[] => {
      // 대상 아이템과 부모 아이템 목록 찾기 (헬퍼 함수)
      const findTargetAndParent = (
        currentItems: FileItem[],
        currentParentItems: FileItem[] | null,
        idToFind: string
      ): { targetItem: FileItem; parentItems: FileItem[] } | null => {
        const actualParentItems = currentParentItems === null ? items : currentParentItems;
        for (const item of currentItems) {
          if (item.id === idToFind) {
            return { targetItem: item, parentItems: actualParentItems };
          }
          if (item.children) {
            const foundInChildren = findTargetAndParent(item.children, item.children, idToFind);
            if (foundInChildren) {
              return foundInChildren;
            }
          }
        }
        return null;
      };

      // 대상 아이템과 부모 찾기 실행
      const findResult = findTargetAndParent(items, null, targetId);

      // 중복 이름 확인 (자기 자신 제외)
      if (findResult) {
        const { targetItem, parentItems } = findResult;
        const otherItems = parentItems.filter(item => item.id !== id);
        if (isDuplicateName(otherItems, newName, targetItem.type)) {
          alert(`같은 이름의 ${targetItem.type === 'file' ? '파일' : '폴더'}가 이미 존재합니다.`);
          return items;
        }
      } else {
        // 대상을 찾지 못한 경우 (이론상 발생하면 안됨)
        console.error("Rename target not found");
        return items;
      }

      // 이름 변경 적용
      return items.map(item => {
        if (item.id === targetId) {
          let updatedItem = { ...item, name: newName };
          if (item.type === 'file') {
            let fileExtension = item.extension || 'txt';
            if (newName.includes('.')) {
              const parts = newName.split('.');
              fileExtension = parts[parts.length - 1].toLowerCase();
            }
            updatedItem.extension = fileExtension;
          }
          return updatedItem;
        }
        if (item.children) {
          return { ...item, children: renameRecursively(item.children, targetId, newName) };
        }
        return item;
      });
    };

    setFileStructure(prevStructure => sortFileStructure(renameRecursively(prevStructure, id, newName)));
  };

  // 아이템 삭제 함수
  const deleteItem = (id: string) => {
    const itemToDelete = findItemById(fileStructure, id);

    const deleteRecursively = (items: FileItem[]): FileItem[] => {
      const filteredItems = items.filter(item => item.id !== id); // ID 일치 아이템 제거
      return sortFileStructure(
        filteredItems.map(item => {
          if (item.children) {
            return { ...item, children: deleteRecursively(item.children) }; // 자식 항목 재귀 처리
          }
          return item;
        })
      );
    };

    setFileStructure(prevStructure => deleteRecursively(prevStructure));

    // 상위 컴포넌트에 삭제 이벤트 알림 (탭 닫기 처리용)
    if (onDeleteItem && itemToDelete) {
      onDeleteItem(id);
    }

    // 삭제된 아이템이 마지막 상호작용 아이템이면 초기화
    if (lastInteractedItemId === id) {
      setLastInteractedItemId(null);
    }
  };

  return {
    fileStructure,
    lastInteractedItemId,
    toggleFolder,
    handleFileClick,
    createFile,
    createFolder,
    renameItem,
    deleteItem
  };
};

export default useFileExplorer;

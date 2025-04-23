import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileItem } from '@/pages/coding-test/types/types';
import '@/css/coding-test/EditorPanel.scss';

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  targetItem: FileItem | null;
  onClose: () => void;
  onOpen: (item: FileItem) => void;
  onCreateFile: (parentId: string) => void;
  onCreateFolder: (parentId: string) => void;
  onRename: (item: FileItem) => void;
  onDelete: (item: FileItem) => void;
  isRootItem?: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  x,
  y,
  targetItem,
  onClose,
  onOpen,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  isRootItem = false,
}) => {
  const menuRef = useRef<HTMLUListElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  // 메뉴 위치 계산 - 화면 경계 고려 및 오프셋 추가
  useEffect(() => {
    if (visible && menuRef.current) {
      // 오프셋 설정 (마우스 커서로부터의 거리)
      const offsetX = 5;
      const offsetY = 5;

      // 화면 크기 가져오기
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // 메뉴 크기 가져오기
      const menuWidth = menuRef.current.offsetWidth;
      const menuHeight = menuRef.current.offsetHeight;

      // 초기 위치 계산 (오프셋 적용)
      let top = y + offsetY;
      let left = x + offsetX;

      // 화면 오른쪽 경계 확인
      if (left + menuWidth > windowWidth) {
        left = x - menuWidth - offsetX;
      }

      // 화면 아래쪽 경계 확인
      if (top + menuHeight > windowHeight) {
        top = y - menuHeight - offsetY;
      }

      // 최종 위치 업데이트
      setMenuPosition({ top, left });
    }
  }, [visible, x, y]);

  if (!visible || !targetItem) return null;

  const isFolder = targetItem.type === 'folder';

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  // Portal을 사용하여 메뉴를 body 요소에 렌더링
  const menuContent = (
    <ul
      ref={menuRef}
      className="context-menu"
      style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
    >
      <li onClick={() => handleAction(() => onOpen(targetItem))}>열기</li>
      {isFolder && (
        <>
          <li onClick={() => handleAction(() => onCreateFile(targetItem.id))}>새 파일</li>
          <li onClick={() => handleAction(() => onCreateFolder(targetItem.id))}>새 폴더</li>
        </>
      )}
      {!isRootItem && (
        <>
          <li onClick={() => handleAction(() => onRename(targetItem))}>
            이름 바꾸기
          </li>
          <li className="delete" onClick={() => handleAction(() => onDelete(targetItem))}>
            삭제
          </li>
        </>
      )}
    </ul>
  );

  return createPortal(menuContent, document.body);
};

export default ContextMenu;

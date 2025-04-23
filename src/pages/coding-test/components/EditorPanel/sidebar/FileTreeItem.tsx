import React from 'react';
import { FileItem } from '@/pages/coding-test/types/types';

// SVG 아이콘 임포트
import pythonIcon from '@/assets/python.svg';
import javascriptIcon from '@/assets/javascript.svg';
import javaIcon from '@/assets/java.svg';
import cppIcon from '@/assets/cpp.svg';
import cIcon from '@/assets/c.svg';

interface FileTreeItemProps {
  item: FileItem;
  activeItemId?: string;
  onFolderToggle: (id: string) => void;
  onFileClick: (file: FileItem) => void;
  onContextMenu: (event: React.MouseEvent, item: FileItem) => void;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
  item,
  activeItemId,
  onFolderToggle,
  onFileClick,
  onContextMenu
}) => {
  // 파일 타입에 따라 아이콘 렌더링
  const renderIcon = () => {
    if (item.type === 'folder') {
      return <span className="folder-icon">{item.isOpen ? '📂' : '📁'}</span>;
    }

    return (
      <span className="file-icon">
        {item.extension === 'js' ? <img src={javascriptIcon} alt="JavaScript" width="16" height="16" /> :
         item.extension === 'py' ? <img src={pythonIcon} alt="Python" width="16" height="16" /> :
         item.extension === 'java' ? <img src={javaIcon} alt="Java" width="16" height="16" /> :
         item.extension === 'cpp' ? <img src={cppIcon} alt="C++" width="16" height="16" /> :
         item.extension === 'c' ? <img src={cIcon} alt="C" width="16" height="16" /> :
         item.extension === 'txt' ? '📄' : '📄'}
      </span>
    );
  };

  // 재귀적으로 자식 항목 렌더링
  const renderChildren = () => {
    if (item.type !== 'folder' || !item.isOpen || !item.children) {
      return null;
    }

    return (
      <div className="folder-children">
        <FileTree
          items={item.children}
          activeItemId={activeItemId}
          onFolderToggle={onFolderToggle}
          onFileClick={onFileClick}
          onContextMenu={onContextMenu}
        />
      </div>
    );
  };

  // 컨텍스트 메뉴 이벤트 처리 함수
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault(); // 기본 메뉴 방지
    onContextMenu(event, item); // 상위 컴포넌트로 이벤트와 아이템 전달
  };

  return (
    <li className="file-tree-item">
      <div
        className={`${item.type} ${item.type === 'folder' && item.isOpen ? 'open' : ''} ${activeItemId === item.id ? 'active' : ''}`}
        onClick={() =>
          item.type === 'folder'
            ? onFolderToggle(item.id)
            : onFileClick(item)
        }
        onContextMenu={handleContextMenu}
      >
        {renderIcon()}
        <span>{item.name}</span>
      </div>
      {renderChildren()}
    </li>
  );
};

// FileTree 컴포넌트 정의 (재귀적 사용을 위해)
interface FileTreeProps {
  items: FileItem[];
  activeItemId?: string;
  onFolderToggle: (id: string) => void;
  onFileClick: (file: FileItem) => void;
  onContextMenu: (event: React.MouseEvent, item: FileItem) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({
  items,
  activeItemId,
  onFolderToggle,
  onFileClick,
  onContextMenu
}) => {
  return (
    <ul className="file-tree">
      {items.map(item => (
        <FileTreeItem
          key={item.id}
          item={item}
          activeItemId={activeItemId}
          onFolderToggle={onFolderToggle}
          onFileClick={onFileClick}
          onContextMenu={onContextMenu}
        />
      ))}
    </ul>
  );
};

export default FileTreeItem;

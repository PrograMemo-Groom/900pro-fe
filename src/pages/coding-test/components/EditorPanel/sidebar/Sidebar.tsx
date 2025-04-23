import { forwardRef, useState } from 'react';
import { ImperativePanelHandle, Panel } from 'react-resizable-panels';
import { FileTree } from './FileTreeItem';
import useFileExplorer from '../hooks/useFileExplorer';
import ContextMenu from './ContextMenu';
import { FileItem } from '@/pages/coding-test/types/types';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface SidebarProps {
  activeFileId?: string;
  onFileSelect: (id: string, name: string, language: any) => void;
  onCollapse: () => void;
  onExpand: () => void;
  onResize: (size: number) => void;
  defaultSize: number;
  onDeleteItem?: (id: string) => void;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  targetItem: FileItem | null;
}

const Sidebar = forwardRef<ImperativePanelHandle, SidebarProps>((
  {
    activeFileId,
    onFileSelect,
    onCollapse,
    onExpand,
    onResize,
    defaultSize,
    onDeleteItem
  },
  ref
) => {
  const {
    fileStructure,
    toggleFolder,
    handleFileClick,
    createFile,
    createFolder,
    renameItem,
    deleteItem
  } = useFileExplorer({
    onFileSelect,
    onDeleteItem
  });

  // 파일 트리 표시 여부를 위한 state 추가
  const [isFileTreeVisible, setIsFileTreeVisible] = useState<boolean>(true);

  // 파일 트리 토글 함수
  const toggleFileTree = () => {
    setIsFileTreeVisible(prev => !prev);
  };

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    targetItem: null,
  });

  // 루트 폴더용 가상 FileItem 객체 생성
  const rootFolderItem: FileItem = {
    id: 'root',
    name: '(유저 이름)',
    type: 'folder',
    children: fileStructure,
    isOpen: isFileTreeVisible
  };

  const handleContextMenu = (event: React.MouseEvent, item: FileItem) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      targetItem: item,
    });
  };

  // 루트 디렉토리 컨텍스트 메뉴 핸들러
  const handleRootContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      targetItem: rootFolderItem,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false, targetItem: null }));
  };

  const handleOpen = (item: FileItem) => {
    if (item.id === 'root') {
      // 루트 폴더 열기/닫기는 파일 트리 토글과 동일
      toggleFileTree();
    } else if (item.type === 'folder') {
      toggleFolder(item.id);
    } else {
      handleFileClick(item);
    }
  };

  const handleCreateFile = (parentId: string) => {
    console.log('파일 생성 시도 - 부모 ID:', parentId);
    const fileName = prompt('새 파일 이름을 입력하세요:');
    if (fileName && fileName.trim() !== '') {
      // 루트 폴더인 경우 null 전달, 그 외에는 parentId 그대로 전달
      const targetParentId = parentId === 'root' ? null : parentId;
      createFile(targetParentId, fileName.trim());
      console.log('파일 생성 요청 완료 - 이름:', fileName.trim(), '부모 ID:', targetParentId);
    }
  };

  const handleCreateFolder = (parentId: string) => {
    console.log('폴더 생성 시도 - 부모 ID:', parentId);
    const folderName = prompt('새 폴더 이름을 입력하세요:');
    if (folderName && folderName.trim() !== '') {
      // 루트 폴더인 경우 null 전달, 그 외에는 parentId 그대로 전달
      const targetParentId = parentId === 'root' ? null : parentId;
      createFolder(targetParentId, folderName.trim());
      console.log('폴더 생성 요청 완료 - 이름:', folderName.trim(), '부모 ID:', targetParentId);
    }
  };

  const handleRename = (item: FileItem) => {
    const newName = prompt(`새 ${item.type === 'folder' ? '폴더' : '파일'} 이름을 입력하세요:`, item.name.split('.')[0]);
    if (newName && newName.trim() !== '') {
      renameItem(item.id, newName.trim());
    }
  };

  const handleDelete = (item: FileItem) => {
    if (confirm(`'${item.name}' 항목을 정말 삭제하시겠습니까?`)) {
      deleteItem(item.id);
    }
  };

  return (
    <Panel
      ref={ref}
      defaultSize={defaultSize}
      minSize={10}
      maxSize={50}
      collapsible={true}
      onCollapse={onCollapse}
      onExpand={onExpand}
      onResize={onResize}
      order={1}
      className="sidebar-panel"
    >
      <div className="sidebar">
        <div className="sidebar-header" onClick={toggleFileTree} onContextMenu={handleRootContextMenu}>
          {/* 프로젝트 루트 디렉토리 표시 */}
          <div className="root-directory">
            {isFileTreeVisible ? <FaChevronDown /> : <FaChevronRight />}
            <span className="root-directory-name">(유저 이름)</span>
          </div>
        </div>
        {isFileTreeVisible && (
          <div className="file-explorer hide-scrollbar">
            <FileTree
              items={fileStructure}
              activeItemId={activeFileId}
              onFolderToggle={toggleFolder}
              onFileClick={handleFileClick}
              onContextMenu={handleContextMenu}
            />
          </div>
        )}
      </div>

      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        targetItem={contextMenu.targetItem}
        onClose={handleCloseContextMenu}
        onOpen={handleOpen}
        onCreateFile={handleCreateFile}
        onCreateFolder={handleCreateFolder}
        onRename={handleRename}
        onDelete={handleDelete}
        isRootItem={contextMenu.targetItem?.id === 'root'}
      />
    </Panel>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;

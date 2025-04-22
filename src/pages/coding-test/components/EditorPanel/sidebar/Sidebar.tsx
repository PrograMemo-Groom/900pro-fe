import { forwardRef } from 'react';
import { ImperativePanelHandle, Panel } from 'react-resizable-panels';
import { FileTree } from './FileTreeItem';
import { useFileExplorer } from '../hooks/useFileExplorer';

interface SidebarProps {
  activeFileId?: string;
  onFileSelect: (id: string, name: string, language: any) => void;
  onCollapse: () => void;
  onExpand: () => void;
  onResize: (size: number) => void;
  defaultSize: number;
}

const Sidebar = forwardRef<ImperativePanelHandle, SidebarProps>((
  { activeFileId, onFileSelect, onCollapse, onExpand, onResize, defaultSize },
  ref
) => {
  // 파일 탐색기 훅 사용
  const { fileStructure, toggleFolder, handleFileClick } = useFileExplorer({
    onFileSelect
  });

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
        <div className="sidebar-header">
          <button className="icon-button" title="파일 탐색기">
            <span role="img" aria-label="file">📄</span>
          </button>
          <button className="icon-button" title="폴더 구조">
            <span role="img" aria-label="folder">📂</span>
          </button>
        </div>
        <div className="file-explorer hide-scrollbar">
          <FileTree
            items={fileStructure}
            activeItemId={activeFileId}
            onFolderToggle={toggleFolder}
            onFileClick={handleFileClick}
          />
        </div>
      </div>
    </Panel>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;

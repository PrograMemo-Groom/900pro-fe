import React, { useEffect, useRef } from 'react';
import { Highlight } from '../hooks/useHighlights';

/**
 * 하이라이트에 사용할 색상 목록 상수
 */
const HIGHLIGHT_COLORS = [
  '#ff8383', // 빨간색
  '#ffc981', // 주황색
  '#f8ff9c', // 노란색
  '#9dffaf', // 초록색
  '#9be3ff', // 파란색
  '#efadff', // 보라색
];

export interface HighlightActionMenuProps {
  position: { top: number; left: number };
  highlight: Highlight;
  onClose: () => void;
  onEdit?: (highlight: Highlight) => void;
  onDelete?: (clientId: string) => void;
}

/**
 * 하이라이트 클릭 시 표시되는 액션 메뉴 컴포넌트
 */
const HighlightActionMenu: React.FC<HighlightActionMenuProps> = ({
  position,
  highlight,
  onClose,
  onEdit,
  onDelete
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지 이벤트 핸들러
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // 메모 수정 클릭 핸들러
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onEdit) {
      onEdit(highlight);
    }
    onClose();
  };

  // 삭제 클릭 핸들러
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onDelete) {
      onDelete(highlight.clientId);
    }
    onClose();
  };

  /**
   * 이벤트 전파를 방지하는 유틸리티 함수
   */
  const preventPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div
      ref={menuRef}
      className="mini-menu"
      style={{
        top: position.top,
        left: position.left,
        position: 'absolute',
        zIndex: 9999,
        backgroundColor: '#2d2d2d',
        border: '1px solid #444',
        borderRadius: '4px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
        padding: '4px 8px',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '120px',
        pointerEvents: 'auto'
      }}
      onClick={preventPropagation}
      onMouseDown={preventPropagation}
    >
      <div
        className="color-palette"
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0',
          marginBottom: '4px'
        }}
      >
        {HIGHLIGHT_COLORS.map((color) => (
          <div
            key={color}
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: color,
              boxShadow: highlight.color.includes(color.substring(1)) ?
                '0 0 0 2px #2d2d2d, 0 0 0 3px #ffffff' : 'none'
            }}
            onClick={preventPropagation}
            onMouseDown={preventPropagation}
          />
        ))}
      </div>

      <button
        style={{
          background: '#4a4a4a',
          color: 'white',
          border: 'none',
          padding: '4px 8px',
          margin: '4px 0',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
        onClick={handleEditClick}
        onMouseDown={preventPropagation}
      >
        메모 수정
      </button>
      <button
        style={{
          background: '#4a4a4a',
          color: 'white',
          border: 'none',
          padding: '4px 8px',
          margin: '4px 0',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
        onClick={handleDeleteClick}
        onMouseDown={preventPropagation}
      >
        삭제
      </button>
    </div>
  );
};

export default HighlightActionMenu;

import React, { useEffect, useRef, useState } from 'react';
import { Highlight } from '@/pages/my-test/components/CodeEditor/hooks/useHighlights';
import '@/pages/my-test/components/CodeEditor/components/ActiveMiniMenu.scss';

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

export interface ActiveMiniMenuProps {
  position: { top: number; left: number };
  highlight: Highlight;
  onClose: () => void;
  onDelete?: (clientId: string) => void;
  onColorChange?: (clientId: string, newColor: string) => void;
}

/**
 * 하이라이트 클릭 시 표시되는 액션 메뉴 컴포넌트
 */
const ActiveMiniMenu: React.FC<ActiveMiniMenuProps> = ({
  position,
  highlight,
  onClose,
  onDelete,
  onColorChange
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    const currentColor = highlight.color;
    let closestColor = HIGHLIGHT_COLORS[0];

    for (const color of HIGHLIGHT_COLORS) {
      if (currentColor.includes(color.substring(1))) {
        closestColor = color;
        break;
      }
    }

    return closestColor;
  });

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

  /**
   * 이벤트 전파를 방지하는 유틸리티 함수
   */
  const preventPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // 색상 선택 핸들러
  const handleColorSelect = (color: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`[디버깅] 색상 선택됨: ${color}`);
    setSelectedColor(color);
  };

  // 색상 변경 클릭 핸들러
  const handleColorChange = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log(`[디버깅] 색상 변경 버튼 클릭됨: ${highlight.clientId}, 색상: ${selectedColor}`);
    if (onColorChange) {
      onColorChange(highlight.clientId, selectedColor);
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

  return (
    <div
      ref={menuRef}
      className="mini-menu"
      style={{
        top: position.top,
        left: position.left
      }}
      onClick={preventPropagation}
      onMouseDown={preventPropagation}
    >
      <div className="color-palette">
        {HIGHLIGHT_COLORS.map((color) => (
          <div
            key={color}
            className={`color-option ${selectedColor === color ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={(e) => handleColorSelect(color, e)}
            onMouseDown={preventPropagation}
          />
        ))}
      </div>

      <button
        onClick={handleColorChange}
        onMouseDown={preventPropagation}
      >
        색상 변경
      </button>
      <button
        onClick={handleDeleteClick}
        onMouseDown={preventPropagation}
      >
        삭제
      </button>
    </div>
  );
};

export default ActiveMiniMenu;

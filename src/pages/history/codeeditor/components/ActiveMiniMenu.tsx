import React, { useEffect, useRef, useState } from 'react';
import { ActiveMiniMenuProps } from '@/pages/history/codeeditor/types/types.ts';
import { HIGHLIGHT_COLORS } from '@/pages/history/codeeditor/constants/constants.ts';
import styles from '@/css/history/TeamView/ActiveMiniMenu.module.scss';

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
      className={styles['active-mini-menu']}
      style={{
        top: position.top,
        left: position.left
      }}
      onClick={preventPropagation}
      onMouseDown={preventPropagation}
    >
      <div className={styles['active-color-palette']}>
        {HIGHLIGHT_COLORS.map((color) => (
          <div
            key={color}
            className={`${styles['active-color-option']} ${selectedColor === color ? styles['selected'] : ''}`}
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

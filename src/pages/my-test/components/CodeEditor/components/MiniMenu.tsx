import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '@/pages/my-test/components/CodeEditor/components/MiniMenu.scss';
import { MiniMenuProps } from '@/pages/my-test/components/CodeEditor/types/types';
import { HIGHLIGHT_COLORS } from '@/pages/my-test/components/CodeEditor/constants/constants';

/**
 * 미니 메뉴 컴포넌트
 */
const MiniMenu: React.FC<MiniMenuProps> = ({ position, onHighlight, onAddMemo }) => {
  // 선택된 색상 상태 관리
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[2]);

  // 포털 사용을 위한 DOM 노드 참조
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  /**
   * 컴포넌트 마운트 시 포털 루트 설정 (에디터 밖에서도 미니 메뉴 표시 가능)
   */
  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  // position이 null이면 아무것도 렌더링하지 않음
  if (!position || !portalRoot) return null;

  /**
   * 이벤트 전파를 방지하는 유틸리티 함수
   */
  const preventPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  /**
   * 색상 선택 시 호출되는 핸들러
   */
  const handleColorSelect = (color: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColor(color);
  };

  /**
   * 하이라이트 버튼 클릭 시 호출되는 핸들러
   */
  const handleHighlightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      onHighlight(selectedColor);
      console.log('MiniMenu: onHighlight 함수 직접 호출 완료');
    } catch (error) {
      console.error('MiniMenu: onHighlight 함수 호출 중 오류:', error);
    }
  };

  /**
   * 메모 버튼 클릭 시 호출되는 핸들러
   */
  const handleMemoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      onAddMemo(selectedColor);
      console.log('MiniMenu: onAddMemo 함수 직접 호출 완료');
    } catch (error) {
      console.error('MiniMenu: onAddMemo 함수 호출 중 오류:', error);
    }
  };

  /**
   * 미니 메뉴 구성 JSX
   */
  const menuContent = (
    <div
      className="mini-menu"
      style={{
        top: position.y,
        left: position.x,
        position: 'fixed',
        zIndex: 9999
      }}
      onClick={preventPropagation}
      onMouseDown={preventPropagation}
      onMouseUp={preventPropagation}
    >
      <div className="color-palette">
        {HIGHLIGHT_COLORS.map((color) => (
          <div
            key={color}
            className={`color-dot ${selectedColor === color ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={(e) => handleColorSelect(color, e)}
            onMouseDown={preventPropagation}
          />
        ))}
      </div>

      <button
        className="mini-menu__button"
        onClick={handleHighlightClick}
        onMouseDown={preventPropagation}
      >
        하이라이트
      </button>
      <button
        className="mini-menu__button"
        onClick={handleMemoClick}
        onMouseDown={preventPropagation}
      >
        메모
      </button>
    </div>
  );

  // ReactDOM.createPortal을 사용하여 body에 직접 렌더링
  return ReactDOM.createPortal(menuContent, portalRoot);
};

export default MiniMenu;

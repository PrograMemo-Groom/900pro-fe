import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '@/pages/my-test/components/MiniMenu/MiniMenu.scss';

// 하이라이트 색상 목록 정의
const HIGHLIGHT_COLORS = [
  '#ff8383', // 빨간색
  '#ffc981', // 주황색
  '#f8ff9c', // 노란색
  '#9dffaf', // 초록색
  '#9be3ff', // 파란색
  '#efadff', // 보라색
];

// MiniMenu 컴포넌트 Props 정의
interface MiniMenuProps {
  position: { x: number; y: number } | null;
  onHighlight: (color: string) => void;
  onAddMemo: () => void;
}

// MiniMenu 컴포넌트 구현
const MiniMenu: React.FC<MiniMenuProps> = ({ position, onHighlight, onAddMemo }) => {
  // 선택된 색상 상태 관리
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[2]);

  // 포털 사용을 위한 DOM 노드 참조
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  // 컴포넌트 마운트 시 포털 엘리먼트 설정
  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  // position이 null이면 아무것도 렌더링하지 않음
  if (!position || !portalRoot) return null;

  // 색상 선택 핸들러
  const handleColorSelect = (color: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColor(color);
  };

  // 하이라이트 버튼 클릭 핸들러
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

  // 메모 버튼 클릭 핸들러
  const handleMemoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      onAddMemo();
      console.log('MiniMenu: onAddMemo 함수 직접 호출 완료');
    } catch (error) {
      console.error('MiniMenu: onAddMemo 함수 호출 중 오류:', error);
    }
  };

  // 이벤트 전파 방지를 위한 핸들러
  const preventPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

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

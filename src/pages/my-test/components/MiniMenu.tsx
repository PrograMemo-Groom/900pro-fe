import React from 'react';
import './MiniMenu.scss';

// MiniMenu 컴포넌트 Props 정의
interface MiniMenuProps {
  position: { x: number; y: number } | null;
  onHighlight: () => void;
  onAddMemo: () => void;
}

// MiniMenu 컴포넌트 구현
const MiniMenu: React.FC<MiniMenuProps> = ({ position, onHighlight, onAddMemo }) => {
  // position이 null이면 아무것도 렌더링하지 않음
  if (!position) return null;

  return (
    <div
      className="mini-menu"
      style={{ top: position.y, left: position.x }} // 위치만 인라인 스타일로 설정
    >
      <button className="mini-menu__button" onClick={onHighlight}>
        하이라이트
      </button>
      <button className="mini-menu__button" onClick={onAddMemo}>
        메모
      </button>
    </div>
  );
};

export default MiniMenu;

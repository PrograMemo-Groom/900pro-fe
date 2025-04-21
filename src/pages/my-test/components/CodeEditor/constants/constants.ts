import { CSSProperties } from 'react';

/**
 * 하이라이트에 사용할 색상 목록 상수
 */
export const HIGHLIGHT_COLORS = [
  '#ff8383', // 빨간색
  '#ffc981', // 주황색
  '#f8ff9c', // 노란색
  '#9dffaf', // 초록색
  '#9be3ff', // 파란색
  '#efadff', // 보라색
];

/**
 * 메모 팝업 컨테이너 스타일 상수
 */
export const MEMO_CONTAINER_STYLE: CSSProperties = {
  position: 'absolute',
  top: '0',
  left: '0',
  pointerEvents: 'none', // 초기에는 상호작용 불가
  zIndex: '9999',
  overflow: 'visible',
  opacity: 0, // 초기에는 투명하게
  transition: 'opacity 0.15s ease-in-out' // 부드러운 전환 효과
};

/**
 * 하이라이트 메뉴 컨테이너 스타일
 */
export const HIGHLIGHT_MENU_CONTAINER_STYLE: CSSProperties = {
  position: 'absolute',
  top: '0',
  left: '0',
  pointerEvents: 'none',
  zIndex: '9999',
  overflow: 'visible'
};

/**
 * 기본 메모 배경색 (폴백)
 */
export const DEFAULT_MEMO_BACKGROUND_COLOR = '#fff7a5';

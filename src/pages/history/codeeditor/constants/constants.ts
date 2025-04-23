import { CSSProperties } from 'react';

export const HIGHLIGHT_COLORS = [
  '#ff8383', // 빨간색
  '#ffc981', // 주황색
  '#f8ff9c', // 노란색
  '#9dffaf', // 초록색
  '#9be3ff', // 파란색
  '#efadff', // 보라색
];

export const MEMO_CONTAINER_STYLE: CSSProperties = {
  position: 'absolute',
  top: '0',
  left: '0',
  pointerEvents: 'none',
  zIndex: '9999',
  overflow: 'visible',
  opacity: 0,
  transition: 'opacity 0.15s ease-in-out'
};

export const HIGHLIGHT_MENU_CONTAINER_STYLE: CSSProperties = {
  position: 'absolute',
  top: '0',
  left: '0',
  pointerEvents: 'none',
  zIndex: '9999',
  overflow: 'visible'
};

export const DEFAULT_MEMO_BACKGROUND_COLOR = '#fff7a5';

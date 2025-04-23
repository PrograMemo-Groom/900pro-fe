import { EditorView } from '@codemirror/view';

/**
 * 정사각형에 가깝고 우측 하단이 접힌 메모 아이콘 SVG
 */
export const faNoteStickySVG = `
<svg viewBox="0 0 448 448" fill="currentColor" height="1em" width="1em">
  <path d="M400 32h-352C21.49 32 0 53.49 0 80v352C0 458.5 21.49 480 48 480h245.5c16.97 0 33.25-6.744 45.26-18.75l90.51-90.51C441.3 358.7 448 342.5 448 325.5V80C448 53.49 426.5 32 400 32zM64 96h320l-.001 224H320c-17.67 0-32 14.33-32 32v64H64V96z"/>
</svg>
`;

/**
 * 아이콘 DOM 생성 유틸리티 함수
 */
export const createIconDOM = (clientId: string, iconColor: string, hasClickListener: boolean = false, onClick?: () => void): HTMLElement => {
  const span = document.createElement("span");
  span.style.position = "relative";
  span.style.display = "inline-block";
  span.style.width = "1px";
  span.style.height = "1em";
  span.style.verticalAlign = "text-bottom";

  const iconContainer = document.createElement("span");
  iconContainer.style.position = "absolute";
  iconContainer.style.left = hasClickListener ? "-10px" : "0px";
  iconContainer.style.top = "5px";
  iconContainer.style.cursor = hasClickListener ? "pointer" : "default";
  iconContainer.title = hasClickListener ? "메모 보기/편집" : "메모 아이콘";
  iconContainer.dataset.clientId = clientId;

  iconContainer.style.display = "flex";
  iconContainer.style.alignItems = "center";
  iconContainer.style.justifyContent = "center";
  iconContainer.style.width = hasClickListener ? "25px" : "15px";
  iconContainer.style.height = hasClickListener ? "25px" : "15px";
  iconContainer.style.userSelect = "none";
  iconContainer.style.webkitUserSelect = "none";

  iconContainer.innerHTML = faNoteStickySVG;
  const svgElement = iconContainer.querySelector('svg');
  if (svgElement) {
    svgElement.style.width = hasClickListener ? '0.7em' : '0.8em';
    svgElement.style.height = hasClickListener ? '0.7em' : '0.8em';
    svgElement.style.fill = iconColor;
  }

  if (hasClickListener && onClick) {
    iconContainer.addEventListener('click', (event) => {
      event.stopPropagation();
      onClick();
    });
  }

  iconContainer.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
      event.stopPropagation();
    }
  });

  span.appendChild(iconContainer);
  return span;
};

/**
 * 메모 팝업 위치 계산 함수 - 성능 개선을 위해 분리
 */
export const calculateMemoPosition = (pos: number, editorView: EditorView): { top: number; left: number } | null => {
  try {
    const coords = editorView.coordsAtPos(pos);
    if (!coords) {
      return null;
    }

    const cmScroller = editorView.dom.querySelector('.cm-scroller');
    if (!cmScroller) {
      return null;
    }

    const scrollerRect = cmScroller.getBoundingClientRect();

    const newTop = coords.top - scrollerRect.top + cmScroller.scrollTop + 25;
    const newLeft = coords.left - scrollerRect.left + cmScroller.scrollLeft + 10;

    return { top: newTop, left: newLeft };
  } catch (e) {
    return null;
  }
};

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { EditorView } from '@codemirror/view';
import { StateField, RangeSet, StateEffect, Extension } from '@codemirror/state';
import { Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { FaNoteSticky } from "react-icons/fa6";
import ReactDOM from 'react-dom/client';

/**
 * 하이라이트 정보를 저장할 인터페이스
 */
export interface Highlight {
  clientId: string;     // 프론트엔드에서 생성한 임시 ID
  id?: string;          // 백엔드에서 부여한 영구 ID (없으면 미저장 상태)
  from: number;         // 시작 위치
  to: number;           // 끝 위치
  color: string;        // 하이라이트 색상
  documentId: string;   // 문서 ID
  isPending?: boolean;  // 백엔드 저장 대기 상태
  isMemo?: boolean;     // 메모 하이라이트 여부
}

/**
 * 활성화된 메모 팝업 상태 인터페이스
 */
export interface ActiveMemoState {
  clientId: string;                    // 활성화된 메모의 clientId
  highlight: Highlight;                // 위치 계산을 위한 하이라이트 정보
  position: { top: number; left: number }; // 화면상의 위치
}

/**
 * 클릭된 하이라이트 메뉴 상태 인터페이스
 */
export interface HighlightMenuState {
  clientId: string;                    // 클릭된 하이라이트의 clientId
  highlight: Highlight;                // 하이라이트 정보
  position: { top: number; left: number }; // 메뉴 표시 위치
}

/**
 * 하이라이트 색상 업데이트 효과 정의 (새로 추가)
 */
export const updateHighlightColorEffect = StateEffect.define<{
  clientId: string;
  newColor: string;
  isMemo: boolean;
  from: number;
  to: number;
}>();

/**
 * 하이라이트 필드 - CodeMirror 상태에 하이라이트 정보를 저장
 */
const highlightField = StateField.define<DecorationSet>({
  create() {
    console.log('[디버깅] 하이라이트 필드 생성');
    return RangeSet.of([]);
  },
  update(highlights, tr) {
    // 문서 변경에 맞게 하이라이트 위치 업데이트
    highlights = highlights.map(tr.changes);

    // 효과 처리
    for (const e of tr.effects) {
      // 모든 하이라이트 제거 효과
      if (e.is(clearHighlightsEffect)) {
        console.log('[디버깅] 모든 하이라이트 제거 효과 적용');
        return RangeSet.of([]);
      }

      // 특정 하이라이트 제거 효과
      if (e.is(removeHighlightEffect)) {
        const clientIdToRemove = e.value; // 제거할 clientId
        console.log(`[디버깅] 하이라이트 제거 효과 적용: ${clientIdToRemove}`);

        // clientId와 일치하는 데코레이션(mark 또는 widget) 제거
        highlights = highlights.update({
          filter: (_from, _to, value) => {
            // 1. 배경 하이라이트(mark)의 clientId 확인
            const markClientId = value.spec.attributes?.['data-client-id'];
            if (markClientId === clientIdToRemove) {
              return false; // 제거 대상
            }

            // 2. 아이콘 위젯(widget)의 clientId 확인
            // value.spec.widget이 WidgetType 인스턴스이고 widgetClientId 속성을 가지는지 확인
            const widgetInstance = value.spec.widget as any; // 타입 단언 사용 (주의 필요)
            if (widgetInstance && typeof widgetInstance === 'object' && 'widgetClientId' in widgetInstance) {
              if (widgetInstance.widgetClientId === clientIdToRemove) {
                return false; // 제거 대상
              }
            }

            // 위 조건에 해당하지 않으면 데코레이션 유지
            return true;
          }
        });
      }

      // 하이라이트 추가 효과
      if (e.is(addHighlightEffect)) {
        const { highlight, setActiveMemo, editorView, onHighlightClick } = e.value;
        const { from, to, color, clientId, isMemo } = highlight;
        console.log(`[디버깅] 하이라이트 효과 적용: ${clientId} (${from}-${to}), isMemo: ${!!isMemo}`);

        // 데코레이션을 저장할 배열
        const decorationsToAdd = [];

        // 배경 하이라이트 데코레이션
        const highlightDecoration = Decoration.mark({
          class: 'cm-highlight',
          attributes: {
            'data-client-id': clientId,
            title: isMemo ? '메모 및 하이라이트' : '하이라이트된 텍스트',
            style: `background-color: ${color} !important;`
          }
        }).range(from, to);
        decorationsToAdd.push(highlightDecoration);

        // 메모인 경우 아이콘 위젯 추가
        if (isMemo && editorView) {
          // 원본 색상 추출 (RGBA에서 원본 색상 추출)
          let iconColor = rgbaToHex(color);

          const iconDecoration = Decoration.widget({
            widget: createMemoIconWidget(clientId, iconColor, highlight, setActiveMemo, editorView, onHighlightClick),
            side: 0
          }).range(to);
          decorationsToAdd.push(iconDecoration);
          console.log('[디버깅] 메모 아이콘 위젯 데코레이션 추가:', clientId, '색상:', iconColor);
        } else if (isMemo && !editorView) {
          console.warn(`[경고] 메모 아이콘 생성 불가: editorView 없음 (${clientId})`);
        }

        highlights = highlights.update({
          add: decorationsToAdd,
        });
      }

      // 하이라이트 색상 업데이트 효과 (새로 추가)
      if (e.is(updateHighlightColorEffect)) {
        const { clientId, newColor, isMemo, from, to } = e.value;
        console.log(`[디버깅] 하이라이트 색상 업데이트 효과 적용: ${clientId}, 색상: ${newColor}`);

        // 기존 하이라이트 제거
        highlights = highlights.update({
          filter: (_from, _to, value) => {
            const attrClientId = value.spec.attributes?.['data-client-id'];
            return attrClientId !== clientId;
          }
        });

        // 새 색상으로 하이라이트 및 아이콘 추가
        const decorationsToAdd = [];

        // 배경 하이라이트 데코레이션
        const highlightDecoration = Decoration.mark({
          class: 'cm-highlight',
          attributes: {
            'data-client-id': clientId,
            title: isMemo ? '메모 및 하이라이트' : '하이라이트된 텍스트',
            style: `background-color: ${newColor} !important;`
          }
        }).range(from, to);
        decorationsToAdd.push(highlightDecoration);

        // 메모인 경우 아이콘 위젯 추가
        if (isMemo) {
          const iconColor = rgbaToHex(newColor);

          // 현재 하이라이트와 동일한 아이콘 위젯 생성
          // 실제 작동을 위한 최소한의 위젯만 생성
          const iconDecoration = Decoration.widget({
            widget: new class extends WidgetType {
              toDOM() {
                const span = document.createElement("span");
                span.style.position = "relative";
                span.style.display = "inline-block";
                span.style.width = "1px";
                span.style.height = "1em";
                span.style.verticalAlign = "text-bottom";

                const iconContainer = document.createElement("span");
                iconContainer.style.position = "absolute";
                iconContainer.style.left = "0px";
                iconContainer.style.top = "5px";
                iconContainer.style.cursor = "pointer";
                iconContainer.title = "메모 보기/편집";
                iconContainer.dataset.clientId = clientId;

                // 아이콘 스타일 최적화
                iconContainer.style.display = "flex";
                iconContainer.style.alignItems = "center";
                iconContainer.style.justifyContent = "center";
                iconContainer.style.width = "15px";
                iconContainer.style.height = "15px";

                // 사용자 선택 비활성화
                iconContainer.style.userSelect = "none";
                iconContainer.style.webkitUserSelect = "none";

                span.appendChild(iconContainer);

                const root = ReactDOM.createRoot(iconContainer);
                root.render(React.createElement(FaNoteSticky, { color: iconColor, size: '0.8em' }));

                return span;
              }
            },
            side: 0
          }).range(to);

          decorationsToAdd.push(iconDecoration);
        }

        highlights = highlights.update({
          add: decorationsToAdd,
        });
      }
    }

    return highlights;
  },
  provide: field => EditorView.decorations.from(field)
});

/**
 * 메모 아이콘 위젯 생성 함수 - 하이라이트 옆에 메모 아이콘 표시
 */
const createMemoIconWidget = (
  clientId: string,
  color: string,
  highlight: Highlight,
  setActiveMemo: React.Dispatch<React.SetStateAction<ActiveMemoState | null>>,
  editorView: EditorView,
  _onHighlightClick?: (state: HighlightMenuState) => void
) => {
  return new class extends WidgetType {
    // 위젯 인스턴스에 clientId 저장
    readonly widgetClientId: string;

    constructor() {
      super();
      this.widgetClientId = clientId; // 생성자에서 clientId 설정
    }

    toDOM() {
      const span = document.createElement("span");
      span.style.position = "relative";
      span.style.display = "inline-block";
      span.style.width = "1px";
      span.style.height = "1em";
      span.style.verticalAlign = "text-bottom";

      const iconContainer = document.createElement("span");
      iconContainer.style.position = "absolute";
      iconContainer.style.left = "0px";
      iconContainer.style.top = "5px";
      iconContainer.style.cursor = "pointer";
      iconContainer.title = "메모 보기/편집";
      iconContainer.dataset.clientId = this.widgetClientId;

      // 아이콘 스타일 최적화
      iconContainer.style.display = "flex";
      iconContainer.style.alignItems = "center";
      iconContainer.style.justifyContent = "center";
      iconContainer.style.width = "15px";
      iconContainer.style.height = "15px";

      // 사용자 선택 비활성화
      iconContainer.style.userSelect = "none";
      iconContainer.style.webkitUserSelect = "none";

      span.appendChild(iconContainer);

      const root = ReactDOM.createRoot(iconContainer);
      root.render(React.createElement(FaNoteSticky, { color: color, size: '0.8em' }));

      iconContainer.addEventListener('click', (event) => {
        event.stopPropagation();
        console.log('메모 아이콘 클릭됨 - clientId:', this.widgetClientId);

        // 클릭된 시점의 clientId와 highlight를 클로저로 캡처
        const memoClientId = this.widgetClientId;
        const memoHighlight = highlight;

        // 함수형 업데이트 사용
        setActiveMemo(prevActiveMemo => {
          // 위치는 클릭 시점에 다시 계산하거나 기본값 사용
          const position = calculateMemoPosition(memoHighlight.to, editorView);
          const newPosition = position || { top: 100, left: 100 };

          if (prevActiveMemo && prevActiveMemo.clientId === memoClientId) {
            // 현재 열린 팝업과 같은 아이콘 클릭 -> 닫기
            console.log('[디버깅] 같은 메모 아이콘 클릭, 팝업 닫음:', memoClientId);
            return null;
          } else {
            // 다른 아이콘 클릭 또는 열린 팝업 없음 -> 열기/전환
            console.log('[디버깅] 메모 팝업 열기/전환:', memoClientId);
            return {
              clientId: memoClientId,
              highlight: memoHighlight,
              position: newPosition
            };
          }
        });
      });

      // 마우스다운 이벤트에서도 선택 방지
      iconContainer.addEventListener('mousedown', (event) => {
        // 중요: 왼쪽 버튼 클릭만 처리 (오른쪽 클릭은 컨텍스트 메뉴 등에 영향 주지 않도록)
        if (event.button === 0) {
          event.stopPropagation();
        }
      });

      return span;
    }

    ignoreEvent() {
      // 클릭 이벤트를 받기 위해 false 반환하지만
      // mousedown 이벤트는 위에서 stopPropagation으로 처리
      return false;
    }
  }
}

/**
 * 메모 팝업 위치 계산 함수 - 성능 개선을 위해 분리
 */
const calculateMemoPosition = (pos: number, editorView: EditorView): { top: number; left: number } | null => {
  try {
    // 메모 포지션 계산
    const coords = editorView.coordsAtPos(pos);
    if (!coords) {
      return null;
    }

    // cm-scroller 요소 찾기
    const cmScroller = editorView.dom.querySelector('.cm-scroller');
    if (!cmScroller) {
      console.warn('.cm-scroller 요소를 찾을 수 없습니다.');
      return null;
    }

    // cm-scroller 기준 상대 위치 계산
    const scrollerRect = cmScroller.getBoundingClientRect();

    // 스크롤 위치 고려한 상대 위치 계산
    const newTop = coords.top - scrollerRect.top + cmScroller.scrollTop + 20;
    const newLeft = coords.left - scrollerRect.left + cmScroller.scrollLeft + 10;

    return { top: newTop, left: newLeft };
  } catch (e) {
    console.error('메모 위치 계산 중 오류:', e);
    return null;
  }
}

/**
 * HEX 색상을 RGBA로 변환하는 유틸리티 함수
 */
export const hexToRgba = (hex: string, opacity: number = 0.2): string => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    console.warn('유효하지 않은 HEX 색상:', hex);
    return `rgba(248, 255, 156, ${opacity})`;
  }

  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error('유효하지 않은 RGB 값');
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } catch (error) {
    console.error('HEX에서 RGBA로 변환 중 오류:', error);
    return `rgba(248, 255, 156, ${opacity})`;
  }
};

/**
 * RGBA 색상을 HEX로 변환하는 유틸리티 함수
 */
export const rgbaToHex = (rgba: string): string => {
  if (!rgba || typeof rgba !== 'string' || !rgba.includes('rgba')) {
    return rgba;
  }

  try {
    const rgbMatch = rgba.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);

    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      return `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`;
    }

    return rgba;
  } catch (error) {
    console.error('RGBA에서 HEX로 변환 중 오류:', error);
    return rgba;
  }
};

/**
 * 하이라이트 색상 생성 함수
 */
export const getHighlightColors = (hex: string): { background: string; border?: string } => {
  return {
    background: hexToRgba(hex, 0.2),
  };
};

// 하이라이트 효과 정의
export const addHighlightEffect = StateEffect.define<{
  highlight: Highlight;
  setActiveMemo: React.Dispatch<React.SetStateAction<ActiveMemoState | null>>;
  editorView: EditorView | null;
  onHighlightClick?: (state: HighlightMenuState) => void;
}>();
export const clearHighlightsEffect = StateEffect.define<null>();
export const removeHighlightEffect = StateEffect.define<string>();

// 하이라이트 테마 정의
export const highlightTheme = EditorView.baseTheme({
  '.cm-highlight': {
    backgroundColor: 'rgba(248, 255, 156, 0.2)',
    borderRadius: '2px',
    padding: '0 1px',
    transition: 'background-color 0.1s ease-in-out, border-color 0.1s ease-in-out'
  }
});

/**
 * useHighlights 훅의 속성 인터페이스
 */
export interface UseHighlightsProps {
  documentId: string;
  editorRef: React.MutableRefObject<EditorView | null>;
  onHighlightClick?: (state: HighlightMenuState) => void; // 하이라이트 클릭 핸들러 추가
}

/**
 * 하이라이트 기능을 관리하는 커스텀 훅
 */
export function useHighlights({ documentId, editorRef, onHighlightClick }: UseHighlightsProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const appliedHighlightIdsRef = useRef(new Set<string>());
  const previousDocumentIdRef = useRef<string | null>(null);
  // 활성화된 메모 팝업 상태
  const [activeMemo, setActiveMemo] = useState<ActiveMemoState | null>(null);
  // 색상 변경 중임을 나타내는 플래그
  const isChangingColorRef = useRef(false);

  /**
   * 하이라이트 추적 키 생성 함수
   */
  const createHighlightKey = (highlight: Highlight): string => {
    // 문서ID, 클라이언트ID, 범위, 색상을 모두 포함하여 고유한 키 생성
    // from과 to는 텍스트 변경 시 바뀔 수 있으므로 클라이언트ID를 중심으로 사용
    return `${highlight.documentId}-${highlight.clientId}`;
  };

  /**
   * 클라이언트 ID 생성 함수
   */
  const generateClientId = (from: number, to: number): string => {
    return `${documentId}-${from}-${to}-${Date.now()}`;
  };

  /**
   * 하이라이트 데이터 저장 함수
   */
  const saveHighlights = (highlightsToSave: Highlight[]) => {
    console.log('[디버깅] 하이라이트 정보 저장:', highlightsToSave.length);
    try {
      localStorage.setItem(`highlights-${documentId}`, JSON.stringify(highlightsToSave));
    } catch (error) {
      console.error('[오류] 하이라이트 저장 중 오류 발생:', error);
    }
  };

  /**
   * 하이라이트 데이터 로드 함수
   */
  const loadHighlights = (): Highlight[] => {
    console.log(`[디버깅] loadHighlights 함수 호출 - documentId: ${documentId}`);

    try {
      const savedHighlights = localStorage.getItem(`highlights-${documentId}`);
      console.log(`[디버깅] 로컬스토리지에서 불러온 하이라이트 데이터 존재 여부:`, !!savedHighlights);

      if (!savedHighlights) return [];

      const parsedHighlights = JSON.parse(savedHighlights);
      console.log(`[디버깅] 파싱된 하이라이트 개수:`, parsedHighlights.length);

      // 기존 하이라이트에 clientId가 없는 경우 추가
      const updatedHighlights = parsedHighlights.map((highlight: Highlight) => {
        if (!highlight.clientId) {
          return {
            ...highlight,
            clientId: generateClientId(highlight.from, highlight.to),
            isPending: false
          };
        }
        return highlight;
      });

      console.log('[디버깅] 하이라이트 정보 로드 완료:', updatedHighlights.length);
      return updatedHighlights;
    } catch (error) {
      console.error('[오류] 하이라이트 로드 중 오류:', error);
      return [];
    }
  };

  /**
   * 하이라이트 변경 감지 플러그인
   */
  const highlightPlugin = ViewPlugin.define(_view => {
    console.log('[디버깅] 하이라이트 플러그인 초기화');

    return {
      update(update: ViewUpdate) {
        if (update.docChanged) {
          console.log('[디버깅] 문서가 변경되었습니다');
        }
      }
    };
  });

  /**
   * 스크롤 및 뷰 업데이트 리스너
   */
  const scrollListenerExtension = useMemo(() => {
    return EditorView.updateListener.of((update) => {
      // 스크롤, 문서 변경, 뷰포트 변경 등 위치에 영향을 줄 수 있는 업데이트 감지
      if (update.docChanged || update.geometryChanged || update.transactions.some(tr => tr.scrollIntoView)) {
        if (activeMemo) {
          const view = editorRef.current;
          if (view) {
            // 현재 activeMemo에 해당하는 highlight 찾기
            const currentHighlight = activeMemo.highlight;
            if (currentHighlight) {
              try {
                // 새 위치 계산 함수 사용
                const newPosition = calculateMemoPosition(currentHighlight.to, view);
                if (newPosition) {
                  // 위치가 실제로 변경되었는지 확인 후 업데이트 (불필요한 리렌더링 방지)
                  if (Math.abs(newPosition.top - activeMemo.position.top) > 3 ||
                      Math.abs(newPosition.left - activeMemo.position.left) > 3) {
                    console.log(`[디버깅] 메모 팝업 위치 업데이트 (스크롤): ${activeMemo.clientId}`, {
                      top: newPosition.top,
                      left: newPosition.left
                    });

                    setActiveMemo(prev => prev ? {
                      ...prev,
                      position: newPosition
                    } : null);
                  }
                } else {
                  console.warn(`[경고] 스크롤 중 메모 위치 재계산 실패: ${activeMemo.clientId}`);
                }
              } catch (e) {
                console.error(`[오류] 메모 위치 재계산 중 오류: ${activeMemo.clientId}`, e);
              }
            }
          }
        }
      }
    });
  }, [activeMemo, editorRef]); // activeMemo 상태가 변경될 때 리스너 재생성

  /**
   * 하이라이트 영역 클릭 이벤트 핸들러 확장
   */
  const highlightClickHandler = useMemo(() => {
    return EditorView.domEventHandlers({
      click: (event, view) => {
        if (!onHighlightClick) return false;

        // 클릭된 요소 확인
        const target = event.target as HTMLElement;

        // 하이라이트 영역인지 확인
        const highlightElement = target.classList.contains('cm-highlight')
          ? target
          : target.closest('.cm-highlight');

        if (highlightElement) {
          event.stopPropagation();
          console.log('[디버깅] 하이라이트 영역 클릭 감지');

          // data-client-id 속성에서 clientId 추출
          const clientId = highlightElement.getAttribute('data-client-id');
          if (!clientId) return false;

          // 해당 clientId로 하이라이트 찾기
          const clickedHighlight = highlights.find(h => h.clientId === clientId);
          if (!clickedHighlight) return false;

          // 에디터 기준 상대 위치 계산
          const cmScroller = view.dom.querySelector('.cm-scroller');
          if (!cmScroller) return false;

          const scrollerRect = cmScroller.getBoundingClientRect();

          // 클릭 이벤트의 정확한 좌표 사용 (마우스 커서 위치)
          const position = {
            top: event.clientY - scrollerRect.top + cmScroller.scrollTop + 15,
            left: event.clientX - scrollerRect.left + cmScroller.scrollLeft
          };

          // 클릭 이벤트 콜백 호출
          onHighlightClick({
            clientId,
            highlight: clickedHighlight,
            position
          });

          return true;
        }

        return false;
      }
    });
  }, [highlights, onHighlightClick]);

  /**
   * 하이라이트 상태 변경 시 CodeMirror에 적용
   */
  useEffect(() => {
    const view = editorRef.current;
    if (!view) return;

    // 색상 변경 중이면 이 useEffect에서는 처리하지 않음
    if (isChangingColorRef.current) {
      console.log('[디버깅] 색상 변경 중이므로 자동 하이라이트 적용을 건너뜁니다');
      return;
    }

    console.log('[디버깅] highlights 상태 변경 감지:', highlights.length);

    // 현재 문서와 관련된 하이라이트만 필터링
    const relevantHighlights = highlights.filter(h => h.documentId === documentId);
    if (relevantHighlights.length === 0) return;

    // 새로 적용할 하이라이트 효과 모음
    const effects: StateEffect<any>[] = [];

    // 각 하이라이트에 대해 적용 여부 체크 후 효과 추가
    relevantHighlights.forEach(highlight => {
      const highlightKey = createHighlightKey(highlight);

      if (!appliedHighlightIdsRef.current.has(highlightKey)) {
        console.log('[디버깅] 하이라이트 효과 추가:', highlight.clientId);

        effects.push(addHighlightEffect.of({
          highlight: highlight,
          setActiveMemo: setActiveMemo,
          editorView: view,
          onHighlightClick
        }));

        appliedHighlightIdsRef.current.add(highlightKey);
      } else {
        console.log('[디버깅] 하이라이트 이미 적용됨, 중복 추가 방지:', highlight.clientId);
      }
    });

    // 효과가 있는 경우만 디스패치
    if (effects.length > 0) {
      console.log(`[디버깅] ${effects.length}개 하이라이트 효과 디스패치`);
      view.dispatch({ effects });
    }
  }, [highlights, documentId, editorRef.current, onHighlightClick]);

  /**
   * 하이라이트 추가 함수
   */
  const addHighlight = (from: number, to: number, color: string, isMemo: boolean = false) => {
    if (!editorRef.current) return false;

    // 중복 하이라이트 확인
    const isDuplicate = highlights.some(h =>
      h.documentId === documentId &&
      h.from === from &&
      h.to === to
    );

    if (isDuplicate) {
      console.log('이미 하이라이트된 범위입니다');
      return false;
    }

    // 새 하이라이트 생성
    const newHighlight: Highlight = {
      clientId: generateClientId(from, to),
      from,
      to,
      color: getHighlightColors(color).background,
      documentId,
      isPending: true,
      isMemo: isMemo
    };

    console.log('새 하이라이트 추가:', newHighlight);

    // 함수형 업데이트 사용하여 상태 갱신
    setHighlights(prevHighlights => {
      const updatedHighlights = [...prevHighlights, newHighlight];
      saveHighlights(updatedHighlights);
      return updatedHighlights;
    });

    return true;
  };

  /**
   * 메모 팝업 닫기 함수 (명시적 닫기용)
   */
  const closeMemoPopup = () => {
    console.log('[디버깅] 메모 팝업 닫기 함수 호출됨 (명시적 닫기)');
    setActiveMemo(null);
  };

  /**
   * 하이라이트 제거 함수
   */
  const removeHighlight = (clientId: string) => {
    if (!editorRef.current) return false;

    console.log('하이라이트 제거:', clientId);

    // 해당 clientId의 하이라이트 찾기
    const targetHighlight = highlights.find(h => h.clientId === clientId);
    if (!targetHighlight) {
      console.warn(`[경고] 제거할 하이라이트를 찾을 수 없음: ${clientId}`);
      return false;
    }

    // 메모 팝업이 열려있다면 닫기
    if (activeMemo && activeMemo.clientId === clientId) {
      setActiveMemo(null);
    }

    // 1. highlights 상태에서 제거
    const updatedHighlights = highlights.filter(h => h.clientId !== clientId);
    setHighlights(updatedHighlights);
    saveHighlights(updatedHighlights);

    // 2. CodeMirror에서 해당 하이라이트 제거 효과 적용
    editorRef.current.dispatch({
      effects: removeHighlightEffect.of(clientId)
    });

    // 3. 적용된 하이라이트 ID 목록에서 제거
    appliedHighlightIdsRef.current.delete(createHighlightKey(targetHighlight));

    return true;
  };

  // CodeMirror 확장 생성
  const highlightExtensions = useMemo(() => {
    console.log('[디버깅] 하이라이트 확장 생성 (useMemo)');
    return [
      highlightField,
      highlightPlugin,
      highlightTheme,
      scrollListenerExtension,
      highlightClickHandler
    ] as Extension[];
  }, [documentId, scrollListenerExtension, highlightClickHandler]);

  /**
   * 문서 변경 시 하이라이트 로드 및 초기화
   */
  useEffect(() => {
    console.log(`[디버깅] documentId 변경 감지: ${documentId}`);

    if (previousDocumentIdRef.current !== documentId) {
      console.log(`[디버깅] 이전 문서(${previousDocumentIdRef.current})와 다른 문서(${documentId})로 변경됨`);

      // 에디터가 존재하면 이전 하이라이트 제거
      if (editorRef.current) {
        console.log('[디버깅] 이전 문서 하이라이트 제거 효과 디스패치');
        editorRef.current.dispatch({
          effects: clearHighlightsEffect.of(null)
        });
      }

      appliedHighlightIdsRef.current.clear();
      const loadedHighlights = loadHighlights();
      setHighlights(loadedHighlights);

      // 문서 변경 시 활성 메모 팝업 초기화
      setActiveMemo(null);

      previousDocumentIdRef.current = documentId;
    }
  }, [documentId]);

  /**
   * 하이라이트 색상 변경 함수 (Promise 기반 비동기 처리)
   */
  const updateHighlightColor = async (clientId: string, newColor: string) => {
    if (!editorRef.current) return false;

    console.log('[색상 변경] 시작 - clientId:', clientId, '색상:', newColor);

    // 해당 clientId의 하이라이트 찾기
    const targetHighlight = highlights.find(h => h.clientId === clientId);
    if (!targetHighlight) {
      console.warn(`[경고] 색상을 변경할 하이라이트를 찾을 수 없음: ${clientId}`);
      return false;
    }

    try {
      // 1. 색상 변경 플래그 설정
      isChangingColorRef.current = true;

      // 2. 새 색상으로 변환 (HEX => RGBA)
      const newRgbaColor = getHighlightColors(newColor).background;

      // 3. 모든 하이라이트 데코레이션 제거 (초기화)
      console.log('[색상 변경] 모든 하이라이트를 일시적으로 제거합니다');
      editorRef.current.dispatch({
        effects: clearHighlightsEffect.of(null)
      });

      // 4. 추적 상태 초기화
      appliedHighlightIdsRef.current.clear();

      // 5. 상태에서 색상 업데이트
      const updatedHighlights = highlights.map(h => {
        if (h.clientId === clientId) {
          return {
            ...h,
            color: newRgbaColor
          };
        }
        return h;
      });

      // 6. React 상태 및 로컬 스토리지 업데이트
      setHighlights(updatedHighlights);
      saveHighlights(updatedHighlights);

      // 7. Promise를 사용하여 마이크로태스크 큐에 작업 추가
      // 이는 React의 상태 업데이트가 완료된 후 실행됨
      await Promise.resolve();

      // 8. 추가 마이크로태스크를 통해 브라우저 렌더링에 시간 부여
      await new Promise<void>(resolve => {
        queueMicrotask(() => resolve());
      });

      // 9. 이제 하이라이트를 다시 적용
      if (!editorRef.current) {
        throw new Error('에디터 참조가 유효하지 않습니다');
      }

      console.log('[색상 변경] 모든 하이라이트를 다시 적용합니다');

      // 10. 모든 하이라이트를 위한 효과 배열 구성
      const effects: StateEffect<any>[] = [];

      // 11. 현재 문서와 관련된 모든 하이라이트를 다시 추가
      const relevantHighlights = updatedHighlights.filter(h => h.documentId === documentId);

      relevantHighlights.forEach(highlight => {
        effects.push(addHighlightEffect.of({
          highlight: highlight,
          setActiveMemo: setActiveMemo,
          editorView: editorRef.current,
          onHighlightClick
        }));

        // 12. 추적 목록에 다시 추가
        appliedHighlightIdsRef.current.add(createHighlightKey(highlight));
      });

      // 13. 모든 효과를 한 번에 디스패치
      if (effects.length > 0) {
        editorRef.current.dispatch({ effects });
        console.log(`[색상 변경] ${effects.length}개 하이라이트를 다시 적용 완료`);
      }

      console.log('[색상 변경] 완료 - 색상 변경 성공:', clientId);
      return true;
    } catch (error) {
      console.error('[색상 변경] 처리 중 오류:', error);
      return false;
    } finally {
      // 14. 성공이든 실패든 색상 변경 플래그 해제
      isChangingColorRef.current = false;
    }
  };

  return {
    highlights,
    highlightExtensions,
    addHighlight,
    removeHighlight,
    updateHighlightColor,
    highlightTheme,
    activeMemo,
    closeMemoPopup,
    setActiveMemo
  };
}

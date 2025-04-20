import React, { useState, useRef, useEffect, useMemo } from 'react';
import { EditorView } from '@codemirror/view';
import { StateField, RangeSet, StateEffect } from '@codemirror/state';
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

      // 하이라이트 추가 효과
      if (e.is(addHighlightEffect)) {
        const { highlight, toggleMemoPopup, editorView } = e.value;
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
            widget: createMemoIconWidget(clientId, iconColor, highlight, toggleMemoPopup, editorView),
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
  toggleMemoPopup: (state: ActiveMemoState | null) => void,
  editorView: EditorView
) => {
  return new class extends WidgetType {
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
      iconContainer.style.top = "4px";
      iconContainer.style.cursor = "pointer";
      iconContainer.title = "메모 보기/편집";
      iconContainer.dataset.clientId = clientId;
      span.appendChild(iconContainer);

      const root = ReactDOM.createRoot(iconContainer);
      root.render(React.createElement(FaNoteSticky, { color: color, size: '0.7em' }));

      iconContainer.addEventListener('click', (event) => {
        event.stopPropagation();
        console.log('메모 아이콘 클릭됨 - clientId:', clientId);

        // 메모 포지션 계산
        const coords = editorView.coordsAtPos(highlight.to);
        if (coords) {
          console.log('[디버깅] 아이콘 위치 좌표:', coords);

          // cm-scroller 요소 찾기
          const cmScroller = editorView.dom.querySelector('.cm-scroller');
          if (!cmScroller) {
            console.warn('.cm-scroller 요소를 찾을 수 없습니다.');
            return;
          }

          // cm-scroller 기준 상대 위치 계산
          const scrollerRect = cmScroller.getBoundingClientRect();

          // 스크롤 위치 고려한 상대 위치 계산
          const newTop = coords.top - scrollerRect.top + cmScroller.scrollTop + 20;
          const newLeft = coords.left - scrollerRect.left + cmScroller.scrollLeft + 10;

          console.log(`[디버깅] cm-scroller 기준 좌표 계산:`, {
            newTop,
            newLeft,
            scrollerRect,
            scrollPosition: {
              top: cmScroller.scrollTop,
              left: cmScroller.scrollLeft
            },
            computedStyle: {
              position: window.getComputedStyle(cmScroller).position,
              zIndex: window.getComputedStyle(cmScroller).zIndex,
              overflow: window.getComputedStyle(cmScroller).overflow
            }
          });

          // 팝업 상태 설정 대신 토글 함수 호출
          // 새로운 상태 객체 생성
          const newState: ActiveMemoState = {
            clientId,
            highlight,
            position: { top: newTop, left: newLeft }
          };
          toggleMemoPopup(newState); // toggleMemoPopup 호출

        } else {
          console.warn(`[경고] 메모 아이콘 위치 좌표 계산 실패: ${clientId}`);
          // 에러 처리: 에디터 중앙 근처에 표시
          // 실패 시에도 토글 함수 호출
          const newState: ActiveMemoState = {
            clientId,
            highlight,
            position: { top: 100, left: 100 } // 실패 시 기본 위치
          };
          toggleMemoPopup(newState); // toggleMemoPopup 호출
        }
      });

      return span;
    }

    ignoreEvent() {
      return false; // 클릭 이벤트를 받기 위해 false 반환
    }
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
  toggleMemoPopup: (state: ActiveMemoState | null) => void;
  editorView: EditorView | null;
}>();
export const clearHighlightsEffect = StateEffect.define<null>();

// 하이라이트 테마 정의
export const highlightTheme = EditorView.baseTheme({
  '.cm-highlight': {
    backgroundColor: 'rgba(248, 255, 156, 0.2)',
    borderRadius: '2px',
    padding: '0 1px',
    transition: 'background-color 0.1s ease-in-out, border-color 0.1s ease-in-out'
  }
});

export interface UseHighlightsProps {
  documentId: string;
  editorRef: React.MutableRefObject<EditorView | null>;
}

/**
 * 하이라이트 기능을 관리하는 커스텀 훅
 */
export function useHighlights({ documentId, editorRef }: UseHighlightsProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const appliedHighlightIdsRef = useRef(new Set<string>());
  const previousDocumentIdRef = useRef<string | null>(null);
  // 활성화된 메모 팝업 상태
  const [activeMemo, setActiveMemo] = useState<ActiveMemoState | null>(null);

  /**
   * 하이라이트 추적 키 생성 함수
   */
  const createHighlightKey = (highlight: Highlight): string => {
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
                // 하이라이트 끝 지점의 현재 좌표 다시 계산
                const coords = view.coordsAtPos(currentHighlight.to);
                if (coords) {
                  // cm-scroller 요소 찾기
                  const cmScroller = view.dom.querySelector('.cm-scroller');
                  if (!cmScroller) {
                    console.warn('.cm-scroller 요소를 찾을 수 없습니다.');
                    return;
                  }

                  // cm-scroller 기준 상대 위치 계산
                  const scrollerRect = cmScroller.getBoundingClientRect();

                  // 스크롤 위치 고려한 상대 위치 계산
                  const newTop = coords.top - scrollerRect.top + cmScroller.scrollTop + 20;
                  const newLeft = coords.left - scrollerRect.left + cmScroller.scrollLeft + 10;

                  // 위치가 실제로 변경되었는지 확인 후 업데이트 (불필요한 리렌더링 방지)
                  if (Math.abs(newTop - activeMemo.position.top) > 3 ||
                      Math.abs(newLeft - activeMemo.position.left) > 3) {
                    console.log(`[디버깅] 메모 팝업 위치 업데이트 (스크롤): ${activeMemo.clientId}`, {
                      top: newTop,
                      left: newLeft,
                      scrollTop: cmScroller.scrollTop
                    });

                    setActiveMemo(prev => prev ? {
                      ...prev,
                      position: { top: newTop, left: newLeft }
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
   * CodeMirror 확장 생성
   */
  const highlightExtensions = useMemo(() => {
    console.log('[디버깅] 하이라이트 확장 생성 (useMemo)');
    return [
      highlightField,
      highlightPlugin,
      highlightTheme,
      scrollListenerExtension // 스크롤 리스너 추가
    ];
  }, [documentId, scrollListenerExtension]);

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
   * 메모 팝업 토글 함수
   */
  const toggleMemoPopup = (newState: ActiveMemoState | null) => {
    setActiveMemo(currentState => {
      // newState가 있고, 현재 상태도 있으며, clientId가 같다면 닫기 (null로 설정)
      if (newState && currentState && newState.clientId === currentState.clientId) {
        console.log(`[디버깅] 메모 팝업 토글 닫기: ${currentState.clientId}`);
        return null;
      }
      // 그렇지 않으면 새 상태로 설정 (열기 또는 다른 메모 열기)
      console.log(`[디버깅] 메모 팝업 토글 열기/변경: ${newState?.clientId}`);
      return newState;
    });
  };

  /**
   * 하이라이트 상태 변경 시 CodeMirror에 적용
   */
  useEffect(() => {
    const view = editorRef.current;
    if (!view) return;

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
          toggleMemoPopup: toggleMemoPopup,
          editorView: view
        }));

        appliedHighlightIdsRef.current.add(highlightKey);
      }
    });

    // 효과가 있는 경우만 디스패치
    if (effects.length > 0) {
      console.log(`[디버깅] ${effects.length}개 하이라이트 효과 디스패치`);
      view.dispatch({ effects });
    }
  }, [highlights, documentId, editorRef.current]);

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
    setActiveMemo(null); // setActiveMemo 직접 호출
  };

  return {
    highlights,
    highlightExtensions,
    addHighlight,
    highlightTheme,
    activeMemo,       // 활성화된 메모 팝업 상태
    closeMemoPopup    // 메모 팝업 닫기 함수 (팝업 내부 버튼용)
  };
}

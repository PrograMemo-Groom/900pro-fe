import { useState, useRef, useEffect, useMemo } from 'react';
import { EditorView } from '@codemirror/view';
import { StateEffect, Extension } from '@codemirror/state';

// 타입 및 인터페이스 임포트
import {
  Highlight,
  ActiveMemoState,
  UseHighlightsProps,
  HighlightMenuState
} from '@/pages/history/codeeditor/types/types.ts';

// 유틸리티 임포트
import { hexToRgba, rgbaToHex } from '@/pages/history/codeeditor/utils/colorUtils.ts';
import { calculateMemoPosition } from '@/pages/history/codeeditor/utils/domUtils.ts';

// CodeMirror 확장 임포트
import {
  addHighlightEffect,
  clearHighlightsEffect,
  removeHighlightEffect,
  updateHighlightColorEffect,
  highlightTheme
} from '@/pages/history/codeeditor/highlight/highlightEffects.ts';
import { highlightField } from '@/pages/history/codeeditor/highlight/highlightField.ts';
import { highlightPlugin } from '@/pages/history/codeeditor/highlight/highlightPlugins.ts';

/**
 * 하이라이트 관리를 위한 커스텀 훅
 */
export function useHighlights({ documentId, editorRef, onHighlightClick }: UseHighlightsProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const appliedHighlightIdsRef = useRef(new Set<string>());
  const previousDocumentIdRef = useRef<string | null>(null);
  const [activeMemo, setActiveMemo] = useState<ActiveMemoState | null>(null);
  const isChangingColorRef = useRef(false);

  const createHighlightKey = (highlight: Highlight): string => {
    return `${highlight.documentId}-${highlight.clientId}`;
  };

  const generateClientId = (from: number, to: number): string => {
    return `${documentId}-${from}-${to}-${Date.now()}`;
  };

  const saveHighlights = (highlightsToSave: Highlight[]) => {
    try {
      localStorage.setItem(`highlights-${documentId}`, JSON.stringify(highlightsToSave));
    } catch (error) {
      console.error('하이라이트 저장 중 오류 발생:', error);
    }
  };

  // 하이라이트가 현재 문서 크기에 맞는지 확인하는 함수
  const isValidHighlightRange = (from: number, to: number): boolean => {
    if (!editorRef.current) return false;

    try {
      const docLength = editorRef.current.state.doc.length;

      if (from < 0 || to < 0 || from > docLength || to > docLength) {
        console.warn(`유효하지 않은 하이라이트 범위: from=${from}, to=${to}, docLength=${docLength}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('하이라이트 범위 확인 중 오류:', error);
      return false;
    }
  };

  const loadHighlights = (): Highlight[] => {
    try {
      const savedHighlights = localStorage.getItem(`highlights-${documentId}`);
      if (!savedHighlights) return [];

      const parsedHighlights = JSON.parse(savedHighlights);

      if (!editorRef.current) return [];
      const docLength = editorRef.current.state.doc.length;

      // 유효한 범위의 하이라이트만 필터링
      const validHighlights = parsedHighlights.filter((highlight: Highlight) => {
        return highlight.from >= 0 && highlight.to >= 0 &&
               highlight.from <= docLength && highlight.to <= docLength;
      });

      const updatedHighlights = validHighlights.map((highlight: Highlight) => {
        if (!highlight.clientId) {
          return {
            ...highlight,
            clientId: generateClientId(highlight.from, highlight.to),
            isPending: false
          };
        }
        return highlight;
      });

      return updatedHighlights;
    } catch (error) {
      console.error('하이라이트 로드 중 오류 발생:', error);
      return [];
    }
  };

  const scrollListenerExtension = useMemo(() => {
    return EditorView.updateListener.of((update) => {
      // 문서나 위치가 변경되지 않았으면 처리하지 않음
      if (!(update.docChanged || update.geometryChanged || update.transactions.some(tr => tr.scrollIntoView))) {
        return;
      }

      // 문서 변경 시 하이라이트 리셋 고려
      if (update.docChanged) {
        // 문서 길이가 크게 변경된 경우 하이라이트 상태를 다시 확인할 수 있음
        const docLength = update.state.doc.length;

        // 메모 팝업이 열려있고 해당 위치가 무효화된 경우 닫기
        if (activeMemo && (activeMemo.highlight.from >= docLength || activeMemo.highlight.to >= docLength)) {
          setActiveMemo(null);
        }
      }

      // 활성화된 메모가 없으면 처리하지 않음
      if (!activeMemo) return;

      const view = editorRef.current;
      if (!view) return;

      const currentHighlight = activeMemo.highlight;
      if (!currentHighlight) return;

      try {
        // 하이라이트 범위가 유효한지 확인
        if (!isValidHighlightRange(currentHighlight.from, currentHighlight.to)) {
          setActiveMemo(null);
          return;
        }

        const newPosition = calculateMemoPosition(currentHighlight.to, view);
        if (!newPosition) return;

        // 위치 변화가 충분히 큰 경우에만 메모 위치 업데이트
        const hasSignificantMovement =
          Math.abs(newPosition.top - activeMemo.position.top) > 3 ||
          Math.abs(newPosition.left - activeMemo.position.left) > 3;

        if (hasSignificantMovement) {
          setActiveMemo(prev => prev ? {
            ...prev,
            position: newPosition
          } : null);
        }
      } catch (e) {
        console.error('메모 위치 업데이트 중 오류:', e);
        setActiveMemo(null);
      }
    });
  }, [activeMemo, editorRef]);

  const highlightClickHandler = useMemo(() => {
    return EditorView.domEventHandlers({
      click: (event, view) => {
        if (!onHighlightClick) return false;

        const target = event.target as HTMLElement;

        const highlightElement = target.classList.contains('cm-highlight')
          ? target
          : target.closest('.cm-highlight');

        if (highlightElement) {
          event.stopPropagation();

          const clientId = highlightElement.getAttribute('data-client-id');
          if (!clientId) return false;

          const clickedHighlight = highlights.find(h => h.clientId === clientId);
          if (!clickedHighlight) return false;

          const cmScroller = view.dom.querySelector('.cm-scroller');
          if (!cmScroller) return false;

          const scrollerRect = cmScroller.getBoundingClientRect();

          const position = {
            top: event.clientY - scrollerRect.top + cmScroller.scrollTop + 15,
            left: event.clientX - scrollerRect.left + cmScroller.scrollLeft
          };

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

  useEffect(() => {
    const view = editorRef.current;
    if (!view) return;

    if (isChangingColorRef.current) {
      return;
    }

    const relevantHighlights = highlights.filter(h => h.documentId === documentId);
    if (relevantHighlights.length === 0) return;

    const effects: StateEffect<any>[] = [];

    relevantHighlights.forEach(highlight => {
      // 하이라이트 범위가 유효한지 확인
      if (!isValidHighlightRange(highlight.from, highlight.to)) {
        return;
      }

      const highlightKey = createHighlightKey(highlight);

      if (!appliedHighlightIdsRef.current.has(highlightKey)) {
        effects.push(addHighlightEffect.of({
          highlight: highlight,
          setActiveMemo: setActiveMemo,
          editorView: view,
          onHighlightClick
        }));

        appliedHighlightIdsRef.current.add(highlightKey);
      }
    });

    if (effects.length > 0) {
      try {
        view.dispatch({ effects });
      } catch (error) {
        console.error('하이라이트 적용 중 오류:', error);
        // 오류 발생 시 모든 하이라이트 초기화를 고려할 수 있음
        view.dispatch({ effects: [clearHighlightsEffect.of(null)] });
        appliedHighlightIdsRef.current.clear();
      }
    }
  }, [highlights, documentId, editorRef, onHighlightClick]);

  const addHighlight = (from: number, to: number, color: string, isMemo: boolean = false) => {
    if (!editorRef.current) return false;

    // 범위가 유효한지 확인
    if (!isValidHighlightRange(from, to)) {
      console.warn('유효하지 않은 하이라이트 범위, 추가 취소');
      return false;
    }

    const isDuplicate = highlights.some(h =>
      h.documentId === documentId &&
      h.from === from &&
      h.to === to
    );

    if (isDuplicate) {
      return false;
    }

    const newHighlight: Highlight = {
      clientId: generateClientId(from, to),
      from,
      to,
      color: hexToRgba(color),
      documentId,
      isPending: true,
      isMemo: isMemo
    };

    setHighlights(prevHighlights => {
      const updatedHighlights = [...prevHighlights, newHighlight];
      saveHighlights(updatedHighlights);
      return updatedHighlights;
    });

    return true;
  };

  const closeMemoPopup = () => {
    setActiveMemo(null);
  };

  const removeHighlight = (clientId: string) => {
    if (!editorRef.current) return false;

    const targetHighlight = highlights.find(h => h.clientId === clientId);
    if (!targetHighlight) {
      return false;
    }

    if (activeMemo && activeMemo.clientId === clientId) {
      setActiveMemo(null);
    }

    const updatedHighlights = highlights.filter(h => h.clientId !== clientId);
    setHighlights(updatedHighlights);
    saveHighlights(updatedHighlights);

    try {
      editorRef.current.dispatch({
        effects: removeHighlightEffect.of(clientId)
      });
    } catch (error) {
      console.error('하이라이트 제거 중 오류:', error);
      // 오류 발생 시 전체 하이라이트 초기화 고려
      editorRef.current.dispatch({
        effects: clearHighlightsEffect.of(null)
      });
      appliedHighlightIdsRef.current.clear();
    }

    appliedHighlightIdsRef.current.delete(createHighlightKey(targetHighlight));

    return true;
  };

  const highlightExtensions = useMemo(() => {
    return [
      highlightField,
      highlightPlugin,
      highlightTheme,
      scrollListenerExtension,
      highlightClickHandler
    ] as Extension[];
  }, [documentId, scrollListenerExtension, highlightClickHandler]);

  useEffect(() => {
    if (previousDocumentIdRef.current !== documentId) {
      if (editorRef.current) {
        try {
          editorRef.current.dispatch({
            effects: clearHighlightsEffect.of(null)
          });
        } catch (error) {
          console.error('하이라이트 초기화 중 오류:', error);
        }
      }

      appliedHighlightIdsRef.current.clear();

      // 에디터가 초기화된 후에만 하이라이트 로드
      if (editorRef.current) {
        const loadedHighlights = loadHighlights();
        setHighlights(loadedHighlights);
      } else {
        setHighlights([]);
      }

      setActiveMemo(null);

      previousDocumentIdRef.current = documentId;
    }
  }, [documentId, editorRef]);

  const updateHighlightColor = async (clientId: string, newColor: string) => {
    if (!editorRef.current) return false;

    const targetHighlight = highlights.find(h => h.clientId === clientId);
    if (!targetHighlight) {
      return false;
    }

    // 하이라이트 범위가 유효한지 확인
    if (!isValidHighlightRange(targetHighlight.from, targetHighlight.to)) {
      console.warn('유효하지 않은 하이라이트 범위, 색상 업데이트 취소');
      removeHighlight(clientId); // 유효하지 않은 하이라이트 제거
      return false;
    }

    try {
      isChangingColorRef.current = true;

      const newRgbaColor = hexToRgba(newColor);

      const updatedHighlights = highlights.map(h => {
        if (h.clientId === clientId) {
          return {
            ...h,
            color: newRgbaColor
          };
        }
        return h;
      });

      setHighlights(updatedHighlights);
      saveHighlights(updatedHighlights);

      editorRef.current.dispatch({
        effects: updateHighlightColorEffect.of({
          clientId,
          newColor: newColor,
          isMemo: targetHighlight.isMemo || false,
          from: targetHighlight.from,
          to: targetHighlight.to
        })
      });

      return true;
    } catch (error) {
      console.error('하이라이트 색상 업데이트 중 오류:', error);
      return false;
    } finally {
      isChangingColorRef.current = false;
    }
  };

  // 문서 변경 감지 및 하이라이트 초기화 (필요 시)
  useEffect(() => {
    const view = editorRef.current;
    if (!view) return;

    // 문서 변경 감지 리스너
    const docChangeListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        // 문서가 완전히 다른 내용으로 교체된 경우 (예: API로 새 코드를 불러올 때)
        const isCompleteChange =
          Math.abs(update.state.doc.length - update.startState.doc.length) > 50;

        if (isCompleteChange) {
          console.log('문서 크기 변경 감지, 하이라이트 초기화');

          // 모든 하이라이트 제거
          try {
            view.dispatch({
              effects: clearHighlightsEffect.of(null)
            });
          } catch (error) {
            console.error('하이라이트 초기화 중 오류:', error);
          }

          appliedHighlightIdsRef.current.clear();
          setHighlights([]);
          setActiveMemo(null);
        }
      }
    });

    // 리스너 등록
    const extension = view.dispatch({
      effects: StateEffect.appendConfig.of(docChangeListener)
    });

    return () => {
      // 리스너 정리 (추후 구현)
    };
  }, [editorRef.current]);

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

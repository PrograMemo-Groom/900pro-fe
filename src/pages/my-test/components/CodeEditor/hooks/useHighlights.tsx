import { useState, useRef, useEffect, useMemo } from 'react';
import { EditorView } from '@codemirror/view';
import { StateEffect, Extension } from '@codemirror/state';

// 타입 및 인터페이스 임포트
import {
  Highlight,
  ActiveMemoState,
  UseHighlightsProps
} from '../types/types';

// 유틸리티 임포트
import { hexToRgba } from '../utils/colorUtils';
import { calculateMemoPosition } from '../utils/domUtils';

// CodeMirror 확장 임포트
import {
  addHighlightEffect,
  clearHighlightsEffect,
  removeHighlightEffect,
  updateHighlightColorEffect,
  highlightTheme
} from '../codemirror/highlightEffects';
import { highlightField } from '../codemirror/highlightField';
import { highlightPlugin } from '../codemirror/highlightPlugins';

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
      // Error handling removed as requested
    }
  };

  const loadHighlights = (): Highlight[] => {
    try {
      const savedHighlights = localStorage.getItem(`highlights-${documentId}`);
      if (!savedHighlights) return [];

      const parsedHighlights = JSON.parse(savedHighlights);

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

      return updatedHighlights;
    } catch (error) {
      return [];
    }
  };

  const scrollListenerExtension = useMemo(() => {
    return EditorView.updateListener.of((update) => {
      if (update.docChanged || update.geometryChanged || update.transactions.some(tr => tr.scrollIntoView)) {
        if (activeMemo) {
          const view = editorRef.current;
          if (view) {
            const currentHighlight = activeMemo.highlight;
            if (currentHighlight) {
              try {
                const newPosition = calculateMemoPosition(currentHighlight.to, view);
                if (newPosition) {
                  if (Math.abs(newPosition.top - activeMemo.position.top) > 3 ||
                      Math.abs(newPosition.left - activeMemo.position.left) > 3) {
                    setActiveMemo(prev => prev ? {
                      ...prev,
                      position: newPosition
                    } : null);
                  }
                }
              } catch (e) {
                // Error handling removed
              }
            }
          }
        }
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
      view.dispatch({ effects });
    }
  }, [highlights, documentId, editorRef, onHighlightClick]);

  const addHighlight = (from: number, to: number, color: string, isMemo: boolean = false) => {
    if (!editorRef.current) return false;

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

    editorRef.current.dispatch({
      effects: removeHighlightEffect.of(clientId)
    });

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
        editorRef.current.dispatch({
          effects: clearHighlightsEffect.of(null)
        });
      }

      appliedHighlightIdsRef.current.clear();
      const loadedHighlights = loadHighlights();
      setHighlights(loadedHighlights);

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
      return false;
    } finally {
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

// 외부에서 사용할 유틸리티 및 타입 재내보내기
export {
  hexToRgba,
  rgbaToHex,
  getHighlightColors
} from '../utils/colorUtils';

export {
  addHighlightEffect,
  clearHighlightsEffect,
  removeHighlightEffect,
  updateHighlightColorEffect,
  highlightTheme
} from '../codemirror/highlightEffects';

export type {
  Highlight,
  ActiveMemoState,
  HighlightMenuState,
  UseHighlightsProps
} from '../types/types';

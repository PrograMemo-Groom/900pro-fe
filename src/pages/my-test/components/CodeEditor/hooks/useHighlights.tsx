import React, { useState, useRef, useEffect, useMemo } from 'react';
import { EditorView } from '@codemirror/view';
import { StateField, RangeSet, StateEffect } from '@codemirror/state';
import { Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { FaNoteSticky } from "react-icons/fa6";
import ReactDOM from 'react-dom/client';

// 하이라이트 정보를 저장할 인터페이스 정의
export interface Highlight {
  clientId: string;     // 프론트엔드에서 생성한 임시 ID
  id?: string;          // 백엔드에서 부여한 영구 ID (없으면 미저장 상태)
  from: number;
  to: number;
  color: string;
  documentId: string;
  isPending?: boolean;  // 백엔드 저장 대기 상태
  isMemo?: boolean;    // 메모 하이라이트 여부 추가
}

// 메모 아이콘 위젯 정의
class MemoIconWidget extends WidgetType {
  constructor(readonly clientId: string) {
    super();
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
    iconContainer.style.top = "6px";
    iconContainer.style.cursor = "pointer";
    iconContainer.title = "메모 보기/편집";
    iconContainer.dataset.clientId = this.clientId;
    span.appendChild(iconContainer);

    const root = ReactDOM.createRoot(iconContainer);
    root.render(React.createElement(FaNoteSticky, { color: '#FFFFFF', size: '0.7em' }));

    iconContainer.addEventListener('click', (event) => {
      event.stopPropagation();
      console.log('메모 아이콘 클릭됨 - clientId:', this.clientId);
      // TODO: 여기서 메모 팝업 표시 로직
    });

    return span;
  }

  ignoreEvent() {
    return true;
  }
}

// HEX 색상을 RGBA로 변환하는 유틸리티 함수
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

// opacity를 적용하는 함수
export const getHighlightColors = (hex: string): { background: string; border?: string } => {
  return {
    background: hexToRgba(hex, 0.2),
  };
};

// 하이라이트 효과 정의
export const addHighlightEffect = StateEffect.define<Highlight>();

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

export function useHighlights({ documentId, editorRef }: UseHighlightsProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const appliedHighlightIdsRef = useRef(new Set<string>());

  // 하이라이트 저장 및 로드 함수
  const saveHighlights = (highlightsToSave: Highlight[]) => {
    console.log('[디버깅] 하이라이트 정보 저장:', highlightsToSave.length);
    localStorage.setItem(`highlights-${documentId}`, JSON.stringify(highlightsToSave));
  };

  // 하이라이트를 위한 클라이언트 ID 생성 함수
  const generateClientId = (from: number, to: number): string => {
    return `${documentId}-${from}-${to}-${Date.now()}`;
  };

  const loadHighlights = (): Highlight[] => {
    console.log(`[디버깅] loadHighlights 함수 호출 - documentId: ${documentId}`);
    const savedHighlights = localStorage.getItem(`highlights-${documentId}`);
    console.log(`[디버깅] 로컬스토리지에서 불러온 하이라이트 데이터 존재 여부:`, !!savedHighlights);
    const parsedHighlights = savedHighlights ? JSON.parse(savedHighlights) : [];
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
  };

  // 하이라이트 데코레이션 확장 생성
  const createHighlightExtension = () => {
    // 하이라이트 상태 필드 정의
    const highlightField = StateField.define<DecorationSet>({
      create() {
        console.log('[디버깅] 하이라이트 필드 생성');
        return RangeSet.of([]);
      },
      update(highlights, tr) {
        // 문서 변경에 맞게 하이라이트 위치 업데이트
        highlights = highlights.map(tr.changes);

        // 새 하이라이트 효과 처리
        for (const e of tr.effects) {
          if (e.is(addHighlightEffect)) {
            const { from, to, color, clientId, isMemo } = e.value;
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
            if (isMemo) {
              const iconDecoration = Decoration.widget({
                widget: new MemoIconWidget(clientId),
                side: 1
              }).range(to);
              decorationsToAdd.push(iconDecoration);
              console.log('[디버깅] 메모 아이콘 위젯 데코레이션 추가:', clientId);
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

    // 저장된 하이라이트를 로드하여 적용하는 플러그인
    const highlightPlugin = ViewPlugin.define(view => {
      console.log('[디버깅] 하이라이트 플러그인 초기화');
      const loadedHighlights = loadHighlights();
      console.log('[디버깅] 뷰 플러그인에서 하이라이트 로드:', loadedHighlights.length);

      const initTime = Date.now();
      console.log(`[디버깅] 하이라이트 플러그인 초기화 시간: ${initTime}`);

      let isInitialLoadApplied = false;

      setTimeout(() => {
        if (isInitialLoadApplied) {
          console.log('[디버깅] 이미 초기 하이라이트가 적용되었습니다.');
          return;
        }

        console.log('[디버깅] 하이라이트 적용 타이머 실행');

        loadedHighlights.forEach(highlight => {
          if (highlight.documentId === documentId) {
            const highlightKey = `${highlight.documentId}-${highlight.clientId}`;
            if (!appliedHighlightIdsRef.current.has(highlightKey)) {
              console.log('[디버깅] 하이라이트 적용:', highlight.clientId, `(${highlight.from}-${highlight.to}), isMemo: ${!!highlight.isMemo}`);
              view.dispatch({
                effects: addHighlightEffect.of({
                  ...highlight,
                  isMemo: !!highlight.isMemo
                })
              });
              appliedHighlightIdsRef.current.add(highlightKey);
            } else {
              console.log('[디버깅] 중복 하이라이트 적용 방지:', highlight.clientId);
            }
          }
        });

        console.log('[디버깅] 총 적용된 하이라이트 개수:', appliedHighlightIdsRef.current.size);
        isInitialLoadApplied = true;
      }, 100);

      return {
        update(update: ViewUpdate) {
          if (update.docChanged) {
            console.log('[디버깅] 문서가 변경되었습니다');
          }
        }
      };
    });

    return [highlightField, highlightPlugin];
  };

  // 하이라이트 확장 생성 (useMemo 사용)
  const highlightExtensions = useMemo(() => {
    console.log('[디버깅] 하이라이트 확장 생성 (useMemo)');
    return createHighlightExtension();
  }, []);

  // documentId 변경 시 하이라이트 로드
  useEffect(() => {
    console.log(`[디버깅] (New) documentId 변경 감지: ${documentId}. 하이라이트 로드 및 상태 초기화`);
    appliedHighlightIdsRef.current.clear();
    const loadedHighlights = loadHighlights();
    console.log('[디버깅] (New) 로드된 하이라이트 개수:', loadedHighlights.length);
    setHighlights(loadedHighlights);
  }, [documentId]);

  // 하이라이트 추가 함수
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

    // 적용될 색상에 투명도 적용
    const colors = getHighlightColors(color);
    const finalColor = isMemo
      ? hexToRgba('#FFDA63', 0.35) // 메모용 색상
      : colors.background;

    // 새 하이라이트 생성
    const newHighlight: Highlight = {
      clientId: generateClientId(from, to),
      from,
      to,
      color: finalColor,
      documentId,
      isPending: true,
      isMemo: isMemo
    };

    console.log('새 하이라이트 추가:', newHighlight);
    const updatedHighlights = [...highlights, newHighlight];
    setHighlights(updatedHighlights);
    saveHighlights(updatedHighlights);

    // 에디터에 직접 하이라이트 효과 적용
    try {
      const highlightKey = `${newHighlight.documentId}-${newHighlight.clientId}`;
      if (!appliedHighlightIdsRef.current.has(highlightKey)) {
        editorRef.current.dispatch({
          effects: addHighlightEffect.of(newHighlight)
        });
        appliedHighlightIdsRef.current.add(highlightKey);
        console.log('하이라이트 효과 적용 성공');
        return true;
      } else {
        console.log('이미 적용된 하이라이트 건너뜀:', newHighlight.clientId);
        return false;
      }
    } catch (error) {
      console.error('하이라이트 효과 적용 중 오류:', error);
      return false;
    }
  };

  return {
    highlights,
    highlightExtensions,
    addHighlight,
    highlightTheme
  };
}

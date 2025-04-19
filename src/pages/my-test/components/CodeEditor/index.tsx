import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { highlightSelectionMatches } from '@codemirror/search';
import '@/pages/my-test/components/CodeEditor/CodeEditor.scss';
import * as Y from 'yjs';
import { yCollab } from 'y-codemirror.next';
import { IndexeddbPersistence } from 'y-indexeddb';
import MiniMenu from '@/pages/my-test/components/MiniMenu';
import { Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { StateField, RangeSet, StateEffect } from '@codemirror/state';
import { FaNoteSticky } from "react-icons/fa6";
import ReactDOM from 'react-dom/client';

export type CodeLanguage = 'python' | 'javascript' | 'java' | 'cpp' | 'c' | 'text';
export type EditorTheme = 'light' | 'dark';

// 하이라이트 정보를 저장할 인터페이스 정의
interface Highlight {
  clientId: string;     // 프론트엔드에서 생성한 임시 ID
  id?: string;          // 백엔드에서 부여한 영구 ID (없으면 미저장 상태)
  from: number;
  to: number;
  color: string;
  documentId: string;
  isPending?: boolean;  // 백엔드 저장 대기 상태
  isMemo?: boolean;    // 메모 하이라이트 여부 추가
}

// 렌더링 카운트 디버깅용 변수
let renderCount = 0;

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: CodeLanguage;
  theme?: EditorTheme;
  readOnly?: boolean;
  documentId?: string; // 파일의 고유 ID
  userName?: string; // 사용자 이름 (커서 표시용)
}

const whiteTextExtension = EditorView.theme({
  '.cm-content': {
    color: '#ffffff'
  }
});

// 하이라이트 효과 정의
const addHighlightEffect = StateEffect.define<Highlight>();
// HEX 색상을 RGBA로 변환하는 유틸리티 함수
const hexToRgba = (hex: string, opacity: number = 0.2): string => {
  // 입력 값 유효성 검사
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    console.warn('유효하지 않은 HEX 색상:', hex);
    return `rgba(248, 255, 156, ${opacity})`; // 기본값: 노란색
  }

  try {
    // # 제거하고 RGB 값 추출
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // 유효한 RGB 값인지 확인
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error('유효하지 않은 RGB 값');
    }

    // RGBA 형식으로 반환
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } catch (error) {
    console.error('HEX에서 RGBA로 변환 중 오류:', error);
    return `rgba(248, 255, 156, ${opacity})`; // 오류 시 기본값: 노란색
  }
};

// opacity를 적용하는 함수
const getHighlightColors = (hex: string): { background: string; border?: string } => {
  return {
    background: hexToRgba(hex, 0.2), // 배경색 opacity 0.2
    // border: hexToRgba(hex, 0.2)      // 테두리 opacity 0.2
  };
};

// 메모 아이콘 렌더링을 위한 위젯 정의
class MemoIconWidget extends WidgetType {
  constructor(readonly clientId: string) { // 클릭 시 식별자를 알기 위해 clientId 받음
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    // 이 span은 아이콘의 *논리적* 위치를 잡습니다 (텍스트 흐름 내).
    // 시각적 위치 조정은 내부 컨테이너에서 수행합니다.
    span.style.position = "relative";
    span.style.display = "inline-block"; // 필요에 따라 조정
    span.style.width = "1px"; // 공간을 거의 차지하지 않도록
    span.style.height = "1em"; // 라인 높이에 맞춤
    span.style.verticalAlign = "text-bottom"; // 아이콘이 라인 아래로 너무 벗어나지 않게

    // 아이콘을 담고 시각적 위치를 조정할 내부 컨테이너
    const iconContainer = document.createElement("span");
    iconContainer.style.position = "absolute";
    iconContainer.style.left = "0px"; // 논리적 위치에서 오른쪽으로 0px
    iconContainer.style.top = "6px"; // 논리적 위치에서 위로 6px (텍스트 위에 살짝 겹치도록)
    iconContainer.style.cursor = "pointer";
    iconContainer.title = "메모 보기/편집"; // 툴팁
    iconContainer.dataset.clientId = this.clientId; // 데이터 속성으로 clientId 저장
    span.appendChild(iconContainer);

    // React 아이콘 렌더링
    const root = ReactDOM.createRoot(iconContainer);
    // 아이콘 크기 및 색상 지정
    root.render(React.createElement(FaNoteSticky, { color: '#FFFFFF', size: '0.7em' }));

    // 아이콘 클릭 이벤트 리스너 추가 (메모 내용 표시/수정 로직 연결 지점)
    iconContainer.addEventListener('click', (event) => {
      event.stopPropagation(); // 이벤트 버블링 방지
      console.log('메모 아이콘 클릭됨 - clientId:', this.clientId);
      // TODO: 여기서 clientId를 사용하여 해당 메모 데이터를 찾아 표시/수정 UI를 띄웁니다.
      // 예: showMemoPopup(this.clientId);
    });

    return span;
  }

  // 아이콘 자체에 대한 마우스 이벤트는 무시하여 텍스트 선택 방해 안 함
  ignoreEvent() {
    return true;
  }
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'python',
  theme = 'dark',
  readOnly = false,
  documentId = 'default-doc',
  userName = '익명 사용자',
}) => {
  console.log(`[디버깅] CodeEditor 컴포넌트 렌더링 #${++renderCount}, documentId: ${documentId}`);
  const ydocRef = useRef<Y.Doc | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);
  const editorRef = useRef<EditorView | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ from: number; to: number } | null>(null);
  const isDragging = useRef(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // 적용된 하이라이트 ID를 추적하기 위한 전역 Ref 추가
  const appliedHighlightIdsRef = useRef(new Set<string>());

  // 이전 documentId를 추적하는 ref 추가
  const prevDocumentIdRef = useRef<string>(documentId);

  // 하이라이트 적용 지연을 위한 플래그
  const pendingHighlightsRef = useRef<boolean>(false);

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

  // 하이라이트 스타일 정의 - 더 명확한 스타일 적용
  const highlightTheme = EditorView.baseTheme({
    '.cm-highlight': {
      backgroundColor: 'rgba(248, 255, 156, 0.2)', // 기본 배경색 투명도 증가
      borderRadius: '2px',
      padding: '0 1px',
      // border: '1px solid rgba(248, 255, 156, 0.2)', // 테두리 opacity 0.2로 변경
      transition: 'background-color 0.1s ease-in-out, border-color 0.1s ease-in-out' // 부드러운 전환 효과
    }
  });

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

            // 1. 배경 하이라이트 데코레이션 (항상 추가)
            const highlightDecoration = Decoration.mark({
              class: 'cm-highlight',
              attributes: {
                'data-client-id': clientId,
                title: isMemo ? '메모 및 하이라이트' : '하이라이트된 텍스트',
                // 메모 여부에 따라 다른 배경색 적용 가능 (여기서는 color 통일)
                style: `background-color: ${color} !important;`
              }
            }).range(from, to);
            decorationsToAdd.push(highlightDecoration);

            // 2. 메모인 경우 아이콘 위젯 추가
            if (isMemo) {
              const iconDecoration = Decoration.widget({
                widget: new MemoIconWidget(clientId), // clientId 전달
                side: 1 // 끝점(to) 오른쪽에 배치 (텍스트 방향 고려 시 중요)
              }).range(to); // 끝 위치(`to`)에 위젯 연결
              decorationsToAdd.push(iconDecoration);
              console.log('[디버깅] 메모 아이콘 위젯 데코레이션 추가:', clientId);
            }

            // 생성된 데코레이션들을 업데이트 (기존 범위 삭제 후 추가 방지)
            // 주의: 동일 위치에 데코레이션 중복 추가될 수 있으므로, 필요시 기존 데코레이션 필터링 로직 추가 고려
            highlights = highlights.update({
              add: decorationsToAdd,
              // filter: (f, t, value) => value.spec.attributes?.['data-client-id'] !== clientId // 기존 동일 clientId 데코 삭제 (옵션)
            });
          }
          // TODO: 하이라이트/메모 삭제 로직 추가 필요 (StateEffect.define으로 삭제 효과 정의)
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

      // 플러그인 초기화 시간 기록 (디버깅용)
      const initTime = Date.now();
      console.log(`[디버깅] 하이라이트 플러그인 초기화 시간: ${initTime}`);

      // 초기 로드된 하이라이트 적용 (한 번만 실행되도록)
      let isInitialLoadApplied = false;

      setTimeout(() => {
        // 이미 적용되었으면 중복 적용 방지
        if (isInitialLoadApplied) {
          console.log('[디버깅] 이미 초기 하이라이트가 적용되었습니다.');
          return;
        }

        console.log('[디버깅] 하이라이트 적용 타이머 실행');

        loadedHighlights.forEach(highlight => {
          if (highlight.documentId === documentId) {
            // 중복 적용 방지 - 전역 적용 상태 확인
            const highlightKey = `${highlight.documentId}-${highlight.clientId}`;
            if (!appliedHighlightIdsRef.current.has(highlightKey)) {
              console.log('[디버깅] 하이라이트 적용:', highlight.clientId, `(${highlight.from}-${highlight.to}), isMemo: ${!!highlight.isMemo}`);
              view.dispatch({
                effects: addHighlightEffect.of({
                  ...highlight,
                  // 로드 시 isMemo가 없으면 false로 기본값 설정
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
      }, 100); // 약간의 지연 후 적용

      return {
        update(update: ViewUpdate) {
          // 스크롤이나 다른 뷰 업데이트 시 필요한 로직 추가 가능
          if (update.docChanged) {
            console.log('[디버깅] 문서가 변경되었습니다');
            // TODO: 문서 변경 시 하이라이트/메모 위치 재조정 필요 (DecorationSet의 map으로 처리됨)
          }
          if (update.viewportChanged) {
            // console.log('[디버깅] 뷰포트 변경됨 (스크롤 등)');
          }
        }
      };
    });

    return [highlightField, highlightPlugin];
  };

  useEffect(() => {
    // 로컬 세션에서만 작동하는 Yjs 설정
    if (!readOnly) {
      // 새 Y.Doc 인스턴스 생성
      const ydoc = new Y.Doc();
      ydocRef.current = ydoc;

      // IndexedDB에 변경사항 저장
      const persistence = new IndexeddbPersistence(documentId, ydoc);
      persistenceRef.current = persistence;

      // 연결 상태 확인
      persistence.on('synced', () => {
        console.log('콘텐츠가 IndexedDB와 동기화되었습니다');
      });

      // 컴포넌트 언마운트시 정리
      return () => {
        if (ydocRef.current) {
          ydocRef.current.destroy();
        }
      };
    }
  }, [documentId, readOnly]);

  // 하이라이트 정보 로드 - 컴포넌트 마운트와 documentId 변경 시에만 실행
  useEffect(() => {
    console.log(`[디버깅] 하이라이트 로드 useEffect 실행 - documentId: ${documentId}`);

    // 로컬 스토리지에서 하이라이트 불러오기
    const loadedHighlights = loadHighlights();
    console.log(`[디버깅] 초기 로드된 하이라이트 개수:`, loadedHighlights.length);

    // 하이라이트 목록 초기화
    const uniqueHighlights = removeDuplicateHighlights(loadedHighlights);

    console.log('[디버깅] 초기 하이라이트 로드 (중복 제거 후):', uniqueHighlights.length);
    setHighlights(uniqueHighlights);
  }, [documentId]);

  // 에디터에 하이라이트를 직접 적용하는 함수 수정
  const applyHighlightsToEditor = React.useCallback(() => {
    if (!editorRef.current) {
      console.log('[디버깅] 에디터 참조가 없어 하이라이트를 적용할 수 없습니다.');
      return;
    }

    console.log(`[디버깅] 에디터에 하이라이트 적용 시작 - documentId: ${documentId}`);

    // 현재 문서 ID에 해당하는 하이라이트만 필터링
    const currentHighlights = highlights.filter(h => h.documentId === documentId);
    console.log(`[디버깅] 현재 documentId(${documentId})에 해당하는 하이라이트 개수:`, currentHighlights.length);

    if (currentHighlights.length === 0) {
      console.log('[디버깅] 적용할 하이라이트가 없습니다.');
      return;
    }

    // 하이라이트 적용
    currentHighlights.forEach(highlight => {
      // 전역 적용 상태 확인으로 중복 적용 방지
      const highlightKey = `${highlight.documentId}-${highlight.clientId}`;
      if (appliedHighlightIdsRef.current.has(highlightKey)) {
        console.log('[디버깅] 이미 적용된 하이라이트 건너뜀:', highlight.clientId);
        return;
      }

      try {
        console.log('[디버깅] 하이라이트 적용:', highlight.clientId, `(${highlight.from}-${highlight.to})`);
        editorRef.current?.dispatch({
          effects: addHighlightEffect.of(highlight)
        });
        appliedHighlightIdsRef.current.add(highlightKey);
      } catch (error) {
        console.error('[오류] 하이라이트 적용 중 오류 발생:', error);
      }
    });

    console.log('[디버깅] 하이라이트 적용 완료. 총 적용된 개수:', appliedHighlightIdsRef.current.size);
  }, [highlights, documentId]);

  // documentId가 변경될 때 하이라이트 다시 적용
  useEffect(() => {
    console.log(`[디버깅] documentId 감지: ${documentId}`);

    // 실제 documentId가 변경되었을 때만 초기화 수행
    if (prevDocumentIdRef.current !== documentId) {
      console.log(`[디버깅] documentId 실제 변경 감지: ${prevDocumentIdRef.current} -> ${documentId}`);
      // documentId가 변경되면 적용된 하이라이트 상태 초기화
      appliedHighlightIdsRef.current.clear();
      console.log('[디버깅] 문서 변경으로 인해 적용된 하이라이트 상태 초기화됨');
      // 현재 documentId를 이전 값으로 업데이트
      prevDocumentIdRef.current = documentId;

      // 문서 변경 시 하이라이트 적용 플래그 설정
      pendingHighlightsRef.current = true;
      console.log('[디버깅] 하이라이트 적용 대기 플래그 설정');
    } else {
      console.log('[디버깅] documentId 변경 없음, 하이라이트 상태 유지');
    }

    // 에디터와 하이라이트가 준비되었는지 확인
    if (!editorRef.current || highlights.length === 0) {
      console.log('[디버깅] 에디터 또는 하이라이트가 준비되지 않았습니다.');
      return;
    }

    // 적용 대기 상태거나 실제 documentId 변경 시 하이라이트 적용
    if (pendingHighlightsRef.current || prevDocumentIdRef.current !== documentId) {
      console.log('[디버깅] 하이라이트 적용이 필요합니다.');

      // 약간의 지연을 주어 에디터 상태 업데이트 및 렌더링 후 하이라이트 적용
      const timer = setTimeout(() => {
        console.log('[디버깅] 하이라이트 적용 타이머 실행');
        applyHighlightsToEditor();
        // 적용 완료 후 플래그 초기화
        pendingHighlightsRef.current = false;
        console.log('[디버깅] 하이라이트 적용 대기 플래그 초기화');
      }, 1);

      return () => clearTimeout(timer);
    } else {
      console.log('[디버깅] 동일한 문서 내 상태 변경으로 하이라이트 적용 건너뜀');
    }
  }, [documentId, highlights, applyHighlightsToEditor]);

  // 에디터 준비 상태 감지를 위한 useEffect 추가
  useEffect(() => {
    // 에디터가 준비되었고, 적용 대기 상태인 하이라이트가 있는 경우
    if (editorRef.current && pendingHighlightsRef.current && highlights.length > 0) {
      console.log('[디버깅] 에디터가 준비되어 대기 중인 하이라이트 적용');

      const timer = setTimeout(() => {
        console.log('[디버깅] 에디터 준비 후 하이라이트 적용');
        applyHighlightsToEditor();
        pendingHighlightsRef.current = false;
        console.log('[디버깅] 하이라이트 적용 대기 플래그 초기화');
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [editorRef.current, highlights, applyHighlightsToEditor]);

  // 하이라이트 중복 제거 함수
  const removeDuplicateHighlights = (highlights: Highlight[]): Highlight[] => {
    console.log('[디버깅] 하이라이트 중복 제거 시작 - 원본 개수:', highlights.length);

    // clientId 기준으로 중복 제거
    const uniqueMap = new Map<string, Highlight>();

    highlights.forEach(highlight => {
      if (!uniqueMap.has(highlight.clientId)) {
        uniqueMap.set(highlight.clientId, highlight);
      } else {
        console.log('[디버깅] clientId 중복 발견:', highlight.clientId);
      }
    });

    console.log('[디버깅] clientId 기준 중복 제거 후 개수:', uniqueMap.size);

    // from, to 기준으로 중복 제거 (같은 위치에 여러 하이라이트 있는 경우)
    const positionKeys = new Set<string>();
    const result: Highlight[] = [];

    Array.from(uniqueMap.values()).forEach(highlight => {
      const posKey = `${highlight.documentId}-${highlight.from}-${highlight.to}`;
      if (!positionKeys.has(posKey)) {
        positionKeys.add(posKey);
        result.push(highlight);
      } else {
        console.log('[디버깅] 위치 중복 하이라이트 발견:', posKey);
      }
    });

    console.log('[디버깅] 최종 중복 제거 후 하이라이트 개수:', result.length);
    return result;
  };

  // 현재 선택 영역에 기반하여 메뉴 위치를 결정하는 함수
  const showMenuBasedOnSelection = React.useCallback(() => {
    const view = editorRef.current;
    if (!view) return; // 에디터 참조 없으면 종료

    const selection = view.state.selection.main;
    // 텍스트가 선택되었는지 확인
    if (!selection.empty) {
      // 드래그 방향에 따라 기준 위치 결정
      const targetPos = selection.head >= selection.anchor ? selection.to : selection.from;
      const coords = view.coordsAtPos(targetPos);

      if (coords) {
        const menuPos = {
          x: coords.left,
          y: coords.bottom + 5 // 좌표의 아래쪽 + 약간의 여백
        };

        console.log('텍스트 선택됨:', view.state.sliceDoc(selection.from, selection.to));
        console.log('선택 범위:', selection.from, selection.to);
        console.log('드래그 방향:', selection.head >= selection.anchor ? '정방향' : '역방향');
        console.log('메뉴 위치 (뷰포트 기준):', menuPos);

        setMenuPosition(menuPos);
        setSelectedRange({ from: selection.from, to: selection.to });
      } else {
        console.log('선택된 위치의 좌표를 계산할 수 없습니다.');
        setMenuPosition(null); // 좌표 계산 불가 시 메뉴 숨김
      }
    } else {
      // 선택이 해제되면 메뉴 숨김 (예: 빈 공간 클릭)
      setMenuPosition(null);
    }
  }, []);

  // 전역 mouseup 이벤트 리스너 설정
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging.current) {
        // 약간의 지연을 주어 CodeMirror 상태 업데이트를 기다림
        setTimeout(() => {
          showMenuBasedOnSelection();
        }, 0);
        isDragging.current = false; // 드래그 상태 종료
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    console.log('[디버깅] 전역 mouseup 리스너 추가');

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      console.log('[디버깅] 전역 mouseup 리스너 제거');
    };
  }, [showMenuBasedOnSelection]);

  // 문서 클릭 시 메뉴 닫기 이벤트 핸들러
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuPosition(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMouseDown = (_event: MouseEvent, _view: EditorView) => {
    isDragging.current = true;
  };

  // 하이라이트 버튼 클릭 핸들러 수정
  const handleHighlight = (color: string) => {
    console.log('하이라이트 버튼 클릭됨');
    if (selectedRange && editorRef.current) {
      const { from, to } = selectedRange;

      // 중복 하이라이트 확인
      const isDuplicate = highlights.some(h =>
        h.documentId === documentId &&
        h.from === from &&
        h.to === to
      );

      if (isDuplicate) {
        console.log('이미 하이라이트된 범위입니다');
        setMenuPosition(null); // 메뉴 닫기
        return;
      }

      // 적용될 색상에 투명도 적용
      const colors = getHighlightColors(color);
      console.log('적용될 색상 (배경):', colors.background);

      // 새 하이라이트 생성 (isMemo: false 명시)
      const newHighlight: Highlight = {
        clientId: generateClientId(from, to),
        from,
        to,
        color: colors.background, // 투명도가 적용된 배경색 사용
        documentId,
        isPending: true, // 백엔드 저장 대기 상태 (미래 확장성)
        isMemo: false // 일반 하이라이트는 isMemo: false
      };

      console.log('새 하이라이트 추가:', newHighlight);
      const updatedHighlights = [...highlights, newHighlight];
      setHighlights(updatedHighlights);
      saveHighlights(updatedHighlights);

      // 에디터에 직접 하이라이트 효과 적용 (StateField가 처리)
      try {
        console.log('에디터에 하이라이트 효과 적용 시도');
        const highlightKey = `${newHighlight.documentId}-${newHighlight.clientId}`;
        if (!appliedHighlightIdsRef.current.has(highlightKey)) {
          editorRef.current?.dispatch({
            effects: addHighlightEffect.of(newHighlight)
          });
          appliedHighlightIdsRef.current.add(highlightKey);
          console.log('하이라이트 효과 적용 성공');
        } else {
          console.log('이미 적용된 하이라이트 건너뜀:', newHighlight.clientId);
        }
      } catch (error) {
        console.error('하이라이트 효과 적용 중 오류:', error);
      }
    } else {
      console.log('하이라이트 실패: 선택된 범위 또는 에디터 참조가 없음');
    }
    setMenuPosition(null); // 메뉴 닫기
  };

  // 메모 버튼 클릭 핸들러 수정
  const handleAddMemo = () => {
    console.log('메모 추가 버튼 클릭됨');
    if (selectedRange && editorRef.current) {
      const { from, to } = selectedRange;

      // 중복 메모/하이라이트 확인 (동일 범위)
      const isDuplicate = highlights.some(h =>
        h.documentId === documentId &&
        h.from === from &&
        h.to === to
      );

      if (isDuplicate) {
        console.log('이미 메모 또는 하이라이트된 범위입니다');
        setMenuPosition(null);
        return;
      }

      // 메모용 하이라이트 배경색 (약간 더 진한 노랑 또는 주황 계열 추천)
      const memoColorHex = '#FFDA63'; // 약간 진한 노랑/주황 HEX
      const memoHighlightColor = hexToRgba(memoColorHex, 0.35); // 투명도 0.35

      // 새 메모 하이라이트 생성 (isMemo: true)
      const newMemoHighlight: Highlight = {
        clientId: generateClientId(from, to),
        from,
        to,
        color: memoHighlightColor, // 메모용 배경색 적용
        documentId,
        isPending: true, // 백엔드 저장 대기 상태
        isMemo: true      // 메모 플래그 설정
      };

      console.log('새 메모 하이라이트 추가:', newMemoHighlight);
      const updatedHighlights = [...highlights, newMemoHighlight];
      setHighlights(updatedHighlights);
      saveHighlights(updatedHighlights); // 로컬 스토리지에도 isMemo 저장됨

      // 에디터에 하이라이트 및 아이콘 효과 적용 (StateField가 처리)
      try {
        console.log('에디터에 메모 하이라이트 및 아이콘 효과 적용 시도');
        const highlightKey = `${newMemoHighlight.documentId}-${newMemoHighlight.clientId}`;
        if (!appliedHighlightIdsRef.current.has(highlightKey)) {
          editorRef.current?.dispatch({
            effects: addHighlightEffect.of(newMemoHighlight)
          });
          appliedHighlightIdsRef.current.add(highlightKey);
          console.log('메모 하이라이트 및 아이콘 효과 적용 성공');
        } else {
          console.log('이미 적용된 메모/하이라이트 건너뜀:', newMemoHighlight.clientId);
        }
      } catch (error) {
        console.error('메모 하이라이트/아이콘 효과 적용 중 오류:', error);
      }
    } else {
      console.log('메모 추가 실패: 선택된 범위 또는 에디터 참조가 없음');
    }
    setMenuPosition(null); // 메뉴 닫기
  };

  const getLanguageExtension = (lang: CodeLanguage) => {
    switch (lang) {
      case 'python':
        return python();
      case 'javascript':
        return javascript();
      case 'java':
        return java();
      case 'cpp':
        return cpp();
      case 'c':
        return cpp();
      case 'text':
        return null;
      default:
        return python();
    }
  };

  const getTheme = (themeType: EditorTheme) => {
    return themeType === 'dark' ? vscodeDark : undefined;
  };

  const langExtension = getLanguageExtension(language);

  const extensions: Extension[] = [];
  if (langExtension) {
    extensions.push(langExtension);
  }

  // 같은 단어 자동 하이라이팅 비활성화
  extensions.push(highlightSelectionMatches({ highlightWordAroundCursor: false, minSelectionLength: 100 }));

  if (language === 'text') {
    extensions.push(whiteTextExtension);
  }

  // 하이라이트 테마 및 필드 추가
  extensions.push(highlightTheme);

  // 하이라이트 확장 한 번만 생성되도록 useRef 사용하기 위한 처리
  const highlightExtRef = useRef<Extension[]>([]);

  // 컴포넌트가 처음 렌더링될 때만 하이라이트 확장을 생성하도록 수정
  useEffect(() => {
    if (highlightExtRef.current.length === 0) {
      console.log('[디버깅] 하이라이트 확장 최초 생성');
      highlightExtRef.current = createHighlightExtension();
    } else {
      console.log('[디버깅] 하이라이트 확장 재사용 (중복 생성 방지)');
    }
  }, []);

  // 이미 생성된 확장 사용
  if (highlightExtRef.current.length > 0) {
    extensions.push(...highlightExtRef.current);
  } else {
    // 첫 렌더링 시에는 직접 생성 (useEffect가 아직 실행되기 전)
    const highlightExt = createHighlightExtension();
    highlightExtRef.current = highlightExt;
    extensions.push(...highlightExt);
    console.log('[디버깅] 하이라이트 확장 초기 생성');
  }

  // 마우스 이벤트 핸들러 추가
  extensions.push(
    EditorView.domEventHandlers({
      mousedown: handleMouseDown,
      // mouseup 이벤트는 더 이상 여기서 처리하지 않음 - 전역 핸들러로 이동
    }),
    EditorView.updateListener.of(update => {
      if (update.view) {
        editorRef.current = update.view;
      }
    })
  );

  // Yjs 협업 기능 추가
  if (!readOnly && ydocRef.current) {
    const ytext = ydocRef.current.getText('codemirror');

    // 초기 콘텐츠 설정 (문서가 비어있는 경우에만)
    if (ytext.length === 0 && value) {
      ytext.insert(0, value);
    }

    // 협업 확장 기능 추가
    extensions.push(
      yCollab(ytext, {
        clientID: Math.floor(Math.random() * 100000),
        username: userName,
        userColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      })
    );
  }

  return (
    <div className="code-editor-wrapper" style={{ position: 'relative' }}>
      <MiniMenu
        position={menuPosition}
        onHighlight={handleHighlight}
        onAddMemo={handleAddMemo}
      />
      <div className="code-editor-container">
        <CodeMirror
          value={!readOnly && ydocRef.current ? '' : value}
          height="100%"
          onChange={onChange}
          extensions={extensions}
          theme={getTheme(theme)}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};

export default CodeEditor;

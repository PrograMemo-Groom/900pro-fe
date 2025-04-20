import { useState, useRef, useCallback, useEffect } from 'react';
import { EditorView } from '@codemirror/view';

/**
 * useTextSelection 훅의 속성 인터페이스
 */
export interface UseTextSelectionProps {
  editorRef: React.MutableRefObject<EditorView | null>;
}

/**
 * 텍스트 선택 처리를 위한 커스텀 훅
 */
export function useTextSelection({ editorRef }: UseTextSelectionProps) {
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ from: number; to: number } | null>(null);
  const isDragging = useRef(false);

  /**
   * 현재 선택 영역에 기반하여 메뉴 위치를 결정하는 함수
   */
  const showMenuBasedOnSelection = useCallback(() => {
    const view = editorRef.current;
    if (!view) return;

    const selection = view.state.selection.main;
    // 텍스트가 선택되었는지 확인
    if (!selection.empty) {
      // 드래그 방향에 따라 기준 위치 결정
      const targetPos = selection.head >= selection.anchor ? selection.to : selection.from;
      const coords = view.coordsAtPos(targetPos);

      if (coords) {
        const menuPos = {
          x: coords.left,
          y: coords.bottom + 5
        };

        console.log('텍스트 선택됨:', view.state.sliceDoc(selection.from, selection.to));
        console.log('선택 범위:', selection.from, selection.to);
        console.log('드래그 방향:', selection.head >= selection.anchor ? '정방향' : '역방향');
        console.log('메뉴 위치 (뷰포트 기준):', menuPos);

        setMenuPosition(menuPos);
        setSelectedRange({ from: selection.from, to: selection.to });
      } else {
        console.log('선택된 위치의 좌표를 계산할 수 없습니다.');
        setMenuPosition(null);
      }
    } else {
      setMenuPosition(null);
    }
  }, [editorRef]);

  /**
   * 마우스 드래그 완료 시 메뉴 표시를 위한 전역 이벤트 리스너
   */
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging.current) {
        setTimeout(() => {
          showMenuBasedOnSelection();
        }, 0);
        isDragging.current = false;
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    console.log('[디버깅] 전역 mouseup 리스너 추가');

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      console.log('[디버깅] 전역 mouseup 리스너 제거');
    };
  }, [showMenuBasedOnSelection]);

  /**
   * 문서 클릭 시 메뉴 닫기 이벤트 처리
   */
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuPosition(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * 마우스 드래그 시작 감지 핸들러
   */
  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const editorEventHandlers = {
    mousedown: handleMouseDown
  };

  return {
    menuPosition,
    setMenuPosition,
    selectedRange,
    editorEventHandlers
  };
}

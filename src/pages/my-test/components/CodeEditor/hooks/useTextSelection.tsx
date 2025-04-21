import { useState, useRef, useCallback, useEffect } from 'react';
import { UseTextSelectionProps } from '@/pages/my-test/components/CodeEditor/types/types';

/**
 * 텍스트 선택 처리를 위한 커스텀 훅
 */
export function useTextSelection({ editorRef }: UseTextSelectionProps) {
  // 상태 및 참조
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
      // 선택된 영역이 하이라이트 영역인지 확인
      try {
        // 선택 끝점의 위치에 있는 요소 확인
        const pos = view.coordsAtPos(selection.to);
        if (pos) {
          // 해당 위치에서 DOM 요소 찾기
          const element = document.elementFromPoint(pos.left, pos.top);
          // 하이라이트 요소인지 확인
          if (element && (
              element.classList.contains('cm-highlight') ||
              element.closest('.cm-highlight')
            )) {
            console.log('하이라이트된 영역을 선택했습니다. 메뉴를 표시하지 않습니다.');
            setMenuPosition(null);
            return;
          }
        }
      } catch (e) {
        console.error('선택 영역 확인 중 오류:', e);
      }

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
   * 마우스 드래그 시작 감지 핸들러
   */
  const handleMouseDown = () => {
    isDragging.current = true;
  };

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

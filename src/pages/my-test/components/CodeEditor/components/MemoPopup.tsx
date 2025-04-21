import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';
import { throttle } from 'lodash';

export interface MemoPopupProps {
  position: { top: number; left: number };
  clientId: string;
  content?: string;
  backgroundColor?: string;
  onClose: () => void;
  onSave?: (clientId: string, content: string) => void;
}

/**
 * 포스트잇 형태의 메모 팝업 컴포넌트
 */
const MemoPopup: React.FC<MemoPopupProps> = ({
  position,
  clientId,
  content: initialContent = '',
  backgroundColor,
  onClose,
  onSave
}) => {
  const [content, setContent] = useState(initialContent);
  const [isEditing] = useState(true); // 항상 편집 모드로 시작
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 팝업 DOM 요소 참조
  const popupRef = useRef<HTMLDivElement>(null);

  // 컴포넌트 마운트 시 로그
  useEffect(() => {
    console.log('[디버깅] MemoPopup 컴포넌트 마운트됨:', { clientId, position });
  }, []);

  // 쓰로틀링된 저장 함수 (1초 간격)
  const throttledSave = useCallback(
    throttle((clientIdToSave: string, contentToSave: string) => {
      if (onSave) {
        console.log('[디버깅] 자동 저장 (throttle):', clientIdToSave);
        try {
          onSave(clientIdToSave, contentToSave);
        } catch (error) {
          console.error('[오류] 메모 저장 중 오류 발생:', error);
          // 여기에 필요시 추가적인 오류 처리 로직 구현 가능
        }
      }
    }, 1000, { leading: false, trailing: true }), // 옵션: 타이핑 시작 시점이 아닌 끝날 때 저장
    [onSave] // onSave 함수가 변경될 때만 쓰로틀 함수 재생성
  );

  // 내용 변경 핸들러
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent); // 로컬 상태 즉시 업데이트

    // 안전한 쓰로틀 함수 호출
    if (throttledSave && typeof throttledSave === 'function') {
      throttledSave(clientId, newContent);
    }
  };

  // 외부 클릭 감지 및 닫을 때 저장 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        console.log('[디버깅] 외부 클릭 감지, 팝업 닫기 및 저장');
        if (onSave) {
          // 안전한 쓰로틀 취소
          if (throttledSave && typeof throttledSave.cancel === 'function') {
            throttledSave.cancel();
          }

          try {
            onSave(clientId, content);
          } catch (error) {
            console.error('[오류] 메모 닫기 중 저장 실패:', error);
          }
        }
        onClose(); // 외부 클릭 시 팝업 닫기
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // 컴포넌트 언마운트 시 쓰로틀링된 함수 안전하게 취소
      if (throttledSave && typeof throttledSave.cancel === 'function') {
        throttledSave.cancel();
      }
    };
    // throttledSave는 의존성 배열에서 제거하여 순환 참조 방지
  }, [clientId, content, onSave, onClose]);

  // 팝업이 화면을 벗어나지 않도록 위치 조정
  useEffect(() => {
    if (popupRef.current) {
      const popup = popupRef.current;
      const rect = popup.getBoundingClientRect();

      // 에디터 DOM 요소 찾기
      const editorContainer = popup.closest('.code-editor-container') || popup.parentElement;
      if (!editorContainer) return;

      const editorRect = editorContainer.getBoundingClientRect();

      // 에디터 내부 경계 계산
      const editorWidth = editorRect.width;
      const editorHeight = editorRect.height;

      // 에디터 오른쪽 경계를 넘어가는지 확인
      if (position.left + rect.width > editorWidth - 20) {
        popup.style.left = `${editorWidth - rect.width - 20}px`;
      }

      // 에디터 아래쪽 경계를 넘어가는지 확인
      if (position.top + rect.height > editorHeight - 20) {
        popup.style.top = `${editorHeight - rect.height - 20}px`;
      }
    }
  }, [position]);

  // 편집 모드에서 자동으로 텍스트 영역에 포커스
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // 닫기 버튼 클릭 핸들러
  const handleClose = () => {
    console.log('[디버깅] 닫기 버튼 클릭');
    if (onSave) {
      // 안전한 쓰로틀 취소
      if (throttledSave && typeof throttledSave.cancel === 'function') {
        throttledSave.cancel();
      }

      try {
        onSave(clientId, content); // 닫기 전에 마지막 내용 저장
      } catch (error) {
        console.error('[오류] 닫기 버튼 클릭 시 저장 실패:', error);
      }
    }
    onClose();
  };

  // 배경색의 투명도를 1로 만드는 함수
  const getOpaqueColor = (rgbaColor: string | undefined): string => {
    if (!rgbaColor || !rgbaColor.startsWith('rgba')) {
      return '#fff7a5'; // 기본 노란색으로 폴백
    }
    try {
      const match = rgbaColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const [, r, g, b] = match;
        return `rgba(${r}, ${g}, ${b}, 1)`;
      } else {
        return '#fff7a5'; // 파싱 실패 시 폴백
      }
    } catch (error) {
      console.error('메모 팝업 배경색 파싱 오류:', error);
      return '#fff7a5'; // 오류 발생 시 폴백
    }
  };

  // 불투명한 배경색 계산
  const opaqueBackgroundColor = getOpaqueColor(backgroundColor);
  const headerBackgroundColor = opaqueBackgroundColor; // 헤더도 동일한 색상 사용 (필요시 조정)

  const styles = {
    memoPopup: {
      position: 'absolute' as const,
      top: `${position.top}px`,
      left: `${position.left}px`,
      zIndex: 9999,
      width: '220px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      fontSize: '14px',
      transition: 'transform 0.2s ease-in-out',
      pointerEvents: 'auto' as const,
      transformOrigin: 'top left',
      backfaceVisibility: 'hidden' as const,
      willChange: 'transform' as const
    },
    memoPopupContent: {
      backgroundColor: opaqueBackgroundColor,
      borderRadius: '4px',
      overflow: 'hidden' as const,
      display: 'flex' as const,
      flexDirection: 'column' as const,
      minHeight: '120px',
      maxHeight: '300px',
      border: '1px solid black',
      WebkitBackfaceVisibility: 'hidden' as const,
      WebkitTransform: 'translateZ(0)' as const
    },
    memoPopupHeader: {
      display: 'flex' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      padding: '2px 5px',
      backgroundColor: headerBackgroundColor,
      borderBottom: '1px solid black'
    },
    memoId: {
      fontWeight: 600,
      fontSize: '0.85em',
      color: 'black'
    },
    memoPopupActions: {
      display: 'flex' as const,
      gap: '4px'
    },
    memoButton: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '2px',
      borderRadius: '3px',
      color: 'black',
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const
    },
    memoPopupBody: {
      padding: '10px',
      flex: 1,
      overflowY: 'auto' as const
    },
    memoTextarea: {
      width: '100%',
      minHeight: '100px',
      backgroundColor: 'transparent',
      // border: '1px solid rgba(0, 0, 0, 1)',
      // borderRadius: '3px',
      // padding: '0px',
      border: 'none',
      outline: 'none',
      resize: 'none' as const,
      fontFamily: 'inherit',
      fontSize: 'inherit',
      color: 'black'
    },
    memoText: {
      whiteSpace: 'pre-wrap' as const,
      wordBreak: 'break-word' as const,
      color: 'black',
      cursor: 'text',
      minHeight: '100px'
    },
    memoPlaceholder: {
      color: '#555',
      fontStyle: 'italic',
      fontSize: '0.9em'
    }
  };

  return (
    <div
      ref={popupRef}
      className="memo-popup"
      style={styles.memoPopup}
    >
      <div style={styles.memoPopupContent}>
        <div style={styles.memoPopupHeader}>
          <span style={styles.memoId}>
            #{clientId.split('-').pop()?.substring(0, 4)}
            {isEditing && ' (편집중)'}
          </span>
          <div style={styles.memoPopupActions}>
            <button
              style={styles.memoButton}
              onClick={handleClose}
              title="닫기"
            >
              <FaTimes size="1em" />
            </button>
          </div>
        </div>

        <div style={styles.memoPopupBody}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="programmer's memo..."
            style={styles.memoTextarea}
          />
        </div>
      </div>
    </div>
  );
};

export default MemoPopup;

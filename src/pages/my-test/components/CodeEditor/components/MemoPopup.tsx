import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';

export interface MemoPopupProps {
  position: { top: number; left: number };
  clientId: string;
  content?: string;
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
  onClose,
  onSave
}) => {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(!initialContent); // 초기 내용이 없으면 편집 모드로 시작
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 팝업 DOM 요소 참조
  const popupRef = useRef<HTMLDivElement>(null);

  // 컴포넌트 마운트 시 로그
  useEffect(() => {
    console.log('[디버깅] MemoPopup 컴포넌트 마운트됨:', { clientId, position });
  }, []);

  // 외부 클릭 감지 이벤트 핸들러
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        // 편집 중이면 저장 처리
        if (isEditing && onSave) {
          onSave(clientId, content);
        }
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, content, clientId, onSave]);

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

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    if (onSave) {
      onSave(clientId, content);
    }
    setIsEditing(false);
  };

  // 텍스트 클릭 핸들러 - 편집 모드로 전환
  const handleTextClick = () => {
    setIsEditing(true);
  };

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
    memoPopupHover: {
      transform: 'scale(1.02)'
    },
    memoPopupContent: {
      backgroundColor: '#fff7a5',
      borderRadius: '4px',
      overflow: 'hidden' as const,
      display: 'flex' as const,
      flexDirection: 'column' as const,
      minHeight: '120px',
      maxHeight: '300px',
      border: '1px solid #e6e0a0',
      WebkitBackfaceVisibility: 'hidden' as const,
      WebkitTransform: 'translateZ(0)' as const
    },
    memoPopupHeader: {
      display: 'flex' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      padding: '8px 10px',
      backgroundColor: '#fff389',
      borderBottom: '1px solid #e6e0a0'
    },
    memoId: {
      fontWeight: 600,
      fontSize: '0.85em',
      color: '#7d7a44'
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
      color: '#7d7a44',
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const
    },
    memoButtonHover: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      color: '#454236'
    },
    closeButtonHover: {
      color: '#e53935'
    },
    saveButtonHover: {
      color: '#2e7d32'
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
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '3px',
      padding: '8px',
      resize: 'vertical' as const,
      fontFamily: 'inherit',
      fontSize: 'inherit',
      color: '#454236'
    },
    memoText: {
      whiteSpace: 'pre-wrap' as const,
      wordBreak: 'break-word' as const,
      color: '#454236',
      cursor: 'text',
      minHeight: '100px'
    },
    memoPlaceholder: {
      color: '#84817a',
      fontStyle: 'italic',
      fontSize: '0.9em'
    }
  };

  return (
    <div
      ref={popupRef}
      className="memo-popup"
      style={styles.memoPopup}
      onMouseOver={() => {
        if (popupRef.current) {
          popupRef.current.style.transform = 'scale(1.02)';
        }
      }}
      onMouseOut={() => {
        if (popupRef.current) {
          popupRef.current.style.transform = 'scale(1)';
        }
      }}
    >
      <div style={styles.memoPopupContent}>
        <div style={styles.memoPopupHeader}>
          <span style={styles.memoId}>메모 #{clientId.split('-').pop()?.substring(0, 4)}</span>
          <div style={styles.memoPopupActions}>
            {isEditing && onSave && (
              <button
                style={styles.memoButton}
                onClick={handleSave}
                title="저장"
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.color = '#2e7d32';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#7d7a44';
                }}
              >
                <FaSave size="1em" />
              </button>
            )}
            <button
              style={styles.memoButton}
              onClick={onClose}
              title="닫기"
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.color = '#e53935';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#7d7a44';
              }}
            >
              <FaTimes size="1em" />
            </button>
          </div>
        </div>

        <div style={styles.memoPopupBody}>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="메모를 입력하세요..."
              style={styles.memoTextarea}
            />
          ) : (
            <div style={styles.memoText} onClick={handleTextClick}>
              {content || <span style={styles.memoPlaceholder}>내용이 없습니다. 클릭하여 메모를 추가하세요.</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoPopup;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamViewer from '@/pages/history/TeamViewer.tsx';
import Chat from '@/pages/history/Chat.tsx';
// 리덕스 코드
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import styles from '@/css/history/ChatPage.module.scss'
import searchIcon from '@/assets/Search.svg';

function ChatPage() {
  // 왼쪽 컴포넌트 상태 관리
  const navigate = useNavigate();
  const isTeamViewerOpen = useSelector((state: RootState) => state.ui.isTeamViewerOpen);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchClick = () => {
    setIsSearchOpen((prev) => !prev); // 누를 때마다 열리고 닫힘
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchTerm((e.target as HTMLInputElement).value);
    }
  };

  return (
    <main>
      <div className={styles.header}>
        <h1 onClick={() => navigate('/')}>9BACKPRO</h1>
        <img src={searchIcon} 
        onClick={handleSearchClick}
        alt='검색'/>
      </div>

      <div className={styles.search_area}>
        {isSearchOpen && (
          <input 
              type="text" 
              placeholder="검색어를 입력하세요" 
              className={styles.search_input} 
              onKeyDown={handleSearchKeyDown}
          />
        )}
      </div>

      <div className={styles.chat_container}>
          {isTeamViewerOpen && (
          <div className={styles.team_viewer}>
            <TeamViewer />
          </div>
          )}

          <div className={styles.chat}>
            <Chat searchTerm={searchTerm} />
          </div>
      </div>
    </main>
  )
}

export default ChatPage;
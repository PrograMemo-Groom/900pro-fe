import styles from '@/css/history/ChatPage.module.scss'
import TeamViewer from '@/pages/history/TeamViewer.tsx';
import Chat from '@/pages/history/Chat.tsx';
// 리덕스 코드
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

function ChatPage() {
  // 왼쪽 컴포넌트 상태 관리
  const isTeamViewerOpen = useSelector((state: RootState) => state.ui.isTeamViewerOpen);

  return (
    <div className={styles.chat_container}>
        {isTeamViewerOpen && (
        <div className={styles.team_viewer}>
          <TeamViewer />
        </div>
        )}

        <div className={styles.chat}>
          <Chat />
        </div>
    </div>
  )
}

export default ChatPage;
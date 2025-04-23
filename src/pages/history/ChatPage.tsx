import { useState } from 'react'
import styles from '@/css/history/ChatPage.module.scss'
import TeamViewer from '@/pages/history/TeamViewer.tsx';
import Chat from '@/pages/history/Chat.tsx';

function ChatPage() {
  // 왼쪽 컴포넌트 상태 관리
  const [isTeamViewerOpen, setIsTeamViewerOpen] = useState(false);

  return (
    <div className={styles.chat_container}>
        {isTeamViewerOpen && (
        <div className={styles.team_viewer}>
          <TeamViewer />
        </div>
        )}

        <div className={styles.chat}>
            <Chat 
            isTeamViewerOpen={isTeamViewerOpen}
            onShowTeamViewer={() => setIsTeamViewerOpen(true)} />
        </div>
    </div>
  )
}

export default ChatPage;
import React from 'react';
import styles from '@/pages/my-test/components/TeamCodeView.module.scss';
import CodeEditor from '@/pages/my-test/components/CodeEditor';
import { TeamMember } from '@/pages/my-test/data/teamMembers';

interface TeamCodeViewProps {
  currentMemberIndex: number;
  currentMember: TeamMember;
  teamMembersCount: number;
  goToPreviousMember: () => void;
  goToNextMember: () => void;
}

const TeamCodeView: React.FC<TeamCodeViewProps> = ({
  currentMemberIndex,
  currentMember,
  teamMembersCount,
  goToPreviousMember,
  goToNextMember
}) => {
  return (
    <div className={styles['team-code-content']}>
      <div className={styles['member-navigation']}>
        <button className={`${styles['nav-button']} ${styles.prev}`} onClick={goToPreviousMember}>
          &lt;
        </button>
        <div className={styles['member-indicator']}>
          {currentMemberIndex + 1} / {teamMembersCount}
        </div>
        <button className={`${styles['nav-button']} ${styles.next}`} onClick={goToNextMember}>
          &gt;
        </button>
      </div>
      <div className={`${styles['member-code-item']} ${styles.active}`}>
        <div className={styles['member-name']}>{currentMember.name} 님의 코드</div>
        <div className={styles['code-preview']}>
          <CodeEditor
            value={currentMember.code}
            onChange={() => {}} // 읽기 전용이므로 onChange는 빈 함수
            language={currentMember.language}
            readOnly={true}
            documentId={`team-code-${currentMember.name}`}
            userName="관찰자"
          />
        </div>
      </div>
    </div>
  );
};

export default TeamCodeView;

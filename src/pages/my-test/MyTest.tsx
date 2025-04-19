import React, { useState } from 'react';
import '@/pages/my-test/MyTest.scss';
import { teamMembers } from '@/pages/my-test/data/teamMembers';
import TabSelector, { TabType } from '@/pages/my-test/components/TabSelector';
import ProblemView from '@/pages/my-test/components/ProblemView';
import TeamCodeView from '@/pages/my-test/components/TeamCodeView';
import useTeamNavigation from '@/pages/my-test/hooks/useTeamNavigation';

const MyTest: React.FC = () => {
  // 현재 선택된 탭 상태 관리
  const [activeTab, setActiveTab] = useState<TabType>('teamCode');

  // 팀원 네비게이션 로직 훅 사용
  const {
    currentMemberIndex,
    currentMember,
    goToPreviousMember,
    goToNextMember
  } = useTeamNavigation({ teamMembers });

  return (
    <div className="my-test-container">
      <div className="left-section">
        <TabSelector
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="tab-content">
          {activeTab === 'problem' ? (
            <ProblemView />
          ) : (
            <TeamCodeView
              currentMemberIndex={currentMemberIndex}
              currentMember={currentMember}
              teamMembersCount={teamMembers.length}
              goToPreviousMember={goToPreviousMember}
              goToNextMember={goToNextMember}
            />
          )}
        </div>
      </div>

      <div className="chat-container">
        {/* 채팅 기능 구현 예정 */}
      </div>
    </div>
  );
};

export default MyTest;

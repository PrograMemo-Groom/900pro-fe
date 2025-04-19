import { useState, useCallback } from 'react';
import { TeamMember } from '@/pages/my-test/data/teamMembers';

interface UseTeamNavigationProps {
  teamMembers: TeamMember[];
}

interface UseTeamNavigationReturn {
  currentMemberIndex: number;
  currentMember: TeamMember;
  goToPreviousMember: () => void;
  goToNextMember: () => void;
}

const useTeamNavigation = ({ teamMembers }: UseTeamNavigationProps): UseTeamNavigationReturn => {
  const [currentMemberIndex, setCurrentMemberIndex] = useState<number>(0);

  // 현재 선택된 팀원
  const currentMember = teamMembers[currentMemberIndex];

  // 이전 팀원으로 이동
  const goToPreviousMember = useCallback(() => {
    setCurrentMemberIndex((prevIndex) =>
      prevIndex === 0 ? teamMembers.length - 1 : prevIndex - 1
    );
  }, [teamMembers.length]);

  // 다음 팀원으로 이동
  const goToNextMember = useCallback(() => {
    setCurrentMemberIndex((prevIndex) =>
      (prevIndex + 1) % teamMembers.length
    );
  }, [teamMembers.length]);

  return {
    currentMemberIndex,
    currentMember,
    goToPreviousMember,
    goToNextMember
  };
};

export default useTeamNavigation;

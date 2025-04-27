// 팀뷰어 (왼쪽 패널)
import { fetchMemberCode, fetchTeamMembers } from '@/api/historyApi';
import styles from '@/css/history/TeamView/TeamView.module.scss';
import { CodeLanguage } from '@/pages/history/codeeditor/types/types';
import TeamCode from '@/pages/history/TeamCode';
import TeamProb from '@/pages/history/TeamProb';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

// 팀원 코드 타입 정의
interface MemberCode {
  userId: number;
  userName: string;
  code: string;
  language: CodeLanguage;
}

// 팀원 정보 타입 정의
interface TeamMember {
  userId: number;
  userName: string;
  leader: boolean;
}

export default function TeamViewer() {
  // nav 선택
  const [whatActiveNav, setWhatActiveNav] = useState<'prob' | 'code'>('prob');
  // 리덕스에서 문제 꺼내오기
  const problemList = useSelector((state: RootState) => state.historyProblem.problems);
  // 테스트 ID 가져오기
  const testId = useSelector((state: RootState) => state.teamain.testId);
  // 팀 ID 가져오기
  const teamId = useSelector((state: RootState) => state.auth.user.teamId);

  // 문제 번호 선택
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  // 선택된 문제 객체 찾기 (이제 id로 찾기)
  const selected = problemList.find((q) => q.id === selectedQuestion);

  // 팀원 코드 관련 상태
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState<number>(0);
  const [memberCode, setMemberCode] = useState<MemberCode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 컴포넌트 마운트 시 디버깅 정보 출력
  useEffect(() => {
    console.log('=== TeamViewer 컴포넌트 마운트 ===');
    console.log('Redux 상태:', { problemList, testId, teamId });
  }, []);

  useEffect(() => {
    if (problemList.length > 0 && selectedQuestion === null) {
      // baekNum 대신 id 사용
      setSelectedQuestion(problemList[0].id);
      console.log('초기 문제 선택 (id):', problemList[0].id);
      console.log('문제 객체 전체:', problemList[0]);
    }
  }, [problemList]);

  // 문제 변경 시 팀원 목록 가져오기
  useEffect(() => {
    console.log('문제 또는 팀 ID 변경됨:', { teamId, selectedQuestion });
    if (teamId && selectedQuestion) {
      console.log('팀원 목록 가져오기 시작');
      fetchTeamMembersData();
    }
  }, [teamId, selectedQuestion]);

  // 선택된 팀원이 변경되면 코드 가져오기
  useEffect(() => {
    console.log('팀원 인덱스 변경됨:', currentMemberIndex);
    console.log('팀원 목록 상태:', teamMembers);

    if (teamMembers.length > 0 && selectedQuestion) {
      const currentMember = teamMembers[currentMemberIndex];
      console.log('현재 선택된 팀원:', currentMember);
      console.log('팀원 코드 가져오기 시작:', teamId);
      fetchMemberCodeData();
    } else {
      console.log('팀원 코드를 가져올 수 없음:', {
        teamMembersLength: teamMembers.length,
        selectedQuestion
      });
    }
  }, [currentMemberIndex, selectedQuestion, teamMembers]);

  // memberCode 상태 변경 감지
  useEffect(() => {
    console.log('memberCode 상태 변경됨:', memberCode);
  }, [memberCode]);

  // 팀원 목록 가져오기 함수
  const fetchTeamMembersData = async () => {
    if (!teamId) {
      console.log('팀 ID가 없어 팀원 목록을 가져올 수 없음');
      return;
    }

    console.log('팀원 목록 API 호출 시작:', teamId);
    try {
      // API 호출 - teamId로 팀 멤버 정보 가져오기
      const response = await fetchTeamMembers(teamId);
      console.log('팀원 목록 API 응답:', response);

      // 응답 확인 및 처리
      if (response && response.data) {
        console.log('팀원 목록 API 응답 데이터:', response.data);
        // members 배열에서 팀원 정보 추출
        const members = response.data.members || [];
        console.log('추출된 팀원 목록:', members);

        if (members.length > 0) {
          console.log('팀원 목록 설정:', members);
          setTeamMembers(members);
          setCurrentMemberIndex(0);
        } else {
          console.warn('팀원 목록이 비어있습니다.');
          setTeamMembers([]);
        }
      } else {
        console.error('팀원 목록을 가져오지 못했습니다.');
        console.log('응답 데이터:', response);
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('팀원 목록을 가져오는 중 오류 발생:', error);
      setTeamMembers([]);
    }
  };

  // 팀원 코드 가져오기 함수
  const fetchMemberCodeData = async () => {
    if (!testId || !selectedQuestion || teamMembers.length === 0) {
      console.log('팀원 코드를 가져올 수 없음:', { testId, selectedQuestion, teamMembersLength: teamMembers.length });
      return;
    }

    setIsLoading(true);
    try {
      const member = teamMembers[currentMemberIndex];
      const userId = member.userId;
      console.log('API 호출 정보:', { testId, selectedQuestion, userId, userName: member.userName });

      // API 호출
      console.log('팀원 코드 API 호출 시작');
      const response = await fetchMemberCode(testId, selectedQuestion, userId);
      console.log('팀원 코드 API 응답:', response);

      // API 응답 구조 변경에 맞게 수정
      if (response && response.success) {
        console.log('팀원 코드 API 성공 응답:', response);

        // 실제 코드 데이터 추출
        const codeData = response.data?.code || {};
        console.log('추출된 코드 데이터:', codeData);

        // 코드가 있는 경우 (상태가 ABSENT가 아닌 경우)
        const language = codeData.language || 'javascript';
        const code = codeData.submitCode || '// 코드가 없습니다.';
        const codeStatus = codeData.status || 'UNKNOWN';

        // 코드 상태에 따른 메시지 설정
        let displayCode = code;
        if (codeStatus === 'ABSENT') {
          displayCode = `// 해당 사용자는 이 문제를 풀지 않았습니다.\n// 상태: ${codeStatus}`;
        } else if (code.trim() === '') {
          displayCode = `// 코드가 비어있습니다.\n// 상태: ${codeStatus}`;
        }

        const dummyData: MemberCode = {
          userId,
          userName: member.userName,
          code: displayCode,
          language: language.toLowerCase() as CodeLanguage
        };
        console.log('설정할 memberCode:', dummyData);

        setMemberCode(dummyData);
      } else {
        console.error('코드를 가져오지 못했습니다:', response?.message);
        console.log('응답 데이터:', response);

        // 오류 상태에도 더미 데이터 표시
        const dummyData: MemberCode = {
          userId: member.userId,
          userName: member.userName,
          code: `// 백준 ${selectedQuestion} 문제 풀이 (더미 데이터)\n// 서버에서 코드를 가져오는 중 오류가 발생했습니다.\n// 이유: ${response?.message || '알 수 없는 오류'}\n// 백엔드 API가 완성되면 실제 코드가 표시됩니다.`,
          language: 'javascript'
        };
        setMemberCode(dummyData);
      }
    } catch (error) {
      console.error('팀원 코드를 가져오는 중 오류 발생:', error);

      // 서버 오류 시에도 더미 데이터 표시 (사용자 경험 향상)
      try {
        const member = teamMembers[currentMemberIndex];
        const dummyData: MemberCode = {
          userId: member.userId,
          userName: member.userName,
          code: `// 백준 ${selectedQuestion} 문제 풀이 (더미 데이터)\n// 서버에서 코드를 가져오는 중 오류가 발생했습니다.\n// 백엔드 API가 완성되면 실제 코드가 표시됩니다.`,
          language: 'javascript'
        };
        setMemberCode(dummyData);
      } catch (innerError) {
        setMemberCode(null);
      }
    } finally {
      console.log('코드 로딩 완료, isLoading 상태 변경');
      setIsLoading(false);
    }
  };

  // API 호출을 통해 이전/다음 사용자로 이동하는 함수
  const goToPreviousMember = () => {
    if (teamMembers.length === 0) {
      console.log('팀원이 없어 이전 멤버로 이동할 수 없음');
      return;
    }

    console.log('이전 팀원으로 이동');
    setCurrentMemberIndex((prevIndex) => {
      // 이전 인덱스로 순환
      const newIndex = prevIndex > 0 ? prevIndex - 1 : teamMembers.length - 1;
      console.log(`인덱스 변경: ${prevIndex} -> ${newIndex}`);
      return newIndex;
    });
  };

  const goToNextMember = () => {
    if (teamMembers.length === 0) {
      console.log('팀원이 없어 다음 멤버로 이동할 수 없음');
      return;
    }

    console.log('다음 팀원으로 이동');
    setCurrentMemberIndex((prevIndex) => {
      // 다음 인덱스로 순환
      const newIndex = (prevIndex + 1) % teamMembers.length;
      console.log(`인덱스 변경: ${prevIndex} -> ${newIndex}`);
      return newIndex;
    });
  };

  // 현재 선택된 팀원 이름 표시
  // 4/27 github actions 빌드 때문에 주석 처리
  // const currentMemberName = teamMembers.length > 0 && currentMemberIndex < teamMembers.length
  //   ? teamMembers[currentMemberIndex].userName
  //   : '';

  // 렌더링 시 디버깅 로그
  console.log('TeamViewer 렌더링:', {
    whatActiveNav,
    selectedQuestion,
    teamMembersCount: teamMembers.length,
    currentMemberIndex,
    hasMemberCode: !!memberCode,
    isLoading
  });

  return (
    <main>
      <section className={styles.button_container}>
        {problemList.map((q) => (
          <button
            key={q.id} // baekNum 대신 id 사용
            className={`${styles.q_button} ${selectedQuestion === q.id ? styles.active : ''}`}
            onClick={() => setSelectedQuestion(q.id)} // baekNum 대신 id 사용
          >
            #{q.baekNum} {/* 표시는 여전히 baekNum 사용 */}
          </button>
        ))}
      </section>

      <nav className={styles.nav_container}>
        <p onClick={()=> setWhatActiveNav('prob')}
          className={whatActiveNav === 'prob' ? styles.active : ''}
          >문제 보기</p>
        <div></div>
        <p onClick={()=> setWhatActiveNav('code')}
          className={whatActiveNav === 'code' ? styles.active : ''}
          >팀원 코드</p>
      </nav>

      {/* 여기부터 컴포넌트입니다 */}
      <section className={styles.code_container}>
        {whatActiveNav === 'prob' && selected && <TeamProb question={selected} />}

        {/* 팀원 코드 컴포넌트 */}
        {whatActiveNav === 'code' && (
          <>
            {isLoading ? (
              <div className={styles.loading}>로딩 중...</div>
            ) : (
              <TeamCode
                memberCode={memberCode}
                problemId={selectedQuestion}
                baekNum={selected?.baekNum}
              />
            )}
          </>
        )}

        {/* 이전/다음 버튼 */}
        {whatActiveNav === 'code' && teamMembers.length > 0 && (
          <>
            <button
              className={styles.nav_button_prev}
              onClick={goToPreviousMember}
              title={`이전 팀원: ${teamMembers[(currentMemberIndex > 0 ? currentMemberIndex - 1 : teamMembers.length - 1)].userName}`}
            >
              <MdChevronLeft size={24} />
            </button>
            <div className={styles.member_indicator}>
              {`${currentMemberIndex + 1} / ${teamMembers.length}`}
            </div>
            <button
              className={styles.nav_button_next}
              onClick={goToNextMember}
              title={`다음 팀원: ${teamMembers[(currentMemberIndex + 1) % teamMembers.length].userName}`}
            >
              <MdChevronRight size={24} />
            </button>
          </>
        )}
      </section>
    </main>
  )
}

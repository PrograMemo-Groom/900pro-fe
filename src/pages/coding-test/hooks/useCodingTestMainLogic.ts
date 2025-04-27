import { submitCode, endCodingTest } from '@/api/codingTestApi';
import { useCodeExecution } from './useCodeExecution';
import { useCodePersistence } from './useCodePersistence';
import { Problem } from '@/api/codingTestApi';
import { updateUserCodingStatus } from '@/api/waitingRoomApi';
import { updatePartialUserInfo } from '@/store/auth/slices';
import { useAppDispatch } from '@/store';

interface UseCodingTestMainProps {
  testId: number;
  userId: string;
  selectedProblem: Problem | null;
  updateSubmissionStatus?: (problemId: number, submitted: boolean) => void;
}

export const useCodingTestMainLogic = ({ testId, userId, selectedProblem, updateSubmissionStatus }: UseCodingTestMainProps) => {
  const remainingTime = '';
  const { output, isRunning, processAndRunCode } = useCodeExecution();
  const {
    selectedLanguage,
    codeContent,
    handleCodeChange,
    handleLanguageChange,
    getCurrentCode
  } = useCodePersistence();
  const dispatch = useAppDispatch();

  const currentCode = getCurrentCode();

  // 코드 실행 핸들러
  const handleRunCode = () => {
    processAndRunCode(selectedLanguage, currentCode);
  };

  // 코드 제출 핸들러
  const handleSubmit = () => {
    if (!selectedProblem) {
      alert('문제를 선택해주세요.');
      return;
    }

    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    const submitData = {
      codeRequestDto: {
        testId: testId,
        problemId: selectedProblem.id,
        userId: Number(userId)
      },
      language: selectedLanguage,
      submitCode: currentCode,
      submitAt: new Date().toISOString()
    };
    console.log(submitData);

    submitCode(submitData)
      .then(response => {
        if (response.success) {
          alert(`#${selectedProblem.baekNum} 코드를 제출하였습니다.`);

          // 제출 성공 시 문제 상태 업데이트
          if (updateSubmissionStatus && selectedProblem) {
            updateSubmissionStatus(selectedProblem.id, true);
          }
        } else {
          alert(`제출 실패: ${response.message}`);
        }
      })
      .catch(error => {
        console.error('제출 중 오류 발생:', error);
        alert('코드 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
      });
  };

  // 테스트 종료 핸들러
  const handleEndTest = async () => {
    const endTestData = {
      testId: testId,
      problemId: selectedProblem?.id || 0,
      userId: Number(userId)
    };

    try {
      // console.log('⌛ 시험 종료!');
      const response = await endCodingTest(endTestData);
      if (response.success) {
        await updateUserCodingStatus(Number(userId));
        dispatch(updatePartialUserInfo({ coding: false }));
        alert('수고하셨습니다.');
      }
    } catch (error) {
      console.error('테스트 종료 중 오류 발생:', error);
      alert('테스트 종료 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return {
    output,
    isRunning,
    remainingTime,
    selectedLanguage,
    codeContent,
    handleCodeChange,
    handleLanguageChange,
    handleRunCode,
    handleSubmit,
    handleEndTest,
    currentCode
  };
};

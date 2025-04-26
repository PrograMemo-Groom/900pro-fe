import { useAppSelector } from '@/store';
import { submitCode } from '@/api/codingTestApi';
import { useTimer } from './useTimer';
import { useCodeExecution } from './useCodeExecution';
import { useCodePersistence } from './useCodePersistence';

export const useCodingTestMainLogic = () => {
  // Redux에서 시작 시간과 지속 시간 가져오기
  const startTimeString = useAppSelector((state) => state.teamain.startTime);
  const durationTime = useAppSelector((state) => state.teamain.durationTime);

  // 분리된 커스텀 훅들 사용
  const { remainingTime } = useTimer(startTimeString, durationTime);
  const { output, isRunning, processAndRunCode } = useCodeExecution();
  const {
    selectedLanguage,
    codeContent,
    handleCodeChange,
    handleLanguageChange,
    getCurrentCode
  } = useCodePersistence();

  // 현재 선택된 언어의 코드 가져오기
  const currentCode = getCurrentCode();

  // 코드 실행 핸들러
  const handleRunCode = () => {
    processAndRunCode(selectedLanguage, currentCode);
  };

  // 코드 제출 핸들러
  const handleSubmit = () => {
    const submitData = {
      codeRequestDto: {
        testId: 1073741824, // 실제 구현 시 이 값들은 props 또는 context에서 가져와야 합니다
        problemId: 1073741824,
        userId: 1073741824
      },
      submitCode: currentCode,
      submitAt: new Date().toISOString()
    };

    processAndRunCode(selectedLanguage, currentCode);

    submitCode(submitData)
      .then(response => {
        if (response.success) {
          alert('코드가 성공적으로 제출되었습니다!');
        } else {
          alert(`제출 실패: ${response.message}`);
        }
      })
      .catch(error => {
        console.error('제출 중 오류 발생:', error);
        alert('코드 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
      });
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
    currentCode
  };
};

import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import styles from '@/css/login/Auth.module.scss';
import Landing from '@/pages/common/Landing.tsx';
import { SignUpReq, SignUpRes } from '@/pages/signUp/SignUp.interface';
import { AxiosResponse, AxiosError } from 'axios';
import API from '@/store/api/ApiConfig.ts';
import { useNavigate } from 'react-router-dom';

interface ErrorResponse {
  message?: string;
  success?: boolean;
  data?: any;
}

interface ErrorMessage {
  id: string;
  text: string;
  timestamp: number;
  isFading: boolean;
}

class ErrorMessageManager {
  private timers: { [key: string]: NodeJS.Timeout } = {};
  private setStateCallback: React.Dispatch<React.SetStateAction<ErrorMessage[]>>;

  constructor(setStateCallback: React.Dispatch<React.SetStateAction<ErrorMessage[]>>) {
    this.setStateCallback = setStateCallback;
  }

  // 모든 타이머 정리
  public cleanupAllTimers() {
    Object.values(this.timers).forEach(timer => clearTimeout(timer));
    this.timers = {};
  }

  // 특정 타입의 타이머 정리
  private cleanupTimersByType(type: string) {
    Object.keys(this.timers).forEach(key => {
      if (key.startsWith(type)) {
        clearTimeout(this.timers[key]);
        delete this.timers[key];
      }
    });
  }

  // 모든 메시지 제거
  public clearAllMessages() {
    this.cleanupAllTimers();
    this.setStateCallback([]);
  }

  // 특정 타입의 메시지 제거
  public clearMessagesByType(type: string) {
    this.cleanupTimersByType(type);

    this.setStateCallback(prev => {
      return prev.filter(msg => !msg.id.startsWith(type));
    });
  }

  // 에러 메시지 추가
  public addMessage(text: string, type: string = 'general') {
    const id = `${type}-${Date.now()}`;

    // 동일한 유형의 메시지 제거
    this.clearMessagesByType(type);

    // 새 메시지 생성
    const newMessage: ErrorMessage = {
      id,
      text,
      timestamp: Date.now(),
      isFading: false
    };

    // 메시지 추가
    this.setStateCallback(prev => {
      return [...prev, newMessage];
    });

    // 타이머 설정
    this.setupMessageTimer(newMessage);

    return id;
  }

  // 메시지 타이머 설정
  private setupMessageTimer(message: ErrorMessage) {
    // 5초 후 페이드 아웃 시작
    this.timers[message.id] = setTimeout(() => {
      this.setStateCallback(prev => {
        return prev.map(msg =>
          msg.id === message.id ? { ...msg, isFading: true } : msg
        );
      });

      // 페이드 아웃 1초 후 제거
      this.timers[`${message.id}-remove`] = setTimeout(() => {
        this.setStateCallback(prev => {
          return prev.filter(msg => msg.id !== message.id);
        });

        delete this.timers[message.id];
        delete this.timers[`${message.id}-remove`];
      }, 1000);
    }, 5000);
  }
}

const SignUp = () => {
  const [form, setForm] = useState<SignUpReq>({ username: '', email: '', password: '' });
  const [errorMessages, setErrorMessages] = useState<ErrorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const navigate = useNavigate();

  // 오류 메시지 관리자 생성
  const errorManagerRef = useRef<ErrorMessageManager | null>(null);

  // 에러 메시지 관리자 초기화
  useEffect(() => {
    errorManagerRef.current = new ErrorMessageManager(setErrorMessages);

    // 컴포넌트 언마운트 시 모든 타이머 정리
    return () => {
      if (errorManagerRef.current) {
        errorManagerRef.current.cleanupAllTimers();
      }
    };
  }, []);

  // 오류 메시지 추가
  const addError = (text: string, type: string = 'general') => {
    if (errorManagerRef.current) {
      return errorManagerRef.current.addMessage(text, type);
    }
    return '';
  };

  // 오류 메시지 제거
  const clearErrorsByType = (type: string) => {
    if (errorManagerRef.current) {
      errorManagerRef.current.clearMessagesByType(type);
    }
  };

  // 모든 오류 메시지 제거
  const clearAllErrors = () => {
    if (errorManagerRef.current) {
      errorManagerRef.current.clearAllMessages();
    }
  };

  // 비밀번호 유효성 검사 함수
  const validatePassword = (password: string): boolean => {
    // 8~20자, 영문자, 숫자, 특수문자(~!@#$%^&*?) 중 하나 이상 포함
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*?])[A-Za-z\d~!@#$%^&*?]{8,20}$/;
    return passwordRegex.test(password);
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [id]: value,
    }));

    // 이메일이 변경되면 중복 확인 상태 초기화
    if (id === 'email') {
      setEmailVerified(false);
      clearErrorsByType('email-');
    }

    // 비밀번호 입력 필드에 대한 실시간 유효성 검사
    if (id === 'password' && value.length > 0) {
      if (!validatePassword(value)) {
        addError('비밀번호는 8~20자이며, 영문자, 숫자, 특수문자(~!@#$%^&*?) 중 하나 이상을 포함해야 합니다.', 'password');
      } else {
        clearErrorsByType('password');
      }
    }
  };

  const handleVerifyEmail = async (email: string) => {
    if (!email) {
      addError('이메일을 입력해주세요.', 'email-empty');
      return;
    }

    // 이메일 관련 오류 메시지 제거
    clearErrorsByType('email-');

    setIsLoading(true);
    try {
      const response = await API.post("/auth/dupCheck", { email });
      const data = response.data;

      if (data.success) {
        // 이메일 중복 확인 성공
        addError('사용 가능한 이메일입니다.', 'email-success');
        setEmailVerified(true);
      } else {
        addError(data.message || "이미 사용 중인 이메일입니다.", 'email-duplicate');
        setEmailVerified(false);
      }
    } catch (e) {
      const error = e as AxiosError<ErrorResponse>;
      const errorMessage = error.response?.data?.message || '이메일 중복 확인 중 오류가 발생했습니다.';
      addError(errorMessage, 'email-error');
      setEmailVerified(false);
    } finally {
      setIsLoading(false);
    }
  }

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 모든 에러 메시지 제거
    clearAllErrors();

    // 비밀번호 유효성 검사
    if (!validatePassword(form.password)) {
      addError('비밀번호는 8~20자이며, 영문자, 숫자, 특수문자(~!@#$%^&*?) 중 하나 이상을 포함해야 합니다.', 'password');
      return;
    }

    // 이메일 중복 확인 검증
    if (!emailVerified) {
      addError('이메일 중복 확인을 해주세요.', 'email-verify');
      return;
    }

    setIsLoading(true);

    try {
      const response: AxiosResponse<SignUpRes> = await API.post("/auth/join", form);
      const isSuccess = 'success' in response.data && response.data.success === true;

      // 회원가입 성공 시 처리
      if (isSuccess) {
        // 모든 에러 메시지 제거
        clearAllErrors();

        // 회원가입 성공 메시지
        addError('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.', 'success');

        // 잠시 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        addError('message' in response.data ? response.data.message : '회원가입에 실패했습니다.', 'join-fail');
      }
    } catch (e) {
      const error = e as AxiosError<ErrorResponse>;

      // 에러 응답 내용 확인
      if (error.response) {
        let errorMessage = error.response.data?.message || '회원가입 중 오류가 발생했습니다.';

        // 비밀번호 유효성 검사 오류 처리
        if (typeof errorMessage === 'string' && (
            errorMessage.includes('Pattern.signUpDto.password') ||
            errorMessage.includes('비밀번호는 8~20자'))) {
          addError('비밀번호는 8~20자이며, 영문자, 숫자, 특수문자(~!@#$%^&*?) 중 하나 이상을 포함해야 합니다.', 'password');
        } else {
          // 기타 검증 오류 메시지 처리
          if (typeof errorMessage === 'string' && errorMessage.includes('Validation failed')) {
            errorMessage = '입력하신 정보가 유효하지 않습니다. 다시 확인해주세요.';
          }
          addError(errorMessage, 'api-error');
        }
      } else if (error.request) {
        addError('서버 응답이 없습니다. 네트워크 연결을 확인해주세요.', 'network');
      } else {
        addError('요청 준비 중 오류가 발생했습니다.', 'request');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Landing />
      <form className={styles.loginForm} onSubmit={handleOnSubmit}>
        {/* 에러 메시지 컨테이너 - 항상 표시 */}
        <div className={styles.errorContainer}>
          {errorMessages.map((error) => (
            <div
              key={error.id}
              className={`${styles.errorMessage} ${error.isFading ? styles['fade-out'] : ''} ${
                error.id.startsWith('success') || error.id.includes('success') ? styles.successMessage : ''
              }`}
            >
              {error.text}
            </div>
          ))}
        </div>

        <div className={styles.inputForm}>
          {/*닉네임은 최대 8자, 영문자와 숫자만 이용 가능*/}
          <label htmlFor="username">Name</label>
          <div className={styles.auth__input}>
            <input type="text" id="username"
                   onChange={handleOnChange}
                   placeholder="최대 8자, 영문자와 숫자만 이용 가능"
                   value={form.username}
                   maxLength={8}
                   required
            />
          </div>
        </div>

        <div className={styles.inputForm}>
          <label htmlFor="email">Email</label>
          <div className={styles.auth__input}>
            <input type="email" id="email"
                   onChange={handleOnChange}
                   value={form.email}
                   required
            />
            <button
              type="button"
              onClick={() => handleVerifyEmail(form.email)}
              disabled={isLoading || !form.email}
              className={emailVerified ? styles.verifiedBtn : undefined}
            >
              {emailVerified ? '확인 완료' : '중복 확인'}
            </button>
          </div>
        </div>

        <div className={styles.inputForm}>
          <label htmlFor="password">Password</label>
          <div className={styles.auth__input}>
            <input type="password" id="password"
                   onChange={handleOnChange}
                   value={form.password}
                   required
            />
          </div>
          <div className={styles.messageContainer}>
            <small className={styles.passwordHint}>
              비밀번호는 8~20자이며, 영문자, 숫자, 특수문자(~!@#$%^&*?) 중 하나 이상을 포함해야 합니다.
            </small>
          </div>
        </div>

        <button
          className={styles.auth__submit}
          type="submit"
          disabled={isLoading || !form.email || !form.password || !form.username}
        >
          {isLoading ? '처리 중...' : 'Sign Up'}
        </button>
        <div className={styles.checkAuth}>
          <p><strong>이미 회원이신가요?</strong> <a href="/"><span>로그인</span></a></p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;

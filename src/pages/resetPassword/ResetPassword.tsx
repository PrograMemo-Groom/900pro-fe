import React, { useState } from 'react';
import styles from '@/css/login/Auth.module.scss';
import Landing from '@/pages/common/Landing.tsx';
import { ResetForm, VerifyResponse } from '@/pages/resetPassword/ResetPassword.interface.ts';
import { AxiosResponse, AxiosError } from 'axios';
import API from '@/store/api/ApiConfig.ts';

interface ErrorResponse {
  message: string;
}

const ResetPassword = () => {
  // TODO : 재설정 버튼 비활성화 색상 추가
  // TODO : 이메일 인증 코드 입력 후 비밀번호 초기화 COMPONENT 추가
  // TODO : 비밀번호 초기화 VIEW 추가후 재 설정 시 LOGIN 페이지로 이동
  // TODO : 인증 관련 API는 전부 되어 있으나, 페이지 추가 필요
  const [form, setForm] = useState<ResetForm>({ email: '', password: '' });
  const [verificationStep, setVerificationStep] = useState<'email' | 'password' | 'reset'>('email');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('form 실행', form.email);
    try {
      const response: AxiosResponse<VerifyResponse> = await API.post('/auth/verify', form);
      console.log('이메일 인증 코드 요청 : ', response);

      if (response.data.success) {
        setMessage('인증이 완료되었습니다. 새 비밀번호를 설정해주세요.');
        setVerificationStep('reset');
      } else {
        setMessage(response.data.message || '인증에 실패했습니다.');
      }
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.log('error : ', err.response?.data?.message);
      setMessage(err.response?.data?.message || '인증에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleCheckEmail = async (email: string) => {
    if (!email) {
      setMessage('이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response: AxiosResponse<VerifyResponse> = await API.post('/mail/reset-password', { email });
      console.log('이메일 인증 코드 요청 : ', response.data);

      if (response.data.success) {
        setVerificationStep('password');
        setMessage('임시 비밀번호가 이메일로 발송되었습니다.');
      } else {
        setMessage(response.data.message || '이메일 발송에 실패했습니다.');
      }
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.log('error : ', err.response?.data?.message);
      setMessage(err.response?.data?.message || '이메일 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className={styles.container}>
      <Landing />
      <form className={styles.loginForm} onSubmit={handleOnSubmit}>
        <h2>비밀번호 초기화</h2>

        {message && <div className={message.includes('성공') ? `${styles.errorMessage} ${styles.successMessage}` : styles.errorMessage}>{message}</div>}

        <div className={styles.inputForm}>
          <label htmlFor="email">Email</label>
          <div className={styles.auth__input}>
            <input
              type="text"
              id="email"
              onChange={handleOnChange}
              // placeholder="email 을 입력해주세요"
              value={form.email}
              disabled={verificationStep !== 'email'}
            />
            {verificationStep === 'email' && (
              <button
                type="button"
                onClick={() => handleCheckEmail(form.email)}
                disabled={isLoading || !form.email}
                className={isLoading ? styles.loadingButton : ''}
              >
                {isLoading ? '처리중...' : '메일전송'}
              </button>
            )}
          </div>
        </div>

        {verificationStep === 'password' && (
          <div className={styles.inputForm}>
            <label htmlFor="password">임시 비밀번호</label>
            <div className={styles.auth__input}>
              <input
                type="password"
                id="password"
                onChange={handleOnChange}
                // placeholder="password 를 입력해주세요"
                value={form.password}
              />
            </div>
          </div>
        )}

        {verificationStep === 'reset' && (
          <div className={styles.inputForm}>
            <label htmlFor="newPassword">새 비밀번호</label>
            <div className={styles.auth__input}>
              <input
                type="password"
                id="password"
                onChange={handleOnChange}
                placeholder="8자 이상의 비밀번호를 입력해주세요"
                value={form.password}
              />
            </div>
          </div>
        )}

        {verificationStep === 'password' && (
          <button
            className={styles.auth__submit}
            type="submit"
            disabled={isLoading || !form.password || form.password.trim().length < 8}
          >
            {isLoading ? '처리중...' : '코드 확인'}
          </button>
        )}

        {verificationStep === 'reset' && (
          <button
            className={styles.auth__submit}
            type="button"
            disabled={isLoading || !form.password || form.password.trim().length < 8}
          >
            {isLoading ? '처리중...' : '비밀번호 재설정'}
          </button>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;

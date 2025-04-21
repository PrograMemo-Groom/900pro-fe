import React, { useEffect, useState } from 'react';
import styles from '@/css/login/Auth.module.scss';
import Landing from '@/pages/common/Landing.tsx';
import { ResetForm, verifyForm } from '@/pages/resetPassword/ResetPassword.interface.ts';
import { AxiosResponse } from 'axios';
import API from '@/store/api/ApiConfig.ts';

const ResetPassword = () => {
  // TODO : 재설정 버튼 비활성화 색상 추가
  // TODO : 이메일 인증 코드 입력 후 비밀번호 초기화 COMPONENT 추가
  // TODO : 비밀번호 초기화 VIEW 추가후 재 설정 시 LOGIN 페이지로 이동
  // TODO : 인증 관련 API는 전부 되어 있으나, 페이지 추가 필요
  const [form, setForm] = useState<ResetForm>({ email: '', password: '' });
  const [temporaryPassword, setTemporaryPassword] = useState(false);
  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('form 실행', form.email);
    try {
      const response: AxiosResponse<ResetForm> = await API.post('/auth/verify', form);
      console.log('이메일 인증 코드 요청 : ', response);
    } catch (e) {
      console.log('error : ', e.response.data?.message);
    }
  };
  const handleOnChange = (e: React.FormEvent) => {
    const { id, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };
  const handleCheckEmail = async (email: string) => {
    try {
      const response: AxiosResponse<verifyForm> = await API.post('/mail/reset-password', { email });
      console.log('이메일 인증 코드 요청 : ', response.data);
      setTemporaryPassword(response.data.success);
    } catch (e) {
      console.log('error : ', e.response.data?.message);
    }
  };

  return (
    <div className={styles.container}>
      <Landing />
      <form className={styles.loginForm} onSubmit={handleOnSubmit}>
        <h2>비밀번호 초기화</h2>
        <div className={styles.inputForm}>
          <label htmlFor="email">Email</label>
          <div className={styles.gradientBorder}>
            <input type="text" id="email"
                   onChange={(e) => handleOnChange(e)}
              // placeholder="email 을 입력해주세요"
                   value={form.email}
            />
            <button type="button" onClick={() => handleCheckEmail(form.email)}>메일전송</button>
          </div>
        </div>
        {temporaryPassword &&
          <div className={styles.inputForm}>
            <label htmlFor="password">임시 Password</label>
            <div className={styles.gradientBorder}>
              <input type="password" id="password"
                     onChange={(e) => handleOnChange(e)}
                // placeholder="password 를 입력해주세요"
                     value={form.password}
              />
            </div>
          </div>
        }
        <button type="submit" disabled={!temporaryPassword || form.password.trim().length < 8}>재설정</button>
      </form>
    </div>
  );
};

export default ResetPassword;

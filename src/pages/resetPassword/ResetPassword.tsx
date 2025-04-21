import React, { useState } from 'react';
import styles from '@/css/login/Auth.module.scss';
import Landing from '@/pages/common/Landing.tsx';
import { ResetForm, verifyForm } from '@/pages/resetPassword/ResetPassword.interface.ts';
import { AxiosResponse } from 'axios';
import API from '@/store/api/ApiConfig.ts';

const ResetPassword = () => {
  const [form, setForm] = useState<ResetForm>({ email: '', password: '' });
  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('form 실행', form.email);
    try {
      const response: AxiosResponse<ResetForm> = await API.post("/auth/verify", form);
      console.log("이메일 인증 코드 요청 : ",response.data);
    } catch (e) {
      console.log("error : ", e.response.data?.message);
    }
  };
  const handleOnChange = (e: React.FormEvent) => {
    const { id, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };
  const handleCheckEmail = async (email:string) => {
    try {
      const response: AxiosResponse<verifyForm> = await API.post("/mail/reset-password", { email });
      console.log("이메일 인증 코드 요청 : ",response.data);
    } catch (e) {
      console.log("error : ", e.response.data?.message);
    }
  }

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
            <button type="button" onClick={()=> handleCheckEmail(form.email)}>메일전송</button>
          </div>
        </div>
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
        <button type="submit">재설정</button>
      </form>
    </div>
  );
};

export default ResetPassword;

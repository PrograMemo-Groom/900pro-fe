import React, { useState } from 'react';
import styles from '@/css/login/Auth.module.scss';
import { SignUpProps } from '@/pages/login/Login.interface.ts';
import Landing from '@/pages/common/Landing.tsx';
import { SignUpReq, SignUpRes } from '@/pages/signUp/SignUp.interfase.ts';
import { AxiosResponse } from 'axios';
import API from '@/store/api/ApiConfig.ts';
import { SampleResponse } from '@/store/auth/thunks.ts';

const SignUp: React.FC<SignUpProps> = ({ initialValues }) => {
  const [form, setForm] = useState<SignUpReq>({ name: '', email: '', password: '' });
  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('form 실행', form);
    const response:AxiosResponse<SignUpRes> = await API.post("/auth/join", form);
    console.log("회원가입 요청 : ", response);
  };
  const handleOnChange = (e: React.FormEvent) => {
    const { id, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };
  const handleVerifyEmail = async (email:string) => {
    const {data} :AxiosResponse<SampleResponse> = await API.post("/auth/dupCheck", { email });
    console.log("[이메일 중복 확인] ; ",data);
    if (data?.success) {
      console.log("중복 확인 완료 : ", data?.message);
    }
  }

  return (
    <div className={styles.container}>
      <Landing />
      <form className={styles.loginForm} onSubmit={handleOnSubmit}>
        <div className={styles.inputForm}>
          <label htmlFor="name">Name</label>
          <div className={styles.gradientBorder}>
            <input type="text" id="name"
                   onChange={(e) => handleOnChange(e)}
              // placeholder="name 을 입력해주세요"
                   value={form.name}
            />
          </div>
        </div>
        <div className={styles.inputForm}>
          <label htmlFor="email">Email</label>
          <div className={styles.gradientBorder}>
            <input type="text" id="email"
                   onChange={(e) => handleOnChange(e)}
              // placeholder="email 을 입력해주세요"
                   value={form.email}
            />
            <button type="button" onClick={() => handleVerifyEmail(form.email)}>중복 확인</button>
          </div>
        </div>
        <div className={styles.inputForm}>
          <label htmlFor="password">Password</label>
          <div className={styles.gradientBorder}>
            <input type="password" id="password"
                   onChange={(e) => handleOnChange(e)}
              // placeholder="password 를 입력해주세요"
                   value={form.password}
            />
          </div>
        </div>
        <button type="submit">Sign Up</button>
        <div className={styles.checkAuth}>
          <p><strong>이미 회원이신가요?</strong> <a href="/"><span>로그인</span></a></p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;

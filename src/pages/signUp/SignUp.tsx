import React, { useState } from 'react';
import styles from '@/css/login/Auth.module.scss';
import Landing from '@/pages/common/Landing.tsx';
import { SignUpReq, SignUpRes } from '@/pages/signUp/SignUp.interfase.ts';
import { AxiosResponse } from 'axios';
import API from '@/store/api/ApiConfig.ts';
import { SampleResponse } from '@/store/auth/thunks.ts';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigator = useNavigate();
  const [form, setForm] = useState<SignUpReq>({ username: '', email: '', password: '' });
  const [emailCheck, setEmailCheck] = useState<boolean | null>(null);

  const isFormInvalid = (
    !form.username.trim() ||
    !form.email.trim() ||
    !form.password.trim() ||
    emailCheck !== true
  );

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('form 실행', form);
    try {
      const response: AxiosResponse<SignUpRes> = await API.post('/auth/join', form);
      console.log('회원가입 요청 : ', response.data);
      alert('회원가입 성공!');
      navigator('/'); // 로그인 창으로 이동
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
  const handleVerifyEmail = async (email: string) => {
    if (email.trim().length > 0) {
      try {
        const { data }: AxiosResponse<SampleResponse> = await API.post('/auth/dupCheck', { email });
        console.log('[이메일 중복 확인] ; ', data);
        if (data?.success) {
          console.log('중복 확인 완료 : ', data?.message);
          setEmailCheck(true);
        }
      } catch (e) {
        console.log('error : ', e.response.data?.message);
        setEmailCheck(false);
      }
    }



  };

  return (
    <div className={styles.container}>
      <Landing />
      <form className={styles.loginForm} onSubmit={handleOnSubmit}>
        <div className={styles.inputForm}>
          {/*닉네임은 최대 8자, 영문자와 숫자만 이용 가능*/}
          <label htmlFor="username">Name</label>
          <div className={styles.auth__input}>
            <input type="text" id="username"
                   onChange={(e) => handleOnChange(e)}
                   placeholder="최대 8자, 영문자와 숫자만 이용 가능"
                   value={form.username}
                   maxLength={8}
                   autoComplete="username"
            />
          </div>
        </div>
        <div className={styles.inputForm}>
          <label htmlFor="email">Email</label>
          <div className={styles.auth__input}>
            <input type="text" id="email"
                   onChange={(e) => handleOnChange(e)}
              // placeholder="email 을 입력해주세요"
                   value={form.email}
                   autoComplete="email"
            />
            <button type="button" onClick={() => handleVerifyEmail(form.email)} disabled={form.email.trim().length === 0}>중복 확인</button>
          </div>
          {(emailCheck === true ? <p className={styles.success}>사용 가능한 이메일 입니다.</p> : emailCheck === false && <p className={styles.failed}>이미 사용 중 인 이메일 입니다.</p>)}
        </div>
        <div className={styles.inputForm}>
          <label htmlFor="password">Password</label>
          <div className={styles.auth__input}>
            <input type="password" id="password"
                   onChange={(e) => handleOnChange(e)}
              // placeholder="password 를 입력해주세요"
                   value={form.password}
                   autoComplete="password"
            />
          </div>
        </div>
        <button className={!isFormInvalid ? styles.auth__submit : styles.disabled__submit} type="submit"
                disabled={isFormInvalid}>
          Sign Up
        </button>
        <div className={styles.checkAuth}>
          <p><strong>이미 회원이신가요?</strong> <a href="/"><span>로그인</span></a></p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;

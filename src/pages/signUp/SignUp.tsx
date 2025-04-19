import React, {useState} from 'react';
import styles from "@/css/login/Auth.module.scss";
import { SignUpFormValues, SignUpProps } from '@/pages/login/Login.interface.ts';
import Landing from '@/pages/common/Landing.tsx';
// import axios from "axios";
// import type { AxiosResponse } from 'axios';

const SignUp: React.FC<SignUpProps> = ({initialValues}) => {
  const [form, setForm] = useState<SignUpFormValues>({
    name: initialValues?.name || "",
    email: initialValues?.email || "",
    password: initialValues?.password || ""
  })
  const handleOnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("form 실행", form);
  }
  const handleOnChange = (e: React.FormEvent) => {
    const {id, value} = e.target;
    setForm((prevState) => ({
      ...prevState,
      [id]: value,
    }));
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
            <button type="button">중복 확인</button>
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

import React, {useState} from 'react';
import styles from "@/css/login/Auth.module.scss";
import { LoginFormValues, LoginProps } from '@/pages/login/Login.interface.ts';
import Landing from '@/pages/common/Landing.tsx';
// import axios from "axios";
// import type { AxiosResponse } from 'axios';

const ResetPassword: React.FC<LoginProps> = ({initialValues}) => {
  const [form, setForm] = useState<LoginFormValues>({
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
        <h2>비밀번호 초기화</h2>
        <div className={styles.inputForm}>
          <label htmlFor="email">Email</label>
          <div className={styles.gradientBorder}>
            <input type="text" id="email"
                   onChange={(e) => handleOnChange(e)}
              // placeholder="email 을 입력해주세요"
                   value={form.email}
            />
            <button type="button">메일전송</button>
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

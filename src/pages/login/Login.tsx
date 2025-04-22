import React, {useState} from 'react';
import styles from "@/css/login/Auth.module.scss";
import { LoginFormValues, LoginProps, LoginResult } from '@/pages/login/Login.interface.ts';
import Landing from '@/pages/common/Landing.tsx';
import API from '@/store/api/ApiConfig.ts';
import { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC<LoginProps> = ({initialValues}) => {
    const navigator = useNavigate();
    const [form, setForm] = useState<LoginFormValues>({
        email: initialValues?.email || "",
        password: initialValues?.password || ""
    })
    const handleOnChange = (e: React.FormEvent) => {
        const {id, value} = e.target;
        setForm((prevState) => ({
            ...prevState,
            [id]: value,
        }));
    }
    const handleOnSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("form 실행", form);
        try {
            const response:AxiosResponse<LoginResult> = await API.post("/auth/login", form);
            // console.log("login 했을 때 response ; ", response);
            if (response.data.success) {
                alert("로그인 성공!");
                sessionStorage.setItem("token", response.data.data); // sessionStorage에 jwt 토큰 값 추가
                navigator("/main"); // 팀 페이지로 이동
            } else {
                alert("로그인 실패! 이메일과 비밀번호를 확인해주세요.");
            }
        } catch (e) {
            console.log("error : ", e);
        }

    }

    return (
    <div className={styles.container}>
        <Landing />
        <form className={styles.loginForm} onSubmit={handleOnSubmit}>
            <div className={styles.inputForm}>
                <label htmlFor="email">Email</label>
                <div className={styles.auth__input}>
                    <input type="text" id="email"
                           onChange={(e) => handleOnChange(e)}
                           // placeholder="email 을 입력해주세요"
                           value={form.email}
                           autoComplete="email"
                    />
                </div>
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
            <button className={styles.auth__submit} type="submit">Sign in</button>
            <div className={styles.checkAuth}>
                <p><strong>Don’t have an account?</strong> <a href="/signup"><span>Sign up</span></a></p>
                <a href="/find"><p>Forgot Password</p></a>
            </div>
        </form>
    </div>
    );
};

export default Login;

import React, {useState} from 'react';
import styles from "@/css/login/Auth.module.scss";
import { LoginDataResponse, LoginFormValues, LoginProps } from '@/pages/login/Login.interface.ts';
import Landing from '@/pages/common/Landing.tsx';
import API from '@/store/api/ApiConfig.ts';
import { AxiosResponse } from 'axios';

const Login: React.FC<LoginProps> = ({initialValues}) => {
    // TODO : 500 에러 발생해서, LOGIN 수정 되면 다시 하는걸로 => 전달 완료
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
        const response:AxiosResponse<LoginDataResponse> = await API.post("/auth/login");
        console.log("login 했을 때 response ; ", response);
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
                    />
                </div>
            </div>
            <button type="submit">Sign in</button>
            <div className={styles.checkAuth}>
                <p><strong>Don’t have an account?</strong> <a href="/signup"><span>Sign up</span></a></p>
                <a href="/find"><p>Forgot Password</p></a>
            </div>
        </form>
    </div>
    );
};

export default Login;

import React, {useState} from 'react';
import styles from "@/css/login/Auth.module.scss";
import { LoginFormValues, LoginProps } from '@/pages/login/Login.interface.ts';
import Landing from '@/pages/common/Landing.tsx';
// import axios from "axios";
// import type { AxiosResponse } from 'axios';

const Login: React.FC<LoginProps> = ({initialValues}) => {
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

    // const [data, setData] = useState("");
    //
    // useEffect(() => {
    //     axios
    //         .get('/api/data')
    //         .then((res: AxiosResponse) => setData(res.data))
    //         .catch((err: unknown) => console.log(err));
    // }, []);

    return (
    <div className={styles.container}>
        <Landing />
        <form className={styles.loginForm} onSubmit={handleOnSubmit}>
            <div className={styles.inputForm}>
                <label htmlFor="email">Email</label>
                <div className={styles.gradientBorder}>
                    <input type="text" id="email"
                           onChange={(e) => handleOnChange(e)}
                           // placeholder="email 을 입력해주세요"
                           value={form.email}
                    />
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

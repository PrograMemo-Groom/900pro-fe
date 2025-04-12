import React, {useState} from 'react';
import styles from "@/css/login/Login.module.scss";
import { LoginFormValues, LoginProps } from '@/pages/login/Login.interface.ts';
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
        <section className={styles.description}>
            <h2>9OOROMBACKPROGRAMO</h2>
            <h1>9BACKPRO</h1>
            <h2>실전처럼, 실력있게.</h2>
            <p>혼자가 아닌 함께, <br/>
                실시간 채팅으로 문제 풀이 방식을 <br/>
                공유하며 함께 코딩 실력을 향상시켜<br/>
                나가는 것을 목표로 합니다.</p>
        </section>
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
                <p><strong>Don’t have an account?</strong> <span>Sign up</span></p>
                <p>Forgot Password</p>
            </div>
        </form>
    </div>
    );
};

export default Login;

import React, {useEffect, useState} from 'react';
import axios from "axios";
import styles from "@/css/login/Login.module.scss";
import type { AxiosResponse } from 'axios';
import logoImg from "@/assets/react.svg";
import { LoginProps } from '@/pages/login/Login.interface.ts';

const Login: React.FC<LoginProps> = ({initialValues}) => {
    const [form, setForm] = useState<LoginFormValues>({
        email: initialValues?.email || "",
        password: initialValues?.password || ""
    })

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
        <div className={styles.description}>
            <h2>9OORMBACKPROGRAMO</h2>
            <h1>9BACKPRO</h1>
            <h2>실전처럼, 실력있게</h2>
        </div>

        {/*<h2> 연결 테스트 900PRO GROOM EXAM</h2>*/}
        <div>
            <img src={logoImg as String} alt="logo"/>
            {/*<div>받아온 값 : {data}</div>*/}
        </div>
    </div>
    );
};

export default Login;

import type { AxiosResponse } from 'axios';
import axios from "axios";
import { useEffect, useState } from 'react';

const Login = () => {

    const [data, setData] = useState("");

    useEffect(() => {
        axios
            .get('/api/data')
            .then((res: AxiosResponse) => setData(res.data))
            .catch((err: unknown) => console.log(err));
    }, []);

    return (<div>
        로그인 페이지

        <h2> 연결 테스트</h2>
        <div>
            <img src="./vite.svg" alt="logo"/>
            <div>받아온 값 : {data}</div>
        </div>
    </div>);
};

export default Login;
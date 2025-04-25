import React, {useState, useEffect} from 'react';
import styles from "@/css/login/Auth.module.scss";
import { LoginFormValues, LoginProps } from '@/pages/login/Login.interface.ts';
import Landing from '@/pages/common/Landing.tsx';
import { useAppDispatch, useAppSelector } from '@/store';
import { completeAuthProcess } from '@/store/auth/thunks';
import { useNavigate } from 'react-router-dom';

const Login: React.FC<LoginProps> = ({initialValues}) => {
    // TODO : 500 에러 발생해서, LOGIN 수정 되면 다시 하는걸로 => 전달 완료
    const [form, setForm] = useState<LoginFormValues>({
        email: initialValues?.email || "",
        password: initialValues?.password || ""
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // 이미 로그인되어 있는 경우 적절한 페이지로 리다이렉션
        if (isLoggedIn) {
            if (user.teamId === null) {
                navigate('/main');
            } else {
                navigate('/myteam');
            }
        }
    }, [isLoggedIn, user.teamId, navigate]);

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target;
        setForm((prevState) => ({
            ...prevState,
            [id]: value,
        }));
    }

    const handleOnSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // 통합된 인증 프로세스 실행 (로그인 + 사용자 정보 가져오기)
            const authResult = await dispatch(completeAuthProcess({
                email: form.email,
                password: form.password
            })).unwrap();

            console.log("인증 완료:", authResult);

            // 로그인 상태 확인 후 리다이렉션
            if (authResult.teamId === null) {
                navigate('/main');
            } else {
                navigate('/waitingroom');
            }
        } catch (e: any) {
            console.log("로그인 오류:", e);
            setError(e.message || '로그인에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }

    // 이미 로그인된 경우 리다이렉션을 기다리는 동안 로딩 표시
    if (isLoggedIn) {
        return <div className={styles.container}>로딩 중...</div>;
    }

    return (
    <div className={styles.container}>
        <Landing />
        <form className={styles.loginForm} onSubmit={handleOnSubmit}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div className={styles.inputForm}>
                <label htmlFor="email">Email</label>
                <div className={styles.auth__input}>
                    <input type="text" id="email"
                           onChange={handleOnChange}
                           // placeholder="email 을 입력해주세요"
                           value={form.email}
                    />
                </div>
            </div>
            <div className={styles.inputForm}>
                <label htmlFor="password">Password</label>
                <div className={styles.auth__input}>
                    <input type="password" id="password"
                           onChange={handleOnChange}
                           // placeholder="password 를 입력해주세요"
                           value={form.password}
                    />
                </div>
            </div>
            <button className={styles.auth__submit} type="submit" disabled={isLoading}>
                {isLoading ? '로그인 중...' : 'Sign in'}
            </button>
            <div className={styles.checkAuth}>
                <p><strong>회원이 아니신가요?</strong> <a href="/signup"><span>Sign up</span></a></p>
                <a href="/find"><p
                className={styles.authLink}>Forgot Password</p></a>
            </div>
        </form>
    </div>
    );
};

export default Login;

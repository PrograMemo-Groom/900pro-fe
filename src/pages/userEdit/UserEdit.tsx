import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/pages/common/Header.tsx';
import styles from "@/css/useredit/EditProfile.module.scss";
import eyeIcon from '@/assets/eye.svg';
import noeyeIcon from '@/assets/noeye.svg';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function UserEdit() {
    const myemail = useSelector((state: RootState) => state.auth.user.email);

    const [name, setName] = useState('');
    const [email, _setEmail] = useState(myemail); //수정불가
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
  
    const navigate = useNavigate();
  
    const validatePassword = (pwd: string) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*?])[A-Za-z\d~!@#$%^&*?]{8,20}$/;
        return regex.test(pwd);
    };
  
    const handleSubmit = async () => {
        // 이름 입력 여부 먼저 체크
        if (!name.trim()) {
            setErrorMessage('이름을 입력해주세요');
        return;
        }

        if (!password.trim()) {
            setErrorMessage('비밀번호를 입력해주세요');
            return;
        }

        if (password && !validatePassword(password)) {
            setErrorMessage('비밀번호는 8~20자이며, 영문자, 숫자, 특수문자(~!@#$%^&*?) 중 하나 이상을 포함해야 합니다.');
            return;
        }

        try {
            const userId = useSelector((state: RootState) => state.auth.userId);

            if (!userId) {
            alert('로그인 정보가 없습니다.');
            navigate('/');
            return;
            }
        
            // 서버로 PATCH 요청 보내기
            await axios.patch(`/api/mypage/update/${userId}`, {
            username: name,
            password: password ? password : undefined,
            });
    
            alert('회원 정보 수정 완료!');
            navigate('/myteam');
            window.location.reload();  

        } catch (error) {
            console.error(error);
            alert('회원 정보 수정 실패');
        }
    };
  
    const handleWithdrawal = () => {
      // TODO: 회원 탈퇴 로직
      alert('회원 탈퇴 기능은 준비 중입니다.');
    };

  return (
    <div className={styles.editroom}>
      <Header />
      <div className={styles.container}>
        <h2>회원정보 수정</h2>
        <div className={styles.inputBox}>
            <label>Name</label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="새로운 이름을 입력해주세요"
            />
        </div>

        <div className={styles.inputBox}>
            <label>Email</label>
            <input
            type="email"
            value={email}
            disabled
            />
        </div>

        <div className={styles.inputBox}>
            <label>New Password</label>
            <div className={styles.passwordInputWrapper}>
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="새로운 비밀번호를 입력해주세요"
                    className={styles.passwordInput}
                />
                <img
                    src={showPassword ? noeyeIcon : eyeIcon}
                    alt="toggle password visibility"
                    className={styles.eyeIcon}
                    onClick={() => setShowPassword(!showPassword)}
                />
            </div>
        </div>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        <button className={styles.submitButton} onClick={handleSubmit}>
            수정 완료
        </button>

        <button className={styles.withdrawButton} onClick={handleWithdrawal}>
            회원 탈퇴
        </button>
        </div>
    </div>
  )
}

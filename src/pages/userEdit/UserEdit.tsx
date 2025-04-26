import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/pages/common/Header.tsx';
import styles from "@/css/useredit/EditProfile.module.scss";

export default function UserEdit() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('hello@naver.com'); // 예시 이메일
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
  
    const navigate = useNavigate();
  
    const validatePassword = (pwd: string) => {
      const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{7,}$/;
      return regex.test(pwd);
    };
  
    const handleSubmit = () => {
      if (password && !validatePassword(password)) {
        setErrorMessage('영어, 숫자, 특수문자 포함 8자의 비밀번호를 입력해주세요');
        return;
      }
  
      // TODO: 수정 요청 API 호출
      alert('회원 정보 수정 완료!');
      navigate('/myteam');
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
                <span className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '👁️' : '🙈'}
                </span>
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

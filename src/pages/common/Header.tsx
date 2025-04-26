import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "@/css/common/Header.module.scss";
import hamburgerIcon from '@/assets/hamb.svg';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();       
  };

  return (
    <header>
      <img src={hamburgerIcon}
          onClick={toggleMenu}
       alt='햄버거바'/>
      <h1 className={styles.header}>9BACKPRO</h1>

      {isOpen && (
          <div className={styles.menu}>
            <button>9BACKPRO 이용가이드</button>
            <button>회원 정보 수정</button>
            <button>이용 약관</button>
            <button>개인정보 처리 방침</button>

            <div className={styles.copy}>
              <p>@copyrigh 2025 Programeo.<br />All rights reserved.</p>
              <p className={styles.smallText}>개선 및 문의사항, 또는 오류 발생시 <br/> 팀 프로그래모에게 연락 바랍니다.</p>
              <p className={styles.ver}>ver 0.0.1</p>
            </div>

            <p className={styles.logout}
             onClick={handleLogout}
             >로그아웃</p>
          </div>
      )}
    </header>
  );
};

export default Header;

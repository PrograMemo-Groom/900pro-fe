import styles from "@/css/main/Layout.module.scss";
import hamburgerIcon from '@/assets/hamb.svg';

const Header = () => {
  return (
    <header>
      <img src={hamburgerIcon} alt='햄버거바'/>
      <h1 className={styles.header}>9BACKPRO</h1>
    </header>
  );
};

export default Header;

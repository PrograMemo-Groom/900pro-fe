import React from 'react';
import styles from "@/css/main/Layout.module.scss";
import Burger from "@/assets/burger.svg";

const Header = () => {
  return (
    <header className={styles.header}>
      <img src={Burger} alt="menu" className={styles.menuIcon} />
      <h1>9BACKPRO</h1>
      <div/>
    </header>
  );
};

export default Header;

// import React from 'react';
// import styles from '@/css/main/MainPage.module.scss';
//
// const MainPage = () => {
//   const groups = [
//     { title: '개열심히하조', time: '매일 오후 6시', level: '난이도 4 / 4전체', members: '인원 3/10' },
//     { title: '이게머조?', time: '매일 오후 9시', level: '난이도 3 / 3전체', members: '인원 9/10' },
//     { title: '팀팀팀', time: '매일 오후 2시', level: '난이도 3 / 3전체', members: '인원 5/10' },
//     { title: '프로그래모', time: '매일 오전 10시', level: '난이도 3 / 3전체', members: '인원 3/10' },
//     { title: '안하면불닭먹기', time: '매일 오후 8시', level: '난이도 3 / 3전체', members: '인원 8/10' },
//     { title: '취업하고싶은사람들', time: '매일 오후 8시', level: '난이도 4 / 4전체', members: '인원 10/10' },
//     { title: '올사람은와라', time: '매일 오전 7시', level: '난이도 3 / 3전체', members: '인원 1/10' },
//     { title: '마요', time: '매일 오전 7시', level: '난이도 3 / 3전체', members: '인원 1/10' },
//   ];
//
//   return (
//     <div className={styles.mainWrapper}>
//       <header className={styles.header}>
//         <img src="/assets/burger.svg" alt="menu" className={styles.menuIcon} />
//         <h1>9BACKPRO</h1>
//       </header>
//
//       <section className={styles.controlPanel}>
//         <input type="text" placeholder="검색어를 입력하세요" />
//         <button>↓ 최신순</button>
//         <button>All</button>
//         <button>팀성성</button>
//       </section>
//
//       <section className={styles.cardGrid}>
//         {groups.map((group, idx) => (
//           <div key={idx} className={styles.card}>
//             <h3>{group.title}</h3>
//             <p>{group.time}</p>
//             <p>{group.level}</p>
//             <p>{group.members}</p>
//           </div>
//         ))}
//       </section>
//
//       <footer className={styles.pagination}>
//         <span>1</span>
//         <span>2</span>
//         <span>3</span>
//         <span>4</span>
//         <span>5</span>
//       </footer>
//     </div>
//   );
// };
//
// export default MainPage;

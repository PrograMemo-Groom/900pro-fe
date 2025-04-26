// import React from 'react'
import styles from '@/css/history/Chat.module.scss';

type Props = {
    date: string;
}
export default function DateDivider({date}:Props) {
  return (
    <>
      <div className={styles.line}></div>
      <p className={styles.date}>{changeDateText(date)}</p>
    </>
  )
}

function changeDateText(dateStr: string): string {
    const date = new Date(dateStr); // dataStr로 Date 생성
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate()+1;
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
}
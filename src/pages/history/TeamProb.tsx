import styles from '@/css/history/TeamView/TeamProb.module.scss'
import { ProblemType } from '@/store/history/problemSlice';

type Props = {
  question: ProblemType;
};

export default function TeamProb( { question }: Props ) {
  return (
    <main className={styles.main_container}>
      <h1><span>#{question.baekNum}</span> {question.title}</h1>
      <hr/>
      <p>{question.description}</p> {/* 문제 설명 */}
        <h2 >입력</h2>
        <p style={{ whiteSpace: 'pre-line' }}> {question.inputDes} </p>
        <h2>출력</h2>
        <p style={{ whiteSpace: 'pre-line' }}> {question.outputDes}</p>
        <h2>예제입력</h2>
        <p style={{ whiteSpace: 'pre-line' }}> {question.exInput} </p>
        <h2>예제출력</h2>
        <p style={{ whiteSpace: 'pre-line' }}> {question.exOutput}</p>
    </main>
  )
}

import styles from '@/css/history/TeamView/TeamProb.module.scss'
import { questionDummy } from '@/pages/history/data/ProbDummy';

type Props = {
  questionId: number;
};

export default function TeamProb( { questionId }: Props ) {
  const question = questionDummy.find((q) => q.baekNum === questionId);

  if (!question) return <p>해당 문제를 찾을 수 없습니다.</p>;

  return (
    <main className={styles.main_container}>
      <h1><span>#{questionId}</span> {question.title}</h1>
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

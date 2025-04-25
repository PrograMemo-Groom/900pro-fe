// import styles from '@/css/main/Layout.module.scss';
import styles from '@/css/main/CreateModal.module.scss';

const TeamCreate = ({onClose} : any) => {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <form className={styles.teamForm}>
          <label>팀 이름</label>
          <input type="text" placeholder="생성할 팀 이름을 자유롭게 입력해주세요." />

          <label>팀 설명</label>
          <textarea
            placeholder={`우리 팀에 대해 자유롭게 설명해주세요.\n팀 규칙, 활동 방안 등에 대해 설명해보면 어떨까요?`}
            rows={4}
          />

          <div className={styles.row}>
            <label>테스트 시간</label>
            <div className={styles.timeInputs}>
              <span>매일</span>
              <input type="number" placeholder="시" min={0} max={23} />
              <span>시</span>
              <input type="number" placeholder="분" min={0} max={59} />
              <span>분</span>
            </div>
          </div>

          <div className={styles.row}>
            <label>난이도</label>
            <div className={styles.options}>
              <label><input type="radio" name="difficulty" defaultChecked /> 하</label>
              <label><input type="radio" name="difficulty" /> 중</label>
              <label><input type="radio" name="difficulty" /> 상</label>
            </div>
          </div>

          <div className={styles.row}>
            <label>문제 개수</label>
            <div className={styles.options}>
              <label><input type="radio" name="problemCount" defaultChecked /> 3개</label>
              <label><input type="radio" name="problemCount" /> 4개</label>
              <label><input type="radio" name="problemCount" /> 5개</label>
            </div>
          </div>

          <div className={styles.row}>
            <label>응시 시간</label>
            <div className={styles.options}>
              <label><input type="radio" name="examTime" defaultChecked /> 2시간</label>
              <label><input type="radio" name="examTime" /> 3시간</label>
              <label><input type="radio" name="examTime" /> 4시간</label>
              <label><input type="radio" name="examTime" /> 5시간</label>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            팀 생성하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamCreate;

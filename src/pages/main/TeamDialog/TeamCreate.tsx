import React from 'react';
import styles from '@/css/main/Layout.module.scss';

const TeamCreate = ({onClose}) => {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      팀 생성 갈긴다.
    </div>
  );
};

export default TeamCreate;

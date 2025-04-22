import React, { useEffect } from 'react';
import styles from '@/css/main/Layout.module.scss';
import { useTeamFilter } from '@/context/team/TeamFilterContext.tsx';

const levels = [
  {value:"all", label: "All"},
  {value:"hard", label: "난이도 상"},
  {value:"medium", label: "난이도 중"},
  {value:"easy", label: "난이도 하"},
]

const FilterQuestion = ({isOpen, onToggle}: { isOpen: boolean, onToggle: () => void }) => {
  const { level, setLevel, handleSearchTeam } = useTeamFilter();
  const [selected, setSelected] = React.useState(
    levels.find(l => l.value === level) || levels[0]
  );

  const handleSelected = (option) => {
    setSelected(option);
    setLevel(option.value);
    onToggle();
  }

  useEffect(() => {
    (async () => {
      await handleSearchTeam();
    })();
  }, [level]);


  return (
    <div className={styles.common__select}>
      <button onClick={onToggle}>↓ {selected.label}</button>
      {isOpen && (
        <ul>
          {levels.map((option) => (
            <li key={option.value} onClick={() => handleSelected(option)}>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>

  );
};

export default FilterQuestion;

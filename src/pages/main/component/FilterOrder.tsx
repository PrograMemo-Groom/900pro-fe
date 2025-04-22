import React, { useEffect } from 'react';
import styles from "@/css/main/Layout.module.scss";
import { useTeamFilter } from '@/context/team/TeamFilterContext.tsx';

const options = [
  {value:"createdAt", label: "최신순"},
  {value:"problemCount", label: "문제개수"},
  {value:"name", label: "이름순"},
  {value:"currentMembers", label: "참가 가능 방"},
]
const FilterOrder = ({isOpen, onToggle}: { isOpen: boolean, onToggle: () => void }) => {
  const { sort, setSort, handleSearchTeam } = useTeamFilter();
  const [selected, setSelected] = React.useState(options.find(option => option.value === sort) || options[0]);

  const handleSelected = async (option) => {
    setSelected(option);
    setSort(option.value);
    onToggle();
  }

  useEffect(() => {
    (async () => {
      await handleSearchTeam();
    })();
  }, [sort]);

  return (
    <div className={styles.common__select}>
      <button onClick={onToggle}>↓ {selected.label}</button>
      {isOpen && (
        <ul>
          {options.map((option) => (
            <li key={option.value} onClick={() => handleSelected(option)}>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilterOrder;

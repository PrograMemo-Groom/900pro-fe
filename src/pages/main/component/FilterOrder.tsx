import React from 'react';
import styles from "@/css/main/Layout.module.scss";

const options = [
  {value:"teamLatest", label: "최신순"},
  {value:"teamQuestCount", label: "문제개수"},
  {value:"teamName", label: "이름순"},
  {value:"teamCreatedAt", label: "최신순"},
  {value:"teamJoinCount", label: "참가 가능 방"},
]


const FilterOrder = () => {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(options[0]);

  const handleSelected = (option) => {
    setSelected(option);
    setOpen(false);
  }

  return (
    <div className={styles.common__select}>
      <button onClick={() => setOpen(!open)}>↓ {selected.label}</button>
      {open && (
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

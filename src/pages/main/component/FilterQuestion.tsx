import React from 'react';
import styles from '@/css/main/Layout.module.scss';

const levels = [
  {value:"all", label: "All"},
  {value:"high", label: "난이도 상"},
  {value:"middle", label: "난이도 중"},
  {value:"low", label: "난이도 하"},
]

const FilterQuestion = () => {

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(levels[0]);

  const handleSelected = (option : any) => {
    setSelected(option);
    setOpen(false);
  }

  return (
    <div className={styles.common__select}>
      <button onClick={() => setOpen(!open)}>↓ {selected.label}</button>
      {open && (
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

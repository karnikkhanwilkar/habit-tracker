import React from 'react';
import styles from './StyledCheckbox.module.css';

const StyledCheckbox = ({ checked, onChange, disabled }) => {
  return (
    <div className={styles.content}>
      <label className={styles.checkBox}>
        <input 
          id="ch1" 
          type="checkbox" 
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <div className={styles.transition} />
      </label>
    </div>
  );
};

export default StyledCheckbox;
